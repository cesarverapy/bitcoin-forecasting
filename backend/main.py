from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from typing import List, Dict, Any
import requests
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import uvicorn
from fastapi.responses import RedirectResponse

# Load environment variables
load_dotenv()

app = FastAPI(title="Bitcoin Power Law API")
# Cigure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Allow both ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Power Law constants - recalibrated based on historical BTC prices
POWER_LAW_CONSTANTS = {
    "A": 0.0147,        # Base coefficient - adjusted for better historical fit
    "B": 1.78,          # Growth exponent - calibrated to match long-term trend
    "START_DATE": datetime(2009, 1, 3).timestamp() * 1000,  # Bitcoin genesis block date
    "SCALE": 1.0        # No additional scaling needed with adjusted constants
}

# Binance API configuration
BINANCE_BASE_URL = "https://api.binance.com/api/v3"
MAX_KLINES = 1000  # Maximum number of klines per request

class PriceData(BaseModel):
    timestamp: int
    price: float

class PowerLawData(BaseModel):
    timestamp: int
    actualPrice: float
    modelPrice: float

def calculate_power_law_price(days_since_start: float) -> float:
    """Calculate the power law model price for a given number of days since start."""
    try:
        if days_since_start <= 0:
            return 0.0
            
        # Calculate power law price with adjusted constants
        model_price = POWER_LAW_CONSTANTS["A"] * (days_since_start ** POWER_LAW_CONSTANTS["B"])
        return model_price * POWER_LAW_CONSTANTS["SCALE"]
    except Exception as e:
        print(f"Error calculating power law price: {e}")
        return 0.0

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
        # Get data for the last 5 years
        end_date = datetime.now()
        start_date = end_date - timedelta(days=5*365)
        
        all_klines = []
        current_start = start_date
        
        # Fetch data in chunks to handle the 1000 klines limit
        while current_start < end_date:
            # Binance API endpoint for historical klines/candlestick data
            url = f"{BINANCE_BASE_URL}/klines"
            params = {
                "symbol": "BTCUSDT",
                "interval": "1d",  # Daily data
                "startTime": int(current_start.timestamp() * 1000),
                "endTime": int(end_date.timestamp() * 1000),
                "limit": MAX_KLINES
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if not data:
                break
                
            all_klines.extend(data)
            
            # Update start time for next chunk
            if len(data) < MAX_KLINES:
                break
            current_start = datetime.fromtimestamp(data[-1][0] / 1000) + timedelta(days=1)
        
        if not all_klines:
            raise HTTPException(status_code=404, detail="No historical data available")
        
        # Process the data
        power_law_data = []
        
        # Sort klines by timestamp to ensure chronological order
        all_klines.sort(key=lambda x: x[0])
        
        for kline in all_klines:
            if not validate_kline(kline):
                continue
                
            timestamp = int(kline[0])  # Open time
            price = float(kline[4])  # Close price
            
            days_since_start = (timestamp - POWER_LAW_CONSTANTS["START_DATE"]) / (1000 * 60 * 60 * 24)
            model_price = calculate_power_law_price(days_since_start)
            
            # Ensure both actual and model prices are properly formatted
            power_law_data.append({
                "timestamp": timestamp,
                "actualPrice": round(price, 2),  # Round to 2 decimal places
                "modelPrice": round(model_price, 2)  # Round to 2 decimal places
            })
        
        if not power_law_data:
            raise HTTPException(status_code=404, detail="No valid data points found")
            
        # Sort final data by timestamp
        power_law_data.sort(key=lambda x: x["timestamp"])
            
        return power_law_data
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data from Binance: {str(e)}")
    except Exception as e:
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
            
        # Ensure data is properly formatted for the frontend
        formatted_data = {
            "prices": [[d["timestamp"], float(d["actualPrice"])] for d in data],  # Ensure price is float
            "powerLawData": data
        }
            
        return formatted_data
    except Exception as e:
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
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/forecast/{year}")
async def get_forecast(year: int):
    """Get price forecast for a specific year."""
    try:
        if year < datetime.now().year:
            raise HTTPException(status_code=400, detail="Forecast year must be in the future")
            
        target_date = datetime(year, 1, 1)
        days_since_start = (target_date.timestamp() * 1000 - POWER_LAW_CONSTANTS["START_DATE"]) / (1000 * 60 * 60 * 24)
        
        base_projection = calculate_power_law_price(days_since_start)
        
        return {
            "baseProjection": base_projection,
            "lowerBound": base_projection * 0.7,
            "upperBound": base_projection * 1.3
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 