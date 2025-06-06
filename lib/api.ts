const API_BASE_URL = "http://localhost:8000/api";

// Function to fetch Power Law constants from the backend
export async function fetchPowerLawConstants() {
  const response = await fetch(`${API_BASE_URL}/constants`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// Function to fetch Bitcoin price data from the backend
export async function fetchBitcoinData() {
  try {
    console.log("Fetching Bitcoin data from:", `${API_BASE_URL}/bitcoin-data`);
    const response = await fetch(`${API_BASE_URL}/bitcoin-data`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Successfully fetched Bitcoin data");
    return data;
  } catch (error) {
    console.error("Error fetching Bitcoin data:", error);
    // Fallback to mock data if backend is not available
    console.log("Falling back to mock data");
    return generateMockData();
  }
}

// Function to fetch current deviation from power law model
export async function fetchDeviation() {
  try {
    console.log("Fetching deviation data from:", `${API_BASE_URL}/deviation`);
    const response = await fetch(`${API_BASE_URL}/deviation`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Successfully fetched deviation data");
    return data;
  } catch (error) {
    console.error("Error fetching deviation:", error);
    return null;
  }
}

// Function to fetch price forecast for a specific year
export async function fetchForecast(year: number) {
  try {
    console.log("Fetching forecast data from:", `${API_BASE_URL}/forecast/${year}`);
    const response = await fetch(`${API_BASE_URL}/forecast/${year}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Successfully fetched forecast data");
    return data;
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return null;
  }
}

// Fallback mock data generator (keep this for development/testing)
async function generateMockData() {
  const constants = await fetchPowerLawConstants();
  const now = new Date();
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(now.getFullYear() - 5);

  const startTimestamp = fiveYearsAgo.getTime();
  const endTimestamp = now.getTime();

  const prices: [number, number][] = [];
  const powerLawData: any[] = [];

  // Generate data points (one per week)
  for (let timestamp = startTimestamp; timestamp <= endTimestamp; timestamp += 7 * 24 * 60 * 60 * 1000) {
    const daysSinceStart = (timestamp - constants.START_DATE) / (1000 * 60 * 60 * 24);
    const modelPrice = constants.A * Math.pow(daysSinceStart, constants.B) * constants.SCALE;

    // Add some randomness to the actual price (fluctuating around the model)
    const randomFactor = 0.7 + Math.random() * 0.6; // Between 0.7 and 1.3
    const actualPrice = modelPrice * randomFactor;

    prices.push([timestamp, actualPrice]);
    powerLawData.push({
      timestamp,
      actualPrice,
      modelPrice,
    });
  }

  return {
    prices,
    powerLawData,
  };
}

