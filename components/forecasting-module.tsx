"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatUSD } from "@/lib/calculations"

export default function ForecastingModule() {
  const [selectedYear, setSelectedYear] = useState("2025")
  const [projection, setProjection] = useState<{
    baseProjection: number
    lowerBound: number
    upperBound: number
    historicalDeviation?: {
      average: number
      standardDeviation: number
    }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchForecast = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`http://localhost:8000/api/forecast/${selectedYear}`)
        if (!response.ok) {
          throw new Error('Failed to fetch forecast')
        }
        const data = await response.json()
        setProjection(data)
      } catch (error) {
        console.error('Error fetching forecast:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchForecast()
  }, [selectedYear])

  const handleYearChange = (value: string) => {
    setSelectedYear(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bitcoin Price Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Projected price for</span>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2030">2030</SelectItem>
                <SelectItem value="2035">2035</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-muted-foreground">Loading forecast...</div>
          ) : projection ? (
            <div className="bg-secondary/50 rounded-lg p-4 w-full">
              <h3 className="text-lg font-semibold mb-2">
                BTC projected to hit{" "}
                <span className="text-bitcoin-orange">
                  {formatUSD(projection.lowerBound)} - {formatUSD(projection.upperBound)}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Base projection: {formatUSD(projection.baseProjection)} (90% confidence interval)
              </p>
              {projection.historicalDeviation && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Historical deviation: {projection.historicalDeviation.average.toFixed(1)}%</p>
                  <p>Standard deviation: {projection.historicalDeviation.standardDeviation.toFixed(1)}%</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">Based on Power Law model and historical deviation patterns</p>
            </div>
          ) : (
            <div className="text-muted-foreground">No forecast available</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

