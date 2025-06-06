from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from typing import List, Dict, Any
import requests
from pydantic import BaseModel
import uvicorn
from fastapi.responses import RedirectResponse
import math
from config import (
    logger, POWER_LAW_CONSTANTS, BINANCE_BASE_URL,
    MAX_KLINES, CORS_ORIGINS
)
import time

app = FastAPI(title="Bitcoin Power Law API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PriceData(BaseModel):
    timestamp: int
    price: float

class PowerLawData(BaseModel):
    timestamp: int
    actualPrice: float
    modelPrice: float

def validate_power_law_inputs(timestamp_ms: int) -> bool:
    """Validate inputs for power law calculation."""
    try:
        current_time = datetime.now().timestamp() * 1000
        max_future = current_time + (POWER_LAW_CONSTANTS["MAX_FORECAST_YEARS"] * 365 * 24 * 60 * 60 * 1000)
        
        if timestamp_ms < POWER_LAW_CONSTANTS["START_DATE"]:
            raise ValueError("Timestamp before Bitcoin genesis")
        if timestamp_ms > max_future:
            raise ValueError(f"Timestamp too far in future (max {POWER_LAW_CONSTANTS['MAX_FORECAST_YEARS']} years)")
            
        return True
    except Exception as e:
        logger.error(f"Validation error: {str(e)}")
        return False

def calculate_power_law_price(timestamp_ms: int) -> float:
    """Calculate Bitcoin price using Power Law model with validation."""
    try:
        if not validate_power_law_inputs(timestamp_ms):
            return 0
            
        days_since_start = (timestamp_ms - POWER_LAW_CONSTANTS["START_DATE"]) / (24 * 60 * 60 * 1000)
        
        if days_since_start <= 0:
            return 0
            
        try:
            model_price = POWER_LAW_CONSTANTS["A"] * (days_since_start ** POWER_LAW_CONSTANTS["B"])
            if math.isinf(model_price) or math.isnan(model_price):
                raise ValueError("Invalid model price calculation result")
        except OverflowError:
            raise ValueError("Power law calculation overflow")
            
        return model_price * POWER_LAW_CONSTANTS["SCALE"]
    except Exception as e:
        logger.error(f"Price calculation error: {str(e)}")
        return 0

def validate_kline(kline: List[Any]) -> bool:
    """Validate the structure of a kline data point."""
    if not isinstance(kline, list) or len(kline) < 5:
        return False
    try:
        timestamp = int(kline[0])
        price = float(kline[4])
        return timestamp > 0 and price > 0
    except (ValueError, TypeError):
        return False

def fetch_historical_data() -> List[Dict[str, Any]]:
    """Fetch historical Bitcoin price data from Binance API."""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=10*365)
        
        all_klines = []
        current_start = start_date
        retry_count = 0
        max_retries = 3
        
        while current_start < end_date and retry_count < max_retries:
            try:
                url = f"{BINANCE_BASE_URL}/klines"
                params = {
                    "symbol": "BTCUSDT",
                    "interval": "1d",
                    "startTime": int(current_start.timestamp() * 1000),
                    "endTime": int(end_date.timestamp() * 1000),
                    "limit": MAX_KLINES
                }
                
                response = requests.get(url, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()
                
                if not data:
                    break
                    
                all_klines.extend(data)
                
                if len(data) < MAX_KLINES:
                    break
                current_start = datetime.fromtimestamp(data[-1][0] / 1000) + timedelta(days=1)
                retry_count = 0
                
            except requests.exceptions.RequestException as e:
                retry_count += 1
                if retry_count >= max_retries:
                    logger.error(f"Max retries reached while fetching data: {str(e)}")
                    raise
                logger.warning(f"Retry {retry_count} after error: {str(e)}")
                time.sleep(2 ** retry_count)
        
        if not all_klines:
            raise HTTPException(status_code=404, detail="No historical data available")
        
        power_law_data = []
        all_klines.sort(key=lambda x: x[0])
        
        window_size = 7
        prices = [float(k[4]) for k in all_klines]
        smoothed_prices = np.convolve(prices, np.ones(window_size)/window_size, mode='valid')
        padding = [prices[0]] * (len(prices) - len(smoothed_prices))
        smoothed_prices = np.concatenate([padding, smoothed_prices])
        
        for i, kline in enumerate(all_klines):
            if not validate_kline(kline):
                continue
                
            timestamp = int(kline[0])
            price = smoothed_prices[i]
            model_price = calculate_power_law_price(timestamp)
            
            power_law_data.append({
                "timestamp": timestamp,
                "actualPrice": round(price, 2),
                "modelPrice": round(model_price, 2)
            })
        
        if not power_law_data:
            raise HTTPException(status_code=404, detail="No valid data points found")
            
        power_law_data.sort(key=lambda x: x["timestamp"])
        return power_law_data
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching data from Binance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching data from Binance: {str(e)}")
    except Exception as e:
        logger.error(f"Error processing data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing data: {str(e)}")

@app.get("/")
async def root():
    """Redirect to API documentation"""
    return RedirectResponse(url="/docs")

@app.get("/api/bitcoin-data")
async def get_bitcoin_data():
    """Get Bitcoin price data and power law model calculations."""
    try:
        data = fetch_historical_data()
        if not data:
            raise HTTPException(status_code=404, detail="No data available")
            
        formatted_data = {
            "prices": [[d["timestamp"], float(d["actualPrice"])] for d in data],
            "powerLawData": data
        }
            
        return formatted_data
    except Exception as e:
        logger.error(f"Error in get_bitcoin_data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/deviation")
async def get_deviation():
    """Calculate current deviation from power law model."""
    try:
        data = fetch_historical_data()
        if not data:
            raise HTTPException(status_code=404, detail="No data available")
        
        latest_data = data[-1]
        deviation = ((latest_data["actualPrice"] - latest_data["modelPrice"]) / latest_data["modelPrice"]) * 100
        
        return {
            "deviation": deviation,
            "currentPrice": latest_data["actualPrice"],
            "modelPrice": latest_data["modelPrice"]
        }
    except Exception as e:
        logger.error(f"Error in get_deviation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/forecast/{year}")
async def get_forecast(year: int):
    """Get price forecast for a specific year using historical deviation patterns."""
    try:
        current_year = datetime.now().year
        if year < current_year:
            raise HTTPException(status_code=400, detail="Forecast year must be in the future")
        if year > current_year + POWER_LAW_CONSTANTS["MAX_FORECAST_YEARS"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Forecast limited to {POWER_LAW_CONSTANTS['MAX_FORECAST_YEARS']} years"
            )
            
        # Get historical data to analyze deviation patterns
        historical_data = fetch_historical_data()
        if not historical_data:
            raise HTTPException(status_code=404, detail="No historical data available")
            
        # Calculate historical deviations with time weighting
        deviations = []
        weights = []
        latest_timestamp = max(d["timestamp"] for d in historical_data)
        
        for data_point in historical_data:
            deviation = ((data_point["actualPrice"] - data_point["modelPrice"]) / data_point["modelPrice"]) * 100
            # More weight to recent data (exponential decay)
            time_diff = (latest_timestamp - data_point["timestamp"]) / (365 * 24 * 60 * 60 * 1000)
            weight = math.exp(-0.5 * time_diff)  # Half-life of 1 year
            deviations.append(deviation)
            weights.append(weight)
            
        # Calculate weighted statistics
        weights = np.array(weights)
        weights = weights / np.sum(weights)  # Normalize weights
        avg_deviation = np.average(deviations, weights=weights)
        
        # Calculate weighted standard deviation
        variance = np.average((deviations - avg_deviation) ** 2, weights=weights)
        std_deviation = math.sqrt(variance)
        
        # Calculate target date and base projection
        target_date = int(datetime(year, 1, 1).timestamp() * 1000)
        base_projection = calculate_power_law_price(target_date)
        
        if base_projection == 0:
            raise HTTPException(status_code=400, detail="Invalid projection calculation")
            
        # Calculate confidence intervals using z-scores
        intervals = {}
        for confidence, z_score in POWER_LAW_CONSTANTS["CONFIDENCE_LEVELS"].items():
            lower = base_projection * (1 + (avg_deviation - z_score * std_deviation) / 100)
            upper = base_projection * (1 + (avg_deviation + z_score * std_deviation) / 100)
            intervals[confidence] = {
                "lower": max(0, lower),
                "upper": max(upper, lower)
            }
        
        return {
            "baseProjection": base_projection,
            "lowerBound": intervals["90"]["lower"],  # Default to 90% CI
            "upperBound": intervals["90"]["upper"],
            "historicalDeviation": {
                "average": avg_deviation,
                "standardDeviation": std_deviation
            },
            "confidenceIntervals": intervals,
            "metadata": {
                "forecastYear": year,
                "yearsAhead": year - current_year,
                "dataPoints": len(historical_data),
                "effectiveSampleSize": 1 / sum(w * w for w in weights)  # Effective sample size with weights
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Forecast error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calculating forecast: {str(e)}")

@app.get("/api/test-calculation/{timestamp}")
async def test_calculation(timestamp: int):
    """Test endpoint to calculate power law price for a single timestamp."""
    days_since_start = (timestamp - POWER_LAW_CONSTANTS["START_DATE"]) / (24 * 60 * 60 * 1000)
    model_price = POWER_LAW_CONSTANTS["A"] * (days_since_start ** POWER_LAW_CONSTANTS["B"])
    final_model_price = model_price * POWER_LAW_CONSTANTS["SCALE"]
    
    return {
        "timestamp": timestamp,
        "days_since_start": days_since_start,
        "base_model_price": model_price,
        "final_model_price": final_model_price,
        "constants": POWER_LAW_CONSTANTS
    }

@app.get("/api/constants")
async def get_constants():
    """Get the current Power Law constants."""
    return POWER_LAW_CONSTANTS

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 