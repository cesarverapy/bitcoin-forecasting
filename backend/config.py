import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging based on environment
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
logging.basicConfig(level=getattr(logging, LOG_LEVEL))
logger = logging.getLogger(__name__)

# Power Law constants - standardized across all components
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

# API Configuration
BINANCE_BASE_URL = "https://api.binance.com/api/v3"
MAX_KLINES = 1000  # Maximum number of klines per request
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001"] 