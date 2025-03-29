"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { formatDate, formatUSD } from "@/lib/calculations"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js"
import "chartjs-adapter-date-fns"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

interface TimeMachineSliderProps {
  data: any
}

export default function TimeMachineSlider({ data }: TimeMachineSliderProps) {
  const [sliderValue, setSliderValue] = useState([50])
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null)
  const [chartData, setChartData] = useState<any>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (!data || !data.powerLawData || data.powerLawData.length === 0) return

    const index = Math.floor((data.powerLawData.length - 1) * (sliderValue[0] / 100))
    setSelectedDataPoint(data.powerLawData[index])

    // Crear datos del gráfico hasta el punto seleccionado
    const selectedData = data.powerLawData.slice(0, index + 1)
    const labels = selectedData.map((d: any) => new Date(d.timestamp))
    
    setChartData({
      labels,
      datasets: [
        {
          label: "BTC Price",
          data: selectedData.map((d: any) => ({
            x: new Date(d.timestamp),
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
          data: selectedData.map((d: any) => ({
            x: new Date(d.timestamp),
            y: d.modelPrice,
          })),
          borderColor: "#F7931A",
          backgroundColor: "rgba(247, 147, 26, 0.1)",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    })
  }, [sliderValue, data])

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value)
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "month" as const,
          displayFormats: {
            month: "MMM yyyy",
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        type: "logarithmic" as const,
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
        position: "top" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ""
            const value = formatUSD(context.parsed.y)
            return `${label}: ${value}`
          },
          title: (tooltipItems: any) => formatDate(tooltipItems[0].parsed.x),
        },
      },
    },
  }

  if (!data || !data.powerLawData) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Machine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-[300px] w-full relative">
            {chartData ? (
              <Line ref={chartRef} data={chartData} options={chartOptions} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </div>

          <Slider value={sliderValue} onValueChange={handleSliderChange} max={100} step={1} className="my-6" />

          {selectedDataPoint && (
            <div className="bg-secondary/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">{formatDate(selectedDataPoint.timestamp)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Actual Price</p>
                  <p className="text-xl font-bold">{formatUSD(selectedDataPoint.actualPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model Prediction</p>
                  <p className="text-xl font-bold">{formatUSD(selectedDataPoint.modelPrice)}</p>
                </div>
              </div>

              {/* Calculate deviation */}
              {(() => {
                const deviation =
                  ((selectedDataPoint.actualPrice - selectedDataPoint.modelPrice) / selectedDataPoint.modelPrice) * 100
                const deviationText = deviation > 0 ? "above" : "below"
                const deviationClass = deviation > 0 ? "text-green-500" : "text-red-500"

                return (
                  <p className="mt-4 text-sm">
                    Bitcoin was{" "}
                    <span className={deviationClass}>
                      {Math.abs(deviation).toFixed(1)}% {deviationText}
                    </span>{" "}
                    the model prediction
                  </p>
                )
              })()}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Drag the slider to see how Bitcoin&apos;s price compared to the Power Law model at different points in time.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

