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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchBitcoinData()
        setBitcoinData(data)

        if (data?.prices?.length > 0) {
          setCurrentPrice(data.prices[data.prices.length - 1][1])
          
          // Find the price closest to May 11, 2020 (previous halving date)
          const previousHalvingDate = new Date("2020-05-11").getTime()
          const closestPrice = data.prices.reduce((closest: [number, number], current: [number, number]) => {
            const closestDiff = Math.abs(closest[0] - previousHalvingDate)
            const currentDiff = Math.abs(current[0] - previousHalvingDate)
            return currentDiff < closestDiff ? current : closest
          })
          setPreviousHalvingPrice(closestPrice[1])
        }

        const dev = await calculatePowerLawDeviation(data)
        setDeviation(dev)
      } catch (error) {
        setError("Failed to load Bitcoin data. Please try again later.")
        console.error("Error loading Bitcoin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

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