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
  type ChartData,
  type ChartDataset,
  type Point,
} from "chart.js"
import "chartjs-adapter-date-fns" // Import the date-fns adapter for time scale

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  TimeScale,
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

interface DataPoint {
  timestamp: number
  actualPrice: number
  modelPrice: number
}

type ChartDatasetType = ChartDataset<"line", (Point | null)[]>

export default function PowerLawChart({ data, timeframe, onTimeframeChange, isLoading }: PowerLawChartProps) {
  const [useLogScale, setUseLogScale] = useState(true)
  const [chartData, setChartData] = useState<ChartData<"line"> | null>(null)
  const chartRef = useRef<any>(null)
  const [chartMode, setChartMode] = useState<"basic" | "advanced">("basic")

  // Advanced options state
  const [showPowerLawBands, setShowPowerLawBands] = useState(false)
  const [show200MA, setShow200MA] = useState(false)
  const [showHalvingEvents, setShowHalvingEvents] = useState(false)
  const [showWeeklyMA, setShowWeeklyMA] = useState(false)
  const [showPowerLawSupport, setShowPowerLawSupport] = useState(false)

  useEffect(() => {
    if (!data || !data.powerLawData) return

    // Filter data based on selected timeframe
    let filteredData = [...data.powerLawData] as DataPoint[]
    const now = new Date().getTime()

    if (timeframe === "1W") {
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000
      filteredData = filteredData.filter((d) => d.timestamp >= oneWeekAgo)
    } else if (timeframe === "1M") {
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000
      filteredData = filteredData.filter((d) => d.timestamp >= oneMonthAgo)
    } else if (timeframe === "1Y") {
      const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000
      filteredData = filteredData.filter((d) => d.timestamp >= oneYearAgo)
    } else if (timeframe === "5Y") {
      const fiveYearsAgo = now - 5 * 365 * 24 * 60 * 60 * 1000
      filteredData = filteredData.filter((d) => d.timestamp >= fiveYearsAgo)
    }

    // Prepare data for Chart.js
    const labels = filteredData.map((d) => new Date(d.timestamp))

    // Calculate 200-day moving average if needed
    const ma200Data: (number | null)[] = []
    if (chartMode === "advanced" && show200MA) {
      const windowSize = 200
      for (let i = 0; i < filteredData.length; i++) {
        if (i < windowSize - 1) {
          ma200Data.push(null)
        } else {
          let sum = 0
          for (let j = i - windowSize + 1; j <= i; j++) {
            sum += filteredData[j].actualPrice
          }
          ma200Data.push(sum / windowSize)
        }
      }
    }

    // Create datasets array - Basic mode always shows these
    const datasets: ChartDatasetType[] = [
      {
        label: "BTC Price",
        data: filteredData.map((d) => ({
          x: d.timestamp,
          y: d.actualPrice,
        })),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: "Power Law Model",
        data: filteredData.map((d) => ({
          x: d.timestamp,
          y: d.modelPrice,
        })),
        borderColor: "#F7931A",
        backgroundColor: "rgba(247, 147, 26, 0.1)",
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ]

    // Add Power Law deviation bands if in advanced mode and option is selected
    if (chartMode === "advanced" && showPowerLawBands) {
      datasets.push({
        label: "Upper Band (+30%)",
        data: filteredData.map((d) => ({
          x: d.timestamp,
          y: d.modelPrice * 1.3,
        })),
        borderColor: "rgba(34, 197, 94, 0.5)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 1,
        borderDash: [3, 3],
        pointRadius: 0,
        pointHoverRadius: 0,
      })

      datasets.push({
        label: "Lower Band (-30%)",
        data: filteredData.map((d) => ({
          x: d.timestamp,
          y: d.modelPrice * 0.7,
        })),
        borderColor: "rgba(239, 68, 68, 0.5)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 1,
        borderDash: [3, 3],
        pointRadius: 0,
        pointHoverRadius: 0,
      })
    }

    // Add Power Law Support line if enabled
    if (chartMode === "advanced" && showPowerLawSupport) {
      datasets.push({
        label: "Power Law Support",
        data: filteredData.map((d) => ({
          x: d.timestamp,
          y: d.modelPrice * 0.5,
        })),
        borderColor: "#fbbf24",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [8, 4],
        pointRadius: 0,
        pointHoverRadius: 0,
      })
    }

    // Add Weekly MA (50-week) if enabled
    if (chartMode === "advanced" && showWeeklyMA) {
      const windowSize = 50 * 7
      const weeklyMAData: (number | null)[] = []

      for (let i = 0; i < filteredData.length; i++) {
        if (i < windowSize - 1) {
          weeklyMAData.push(null)
        } else {
          let sum = 0
          for (let j = i - windowSize + 1; j <= i; j++) {
            sum += filteredData[j].actualPrice
          }
          weeklyMAData.push(sum / windowSize)
        }
      }

      datasets.push({
        label: "50-Week MA",
        data: filteredData.map((d, i) => ({
          x: d.timestamp,
          y: weeklyMAData[i] ?? 0,
        })),
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
      })
    }

    // Add 200MA dataset if enabled
    if (chartMode === "advanced" && show200MA) {
      datasets.push({
        label: "200-Day MA",
        data: filteredData.map((d, i) => ({
          x: d.timestamp,
          y: ma200Data[i] ?? 0,
        })),
        borderColor: "#8b5cf6",
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderDash: [1, 1],
        pointRadius: 0,
        pointHoverRadius: 0,
      })
    }

    // Add halving events as vertical lines if enabled
    if (chartMode === "advanced" && showHalvingEvents && data?.powerLawData?.length > 0) {
      const halvingDates = [
        new Date("2012-11-28").getTime(),
        new Date("2016-07-09").getTime(),
        new Date("2020-05-11").getTime(),
        new Date("2024-04-20").getTime(),
      ]

      halvingDates.forEach((date, index) => {
        if (date >= filteredData[0].timestamp && date <= filteredData[filteredData.length - 1].timestamp) {
          const maxPrice = Math.max(...filteredData.map(d => d.actualPrice))
          const minPrice = Math.min(...filteredData.map(d => d.actualPrice))
          
          // Create a vertical line with multiple points for better visibility
          const verticalLineData = Array(10).fill(null).map((_, i) => ({
            x: date,
            y: minPrice + (maxPrice - minPrice) * (i / 9)
          }))

          datasets.push({
            label: `Halving ${index + 1}`,
            data: verticalLineData,
            borderColor: "rgba(255, 214, 0, 0.7)",
            backgroundColor: "transparent",
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 0,
            borderDash: [5, 5],
            stepped: true,
            tension: 0,
          })
        }
      })
    }

    setChartData({
      labels,
      datasets,
    })
  }, [
    data,
    timeframe,
    chartMode,
    showPowerLawBands,
    show200MA,
    showHalvingEvents,
    showWeeklyMA,
    showPowerLawSupport,
  ])

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
          unit: timeframe === "1W" ? "day" : timeframe === "1M" ? "day" : timeframe === "1Y" ? "month" : "year",
          displayFormats: {
            day: "MMM dd",
            month: "MMM yyyy",
            year: "yyyy",
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        type: useLogScale ? "logarithmic" : "linear",
        title: {
          display: true,
          text: "Price (USD)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
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

  const toggleChartMode = () => {
    setChartMode((prev) => (prev === "basic" ? "advanced" : "basic"))
    // Reset advanced options when switching to basic
    if (chartMode === "advanced") {
      setShowPowerLawBands(false)
      setShow200MA(false)
      setShowHalvingEvents(false)
      setShowWeeklyMA(false)
      setShowPowerLawSupport(false)
    }
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
              <TabsTrigger value="All">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart Mode Selection */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center space-x-2">
            <Button
              variant={chartMode === "basic" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartMode("basic")}
              className="text-xs"
            >
              Basic
            </Button>
            <Button
              variant={chartMode === "advanced" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartMode("advanced")}
              className="text-xs"
            >
              Advanced
            </Button>
          </div>

          {/* Advanced Options */}
          {chartMode === "advanced" && (
            <div className="flex flex-wrap items-center gap-3 bg-secondary/30 p-3 rounded-md">
              <div className="w-full mb-2 text-xs font-medium text-muted-foreground">Select indicators to display:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full">
                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    id="showPowerLawBands"
                    checked={showPowerLawBands}
                    onChange={(e) => setShowPowerLawBands(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="showPowerLawBands" className="text-xs">
                    Power Law Bands (±30%)
                  </label>
                </div>

                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    id="showWeeklyMA"
                    checked={showWeeklyMA}
                    onChange={(e) => setShowWeeklyMA(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="showWeeklyMA" className="text-xs">
                    50-Week MA
                  </label>
                </div>

                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    id="show200MA"
                    checked={show200MA}
                    onChange={(e) => setShow200MA(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="show200MA" className="text-xs">
                    200-Day MA
                  </label>
                </div>

                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    id="showHalvingEvents"
                    checked={showHalvingEvents}
                    onChange={(e) => setShowHalvingEvents(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="showHalvingEvents" className="text-xs">
                    Halving Events
                  </label>
                </div>

                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    id="showPowerLawSupport"
                    checked={showPowerLawSupport}
                    onChange={(e) => setShowPowerLawSupport(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="showPowerLawSupport" className="text-xs">
                    Power Law Support (50%)
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart Legend */}
        <div className="mb-4 text-xs bg-secondary/20 p-2 rounded-md">
          <div className="font-semibold mb-1">Chart Legend:</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-[#3b82f6] mr-1 rounded-full"></span>
              <span>BTC Price</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-[#F7931A] mr-1 rounded-full"></span>
              <span>Power Law Model</span>
            </div>
            {chartMode === "advanced" && showPowerLawBands && (
              <>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-[rgba(34,197,94,0.5)] mr-1 rounded-full"></span>
                  <span>Upper Band (+30%)</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-[rgba(239,68,68,0.5)] mr-1 rounded-full"></span>
                  <span>Lower Band (-30%)</span>
                </div>
              </>
            )}
            {chartMode === "advanced" && showWeeklyMA && (
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-[#0ea5e9] mr-1 rounded-full"></span>
                <span>50-Week MA</span>
              </div>
            )}
            {chartMode === "advanced" && show200MA && (
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-[#8b5cf6] mr-1 rounded-full"></span>
                <span>200-Day MA</span>
              </div>
            )}
            {chartMode === "advanced" && showHalvingEvents && (
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-[rgba(255,214,0,0.7)] mr-1 rounded-full"></span>
                <span>Halving Events</span>
              </div>
            )}
            {chartMode === "advanced" && showPowerLawSupport && (
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-[#fbbf24] mr-1 rounded-full"></span>
                <span>Power Law Support</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-[400px] w-full relative">
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

