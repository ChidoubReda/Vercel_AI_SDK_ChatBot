import "./globals.css"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "OpenAI and AI SDK Chatbot",
  description: "A simple chatbot built using the AI SDK and gpt-4o-mini.",
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`flex min-h-screen flex-col antialiased ${inter.className}`}>{children}</body>
    </html>
  )
}
