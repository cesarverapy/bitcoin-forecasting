import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EducationalCards() {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Understanding the Power Law</h2>

      <Tabs defaultValue="science" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="science">The Science</TabsTrigger>
          <TabsTrigger value="accuracy">Historical Accuracy</TabsTrigger>
          <TabsTrigger value="trading">Trading Implications</TabsTrigger>
        </TabsList>

        <TabsContent value="science">
          <Card>
            <CardHeader>
              <CardTitle>The Power Law Formula</CardTitle>
              <CardDescription>Understanding the mathematical model behind Bitcoin&apos;s price growth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>The Power Law model for Bitcoin&apos;s price is based on the formula:</p>
              <div className="bg-secondary/50 rounded-lg p-4 text-center">
                <p className="text-lg font-mono">price = A × (days^B)</p>
              </div>
              <p>
                Think of this formula like a growth pattern that Bitcoin has followed since its creation. It&apos;s similar to how cities grow - they start small and grow faster at first, then slow down but keep growing.
              </p>
              <p>
                Where <span className="font-mono">A</span> and <span className="font-mono">B</span> are constants
                derived from historical data, and <span className="font-mono">days</span> is the number of days since
                the Bitcoin genesis block (January 3, 2009).
              </p>
              <p>
                This model suggests that Bitcoin&apos;s price growth follows a power law relationship with time, rather
                than an exponential one. This means the rate of growth slows over time, but still continues upward.
              </p>
              <p>
                The power law relationship has been observed in many natural and economic systems, from the distribution
                of wealth to the growth of cities.
              </p>
              <div className="bg-secondary/50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold mb-2">Think of it Like This:</h4>
                <p>Imagine Bitcoin&apos;s price like a tree growing. When it&apos;s young, it grows very quickly. As it gets older, it still grows but at a slower pace. The Power Law helps us understand this natural growth pattern.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accuracy">
          <Card>
            <CardHeader>
              <CardTitle>Historical Accuracy</CardTitle>
              <CardDescription>How well has the Power Law model predicted Bitcoin&apos;s price?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Power Law model has shown remarkable accuracy in predicting Bitcoin&apos;s long-term price
                trajectory, despite short-term volatility.
              </p>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">What This Means for You:</h4>
                <p>Think of the Power Law like a long-term trend line. While Bitcoin&apos;s price can jump up and down in the short term (like waves on the ocean), it tends to follow this overall growth pattern over time.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Bull Market Peaks</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>2013: Model predicted ~$1,100 (Actual: $1,150)</li>
                    <li>2017: Model predicted ~$8,000 (Actual: $19,000)</li>
                    <li>2021: Model predicted ~$50,000 (Actual: $69,000)</li>
                  </ul>
                  <p className="mt-2 text-sm">These are the highest points Bitcoin reached during its major price increases.</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Bear Market Bottoms</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>2015: Model predicted ~$200 (Actual: $150)</li>
                    <li>2018: Model predicted ~$3,000 (Actual: $3,200)</li>
                    <li>2022: Model predicted ~$16,000 (Actual: $15,500)</li>
                  </ul>
                  <p className="mt-2 text-sm">These are the lowest points Bitcoin reached during its major price decreases.</p>
                </div>
              </div>
              <p className="mt-4">
                While short-term price movements can deviate significantly from the model (up to 300% above or 50%
                below), Bitcoin&apos;s price has historically returned to the model line over time.
              </p>
              <div className="bg-secondary/50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold mb-2">Key Takeaway:</h4>
                <p>Even though Bitcoin&apos;s price can swing wildly in the short term, it has consistently followed this growth pattern over the long term, making it a useful tool for understanding Bitcoin&apos;s overall price direction.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading">
          <Card>
            <CardHeader>
              <CardTitle>Trading Implications</CardTitle>
              <CardDescription>How to use the Power Law model in your trading strategy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Power Law model can be a valuable tool for long-term Bitcoin investors, providing context for
                current price levels and potential future movements.
              </p>
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">How to Use This Information:</h4>
                <p>Think of the Power Law as a guide that helps you understand if Bitcoin&apos;s current price is relatively high or low compared to its historical growth pattern. This can help you make more informed decisions about when to buy or sell.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">When BTC is Above the Model</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Consider taking partial profits</li>
                    <li>Reduce new position sizes</li>
                    <li>Prepare for potential correction</li>
                    <li>Set stop-losses to protect gains</li>
                  </ul>
                  <p className="mt-2 text-sm">Think of this like when a stock is trading above its average price - it might be a good time to be cautious.</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">When BTC is Below the Model</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Consider accumulating positions</li>
                    <li>Dollar-cost average strategy</li>
                    <li>Longer timeframe for holding</li>
                    <li>Prepare for potential recovery</li>
                  </ul>
                  <p className="mt-2 text-sm">This is like when a stock is trading below its average price - it might be a good time to consider buying.</p>
                </div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold mb-2">Important Tips:</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Always invest only what you can afford to lose</li>
                  <li>Don&apos;t make decisions based on just one indicator</li>
                  <li>Consider your own financial goals and timeline</li>
                  <li>Remember that past performance doesn&apos;t guarantee future results</li>
                </ul>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                <strong>Disclaimer:</strong> The Power Law model is a mathematical projection based on historical data
                and should not be the sole basis for investment decisions. Past performance does not guarantee future
                results. Always do your own research and consider consulting a financial advisor.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

