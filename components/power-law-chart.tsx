"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { formatDate, formatUSD } from "@/lib/calculations"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  type ChartOptions,
} from "chart.js"
import "chartjs-adapter-date-fns" // Import the date-fns adapter for time scale

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  TimeScale, // Register TimeScale
  Title,
  Tooltip,
  Legend,
)

interface PowerLawChartProps {
  data: any
  timeframe: string
  onTimeframeChange: (timeframe: string) => void
  isLoading: boolean
}

export default function PowerLawChart({ data, timeframe, onTimeframeChange, isLoading }: PowerLawChartProps) {
  const [useLogScale, setUseLogScale] = useState(true)
  const [chartData, setChartData] = useState<any>(null)
  const [filteredData, setFilteredData] = useState<any[]>([])
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (!data || !data.powerLawData) return

    // Filter data based on selected timeframe
    let filtered = [...data.powerLawData]
    const now = new Date().getTime()

    switch (timeframe) {
      case "1W":
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000
        filtered = filtered.filter((d: any) => d.timestamp >= oneWeekAgo)
        break
      case "1M":
        const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000
        filtered = filtered.filter((d: any) => d.timestamp >= oneMonthAgo)
        break
      case "1Y":
        const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000
        filtered = filtered.filter((d: any) => d.timestamp >= oneYearAgo)
        break
      case "5Y":
        const fiveYearsAgo = now - 5 * 365 * 24 * 60 * 60 * 1000
        filtered = filtered.filter((d: any) => d.timestamp >= fiveYearsAgo)
        break
      case "MAX":
        // No filtering needed for maximum time period
        break
    }

    setFilteredData(filtered)

    // Prepare data for Chart.js
    const labels = filtered.map((d: any) => new Date(d.timestamp))

    setChartData({
      labels,
      datasets: [
        {
          label: "BTC Price",
          data: filtered.map((d: any) => ({
            x: new Date(d.timestamp),
            y: d.actualPrice,
          })),
          borderColor: "#3b82f6", // Blue
          backgroundColor: "transparent",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.1,
          order: 1,
        },
        {
          label: "Power Law Model",
          data: filtered.map((d: any) => ({
            x: new Date(d.timestamp),
            y: d.modelPrice,
          })),
          borderColor: "#F7931A", // Bitcoin orange
          backgroundColor: "transparent",
          borderWidth: 1.5,
          tension: 0.1,
          borderDash: [3, 3],
          pointRadius: 0,
          pointHoverRadius: 0,
          order: 2,
        },
        {
          label: "4-Year Cycles Min/Max",
          data: filtered.map((d: any) => ({
            x: new Date(d.timestamp),
            y: d.modelPrice * 1.3, // Max value
          })),
          borderColor: "transparent",
          backgroundColor: "rgba(59, 130, 246, 0.15)", // Light blue with more opacity
          fill: {
            target: {
              value: filtered.map((d: any) => d.modelPrice * 0.7) // Min value
            }
          },
          pointRadius: 0,
          tension: 0.1,
          order: 3,
        },
        {
          label: "Peak Decay (Upper)",
          data: filtered.map((d: any) => ({
            x: new Date(d.timestamp),
            y: d.modelPrice * 1.3,
          })),
          borderColor: "#22c55e", // Green color
          borderWidth: 1.5,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          order: 4,
        },
        {
          label: "Power Law (Lower)",
          data: filtered.map((d: any) => ({
            x: new Date(d.timestamp),
            y: d.modelPrice * 0.7,
          })),
          borderColor: "#ef4444", // Red color
          borderWidth: 1.5,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          order: 5,
        }
      ],
    })
  }, [data, timeframe])

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: timeframe === "1W" ? "day" : 
                timeframe === "1M" ? "day" : 
                timeframe === "1Y" ? "month" : "year",
          displayFormats: {
            day: "MMM dd",
            month: "MMM yyyy",
            year: "yyyy",
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          display: true
        },
        ticks: {
          maxRotation: 0,
          color: "rgba(255, 255, 255, 0.7)"
        }
      },
      y: {
        type: "logarithmic",
        title: {
          display: true,
          text: "Price (USD)",
          color: "rgba(255, 255, 255, 0.9)"
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          display: true
        },
        ticks: {
          callback: (value) => formatUSD(value as number),
          color: "rgba(255, 255, 255, 0.7)"
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          color: "rgba(255, 255, 255, 0.9)",
          padding: 20,
          filter: (item) => item.text !== "4-Year Cycles Min/Max" // Hide the area dataset from legend
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.dataset.label === "4-Year Cycles Min/Max") return ""
            const label = context.dataset.label || ""
            const value = formatUSD(context.parsed.y)
            return `${label}: ${value}`
          },
          title: (tooltipItems) => formatDate(tooltipItems[0].parsed.x),
          footer: (tooltipItems) => {
            const actualPrice = tooltipItems[0].parsed.y
            const modelPrice = tooltipItems[1]?.parsed.y || 0

            if (modelPrice === 0) return ""

            const deviation = ((actualPrice - modelPrice) / modelPrice) * 100
            const deviationText = deviation > 0 ? "above" : "below"

            return `BTC is ${Math.abs(deviation).toFixed(2)}% ${deviationText} model`
          },
        },
      },
    },
  }

  const toggleScale = () => {
    setUseLogScale(!useLogScale)
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <CardTitle>Bitcoin Price vs. Power Law Model</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={toggleScale} className="text-xs">
            {useLogScale ? "Linear Scale" : "Log Scale"}
          </Button>
          <Tabs defaultValue={timeframe} onValueChange={onTimeframeChange}>
            <TabsList className="grid grid-cols-5 w-[300px]">
              <TabsTrigger value="1W">1W</TabsTrigger>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="1Y">1Y</TabsTrigger>
              <TabsTrigger value="5Y">5Y</TabsTrigger>
              <TabsTrigger value="MAX">MAX</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : chartData ? (
            <Line ref={chartRef} data={chartData} options={chartOptions} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

