"use client"

import { useState, useEffect } from "react"
import { Bitcoin } from "lucide-react"

interface HeaderProps {
  currentPrice: number | null
  previousHalvingPrice?: number | null
}

export default function Header({ currentPrice, previousHalvingPrice }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [priceClass, setPriceClass] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Add a price change animation effect
  useEffect(() => {
    if (currentPrice) {
      setPriceClass("text-green-500")
      const timer = setTimeout(() => setPriceClass(""), 1000)
      return () => clearTimeout(timer)
    }
  }, [currentPrice])

  return (
    <header
      className={`w-full z-50 transition-all duration-300 ${
        isScrolled ? "sticky top-0 bg-background/95 backdrop-blur-sm shadow-md" : ""
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <Bitcoin className="h-8 w-8 text-bitcoin-orange mr-2" />
          <div>
            <h1 className="text-2xl font-bold">CryptoLawX</h1>
            <p className="text-sm text-muted-foreground">Decoding Bitcoin&apos;s Mathematical Destiny</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {previousHalvingPrice && (
            <div className="bg-secondary/50 rounded-full px-4 py-2 flex items-center">
              <Bitcoin className="h-5 w-5 text-bitcoin-orange mr-2" />
              <div>
                <p className="text-xs text-muted-foreground">Previous Halving</p>
                <p className="text-sm font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(previousHalvingPrice)}
                </p>
              </div>
            </div>
          )}
          <div className="bg-secondary rounded-full px-4 py-2 flex items-center">
            <Bitcoin className="h-5 w-5 text-bitcoin-orange mr-2" />
            <div>
              <p className="text-xs text-muted-foreground">BTC Price</p>
              <p className={`text-lg font-bold transition-colors ${priceClass}`}>
                {currentPrice
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(currentPrice)
                  : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

