"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import PowerLawChart from "@/components/power-law-chart"
import DeviationAlert from "@/components/deviation-alert"
import ForecastingModule from "@/components/forecasting-module"
import EducationalCards from "@/components/educational-cards"
import TimeMachineSlider from "@/components/time-machine-slider"
import ExportShareBar from "@/components/export-share-bar"
import { fetchBitcoinData } from "@/lib/api"
import { calculatePowerLawDeviation } from "@/lib/calculations"

// Note: This project requires the 'chartjs-adapter-date-fns' package for time scales in Chart.js
// BACKEND INTEGRATION NOTE:
// This frontend is designed to work with a Python backend.
// To connect to your Python backend:
// 1. Update the fetchBitcoinData function in lib/api.ts to call your Python API endpoints
// 2. Ensure your Python API returns data in the same format as the mock data

export default function Home() {
  const [bitcoinData, setBitcoinData] = useState<any>(null)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [previousHalvingPrice, setPreviousHalvingPrice] = useState<number | null>(null)
  const [deviation, setDeviation] = useState<number | null>(null)
  const [timeframe, setTimeframe] = useState<string>("5Y")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Fetch Bitcoin price data
        const data = await fetchBitcoinData()
        setBitcoinData(data)

        // Set current price
        if (data && data.prices && data.prices.length > 0) {
          setCurrentPrice(data.prices[data.prices.length - 1][1])
        }

        // Calculate previous halving price
        if (data && data.powerLawData) {
          const currentDate = new Date()
          const currentYear = currentDate.getFullYear()
          const previousHalvingYear = currentYear - 4 // Aproximadamente cada 4 años
          
          const previousHalvingData = data.powerLawData.find((d: any) => {
            const dataDate = new Date(d.timestamp)
            return dataDate.getFullYear() === previousHalvingYear
          })

          if (previousHalvingData) {
            setPreviousHalvingPrice(previousHalvingData.actualPrice)
          }
        }

        // Calculate deviation from Power Law model
        const dev = calculatePowerLawDeviation(data)
        setDeviation(dev)
      } catch (error) {
        console.error("Error loading Bitcoin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Refresh data every 5 minutes
    const intervalId = setInterval(loadData, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe)
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Header currentPrice={currentPrice} previousHalvingPrice={previousHalvingPrice} />

      <div className="container px-4 py-8 mx-auto">
        <DeviationAlert deviation={deviation} />

        <section className="my-8">
          <PowerLawChart
            data={bitcoinData}
            timeframe={timeframe}
            onTimeframeChange={handleTimeframeChange}
            isLoading={isLoading}
          />
        </section>

        <section className="my-12">
          <ForecastingModule />
        </section>

        <section className="my-12">
          <EducationalCards />
        </section>

        <section className="my-12">
          <TimeMachineSlider data={bitcoinData} />
        </section>

        <section className="my-8">
          <ExportShareBar currentPrice={currentPrice} deviation={deviation} />
        </section>
      </div>
    </main>
  )
}

