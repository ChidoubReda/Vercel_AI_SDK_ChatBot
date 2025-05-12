"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/ui/autoresize-textarea"
import { ArrowUpIcon } from "@/components/ui/icons"

export function ChatForm({ className = "", ...props }: React.ComponentProps<"form">) {
  const { messages, input, setInput, append } = useChat({
    api: "/api/chat",
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      void append({ content: input, role: "user" })
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const header = (
    <header className="m-auto flex max-w-96 flex-col gap-5 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">Basic AI Chatbot</h1>
      <p className="text-sm text-muted-foreground">
        This is an AI chatbot app template built with <span className="text-foreground">Next.js</span>, the{" "}
        <span className="text-foreground">Vercel AI SDK</span>, and <span className="text-foreground">Vercel KV</span>.
      </p>
      <p className="text-sm text-muted-foreground">
        Send a message to get started.
      </p>
    </header>
  )

  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {messages.map((message, index) => (
        <div
          key={index}
          data-role={message.role}
          className="max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white"
        >
          {message.content}
        </div>
      ))}
    </div>
  )

  return (
    <main
      className={`mx-auto flex h-screen max-h-screen w-full max-w-[35rem] flex-col items-stretch border-none ${className}`}
      {...props}
    >
      <div className="flex-1 overflow-y-auto px-6">{messages.length ? messageList : header}</div>
      <form
        onSubmit={handleSubmit}
        className="relative mx-6 mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm"
      >
        <AutoResizeTextarea
          onKeyDown={handleKeyDown}
          onChange={(v: string) => setInput(v)}
          value={input}
          placeholder="Enter a message"
          className="flex-1 bg-transparent focus:outline-none resize-none min-h-4 max-h-80 placeholder:text-muted-foreground"
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="absolute bottom-1 right-1 size-6 rounded-full">
                <ArrowUpIcon size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={12}>Submit</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </form>
    </main>
  )
}
