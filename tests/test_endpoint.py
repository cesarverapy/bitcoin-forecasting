from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import math
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(title="Bitcoin Power Law Test API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use the same constants and calculation method as main.py
POWER_LAW_CONSTANTS = {
    "A": 0.0058,            # Base coefficient (calibrated to historical data)
    "B": 1.84,             # Growth exponent (determines curve steepness)
    "START_DATE": 1230951600000.0,  # Bitcoin genesis block (January 3, 2009)
    "SCALE": 1.5,          # Final scaling factor
    "MAX_FORECAST_YEARS": 10,  # Maximum years to forecast
    "CONFIDENCE_LEVELS": {
        "90": 1.645,       # 90% confidence interval z-score
        "95": 1.96,        # 95% confidence interval z-score
        "99": 2.576        # 99% confidence interval z-score
    }
}

@app.get("/api/test-calculation/{timestamp}")
async def test_calculation(timestamp: int):
    """Test endpoint to calculate power law price for a single timestamp."""
    logger.debug(f"Received request for timestamp: {timestamp}")
    try:
        # Use linear time scaling like main.py
        days_since_start = (timestamp - POWER_LAW_CONSTANTS["START_DATE"]) / (24 * 60 * 60 * 1000)
        logger.debug(f"Days since start: {days_since_start}")
        
        if days_since_start <= 0:
            return {
                "error": "Timestamp before Bitcoin genesis",
                "timestamp": timestamp,
                "days_since_start": days_since_start,
                "constants": POWER_LAW_CONSTANTS
            }
        
        # Calculate base model price with overflow protection
        try:
            model_price = POWER_LAW_CONSTANTS["A"] * (days_since_start ** POWER_LAW_CONSTANTS["B"])
            if math.isinf(model_price) or math.isnan(model_price):
                raise ValueError("Invalid model price calculation result")
        except OverflowError:
            raise ValueError("Power law calculation overflow")
            
        final_model_price = model_price * POWER_LAW_CONSTANTS["SCALE"]
        
        return {
            "timestamp": timestamp,
            "days_since_start": days_since_start,
            "base_model_price": model_price,
            "final_model_price": final_model_price,
            "constants": POWER_LAW_CONSTANTS
        }
    except Exception as e:
        logger.error(f"Test calculation error: {str(e)}")
        return {
            "error": str(e),
            "timestamp": timestamp,
            "constants": POWER_LAW_CONSTANTS
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="debug") 