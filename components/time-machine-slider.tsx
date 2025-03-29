"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { formatDate, formatUSD } from "@/lib/calculations"

interface TimeMachineSliderProps {
  data: any
}

export default function TimeMachineSlider({ data }: TimeMachineSliderProps) {
  const [sliderValue, setSliderValue] = useState([50])
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null)

  useEffect(() => {
    if (!data || !data.powerLawData || data.powerLawData.length === 0) return

    const index = Math.floor((data.powerLawData.length - 1) * (sliderValue[0] / 100))
    setSelectedDataPoint(data.powerLawData[index])
  }, [sliderValue, data])

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value)
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

