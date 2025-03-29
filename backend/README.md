# Bitcoin Power Law Backend

This is the backend service for the Bitcoin Power Law Analysis application. It provides real-time Bitcoin price data and power law model calculations.

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file (optional, for future API keys):
```bash
touch .env
```

## Running the Server

Start the server with:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will be available at `http://localhost:8000`

## API Endpoints

- `GET /api/bitcoin-data`: Get historical Bitcoin price data and power law model calculations
- `GET /api/deviation`: Get current deviation from power law model
- `GET /api/forecast/{year}`: Get price forecast for a specific year

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development

The backend uses:
- FastAPI for the web framework
- CoinGecko API for Bitcoin price data
- Pandas and NumPy for data processing
- Pydantic for data validation

## Error Handling

The backend includes comprehensive error handling and will return appropriate HTTP status codes and error messages when something goes wrong. 