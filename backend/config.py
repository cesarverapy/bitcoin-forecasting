import logging
import os
from dotenv import load_dotenv
import numpy as np
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure logging based on environment
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
logging.basicConfig(level=getattr(logging, LOG_LEVEL))
logger = logging.getLogger(__name__)

def calculate_power_law_constants():
    """
    Calculate Power Law constants based on historical Bitcoin data.
    Returns a dictionary with the calculated constants.
    """
    try:
        # Bitcoin genesis block date (January 3, 2009)
        START_DATE = 1230951600000.0
        
        # Historical price points (example data - you should replace with real data)
        # Format: (days_since_genesis, price)
        historical_data = [
            (0, 0.0001),      # Genesis block
            (365, 0.05),      # 1 year after
            (730, 0.30),      # 2 years after
            (1095, 5.00),     # 3 years after
            (1460, 30.00),    # 4 years after
            (1825, 200.00),   # 5 years after
            (2190, 1000.00),  # 6 years after
            (2555, 5000.00),  # 7 years after
            (2920, 20000.00), # 8 years after
            (3285, 40000.00), # 9 years after
            (3650, 60000.00)  # 10 years after
        ]
        
        # Extract x (days) and y (price) values
        x = np.array([point[0] for point in historical_data])
        y = np.array([point[1] for point in historical_data])
        
        # Take logarithm of both sides for linear regression
        log_x = np.log(x)
        log_y = np.log(y)
        
        # Perform linear regression
        slope, intercept = np.polyfit(log_x, log_y, 1)
        
        # Calculate constants
        A = np.exp(intercept)  # Base coefficient
        B = slope             # Growth exponent
        
        # Calculate scale factor to match current market conditions
        current_days = (datetime.now().timestamp() * 1000 - START_DATE) / (24 * 60 * 60 * 1000)
        current_price = A * (current_days ** B)
        SCALE = 1.5  # This could be adjusted based on market conditions
        
        return {
            "A": float(A),            # Base coefficient
            "B": float(B),            # Growth exponent
            "START_DATE": START_DATE,  # Bitcoin genesis block
            "SCALE": SCALE,           # Final scaling factor
            "MAX_FORECAST_YEARS": 10,  # Maximum years to forecast
            "CONFIDENCE_LEVELS": {
                "90": 1.645,          # 90% confidence interval z-score
                "95": 1.96,           # 95% confidence interval z-score
                "99": 2.576           # 99% confidence interval z-score
            }
        }
    except Exception as e:
        logger.error(f"Error calculating Power Law constants: {str(e)}")
        # Fallback to default values if calculation fails
        return {
            "A": 0.0058,
            "B": 1.84,
            "START_DATE": 1230951600000.0,
            "SCALE": 1.5,
            "MAX_FORECAST_YEARS": 10,
            "CONFIDENCE_LEVELS": {
                "90": 1.645,
                "95": 1.96,
                "99": 2.576
            }
        }

# Calculate Power Law constants
POWER_LAW_CONSTANTS = calculate_power_law_constants()

# API Configuration
BINANCE_BASE_URL = "https://api.binance.com/api/v3"
MAX_KLINES = 1000  # Maximum number of klines per request
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001"] 