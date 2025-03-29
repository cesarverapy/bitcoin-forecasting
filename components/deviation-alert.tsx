import { AlertCircle, AlertTriangle, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DeviationAlertProps {
  deviation: number | null
}

export default function DeviationAlert({ deviation }: DeviationAlertProps) {
  if (deviation === null) {
    return null
  }

  // Determine alert type based on deviation
  let alertType: "overvalued" | "undervalued" | "neutral" = "neutral"
  let icon = <Check className="h-4 w-4" />
  let title = "BTC trading near model value"
  let description = "Bitcoin is currently trading close to its predicted value according to the Power Law model."
  let bgColor = "bg-yellow-500/10 border-yellow-500/20"
  let textColor = "text-yellow-500"

  if (deviation > 30) {
    alertType = "overvalued"
    icon = <AlertTriangle className="h-4 w-4" />
    title = "CAUTION: BTC overvalued"
    description = `Bitcoin is currently trading ${Math.abs(deviation).toFixed(1)}% above its predicted value. Historical patterns suggest a potential correction.`
    bgColor = "bg-red-500/10 border-red-500/20"
    textColor = "text-red-500"
  } else if (deviation < -30) {
    alertType = "undervalued"
    icon = <AlertCircle className="h-4 w-4" />
    title = "HODL ALERT: BTC undervalued per model"
    description = `Bitcoin is currently trading ${Math.abs(deviation).toFixed(1)}% below its predicted value. Historical patterns suggest potential for upward movement.`
    bgColor = "bg-green-500/10 border-green-500/20"
    textColor = "text-green-500"
  }

  return (
    <Alert className={`${bgColor} border`}>
      <div className={`${textColor} flex items-center gap-2`}>
        {icon}
        <AlertTitle>{title}</AlertTitle>
      </div>
      <AlertDescription className="mt-2">{description}</AlertDescription>
    </Alert>
  )
}

