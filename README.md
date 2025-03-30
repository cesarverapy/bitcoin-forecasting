# Bitcoin Power Law Forecasting

A web application that uses the Bitcoin Power Law model to forecast Bitcoin prices and analyze deviations from the model.

## Project Structure

```
.
├── app/                    # Frontend Next.js application
├── backend/               # Python FastAPI backend
├── components/            # React components
├── lib/                   # Shared utilities and API functions
└── styles/               # Global styles
```

## Development Setup

### Backend Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the backend directory with:
```
LOG_LEVEL=INFO  # or DEBUG for development
```

4. Run the backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

## API Integration

The frontend is designed to work with the Python backend. The backend provides the following endpoints:

- `/api/bitcoin-data`: Returns historical Bitcoin price data and power law model calculations
- `/api/deviation`: Calculates current deviation from the power law model

## Development Notes

- The application uses Chart.js with the 'chartjs-adapter-date-fns' package for time scales
- Data is refreshed every 5 minutes
- The power law model uses standardized constants across all components
- CORS is configured to allow both localhost:3000 and localhost:3001

## Testing

The test endpoint is available in the `tests` directory for validating power law calculations.

## License

MIT 