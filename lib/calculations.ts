import { fetchPowerLawConstants } from './api';

// Constants for the Power Law model
// NOTE: These calculations could be done in your Python backend instead
const POWER_LAW_CONSTANTS = {
  A: 0.0058,            // Base coefficient (calibrated to historical data)
  B: 1.84,             // Growth exponent (determines curve steepness)
  START_DATE: new Date("2009-01-03").getTime(), // Bitcoin genesis block date
  SCALE: 1.5,          // Final scaling factor
  MAX_FORECAST_YEARS: 10,  // Maximum years to forecast
  CONFIDENCE_LEVELS: {
    "90": 1.645,       // 90% confidence interval z-score
    "95": 1.96,        // 95% confidence interval z-score
    "99": 2.576        // 99% confidence interval z-score
  }
}

// Calculate the current deviation from the Power Law model
// This could be calculated in your Python backend
export async function calculatePowerLawDeviation(data: any) {
  if (!data || !data.powerLawData || data.powerLawData.length === 0) {
    return null;
  }

  // Get the most recent data point
  const latestData = data.powerLawData[data.powerLawData.length - 1];

  // Calculate the percentage deviation
  const deviation = ((latestData.actualPrice - latestData.modelPrice) / latestData.modelPrice) * 100;

  return deviation;
}

// Calculate future price projections based on the Power Law model
// This could be calculated in your Python backend
export async function calculateFutureProjections(year: number) {
  try {
    const constants = await fetchPowerLawConstants();
    const targetDate = new Date(year, 0, 1); // January 1st of the target year
    const daysSinceStart = (targetDate.getTime() - constants.START_DATE) / (1000 * 60 * 60 * 24);

    // Calculate the base projection using the Power Law formula
    const baseProjection = constants.A * Math.pow(daysSinceStart, constants.B) * constants.SCALE;

    // Calculate the range with 90% confidence interval
    const lowerBound = baseProjection * 0.7; // 30% below the model
    const upperBound = baseProjection * 1.3; // 30% above the model

    return {
      baseProjection,
      lowerBound,
      upperBound,
    };
  } catch (error) {
    console.error("Error calculating future projections:", error);
    return null;
  }
}

// Format price as USD
// Frontend formatting function
export function formatUSD(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Format date - handles both Date objects and timestamps
export function formatDate(dateOrTimestamp: Date | number) {
  const date = dateOrTimestamp instanceof Date ? dateOrTimestamp : new Date(dateOrTimestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

