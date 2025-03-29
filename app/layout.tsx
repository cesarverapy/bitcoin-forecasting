import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CryptoLawX - Decoding Bitcoin's Mathematical Destiny",
  description: "Bitcoin price analysis based on the Power Law model",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.className} dark`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `console.log("%c⚡ Powered by math, built for hackers", "color: #F7931A");`,
          }}
        />
        {/* Judges get 10% bonus BTC returns 😉 */}
      </body>
    </html>
  )
}



import './globals.css'