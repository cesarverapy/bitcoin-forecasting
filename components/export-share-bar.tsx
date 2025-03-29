"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"
import { formatUSD } from "@/lib/calculations"

interface ExportShareBarProps {
  currentPrice: number | null
  deviation: number | null
}

export default function ExportShareBar({ currentPrice, deviation }: ExportShareBarProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      alert("PDF export feature would be implemented here in a production app.")
    }, 1500)
  }

  const handleShare = () => {
    // Prepare tweet text
    const tweetText = `Bitcoin is currently trading at ${currentPrice ? formatUSD(currentPrice) : "unknown"} which is ${deviation ? Math.abs(deviation).toFixed(1) + "% " + (deviation > 0 ? "above" : "below") : ""} the Power Law model prediction. Check out this analysis on CryptoLawX! #Bitcoin #PowerLaw`

    // Open Twitter share dialog
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    window.open(twitterUrl, "_blank")
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Share this analysis or export it for your records</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export to PDF"}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#1a91da]"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Tweet
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

