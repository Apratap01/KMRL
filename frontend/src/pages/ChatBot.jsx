import React, { useState } from "react"
import { Send, FileText, Scale, MessageCircle } from "lucide-react"

// ---------------- Minimal Components ----------------
function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-md border bg-gray-100 hover:bg-gray-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${className}`}
      {...props}
    />
  )
}

function Card({ children, className = "" }) {
  return <div className={`rounded-lg border p-4 ${className}`}>{children}</div>
}

function ScrollArea({ children, className = "" }) {
  return (
    <div className={`overflow-y-auto ${className}`} style={{ maxHeight: "100%" }}>
      {children}
    </div>
  )
}

function Avatar({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-center rounded-full ${className}`}>
      {children}
    </div>
  )
}

function AvatarFallback({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-center w-full h-full rounded-full ${className}`}>
      {children}
    </div>
  )
}

// ---------------- Chat Interface ----------------
export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      content:
        "Hello! I'm your AI legal assistant. I can help you understand and analyze your legal documents. What would you like to know about your document?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content:
          "I understand your question about the legal document. Based on my analysis, I can provide you with detailed insights and explanations. Let me break this down for you...",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-semibold">Logo</h1>
            <nav className="flex space-x-6">
              <a href="#" className="hover:text-gray-300 transition-colors">
                Home
              </a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                Dashboard
              </a>
            </nav>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel */}
        <div className="w-1/3 bg-white border-r border-gray-200 p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Chat with your document
              </h2>
              <p className="text-gray-600">Home_Loan_Summon.pdf</p>
            </div>

            <Card className="bg-purple-50 border-purple-200">
              <div className="flex items-start space-x-3">
                <Scale className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-1">
                    Legal AI Assistant
                  </h3>
                  <p className="text-sm text-purple-700">
                    I'm here to help you understand legal documents, explain complex
                    terms, and answer questions about your case.
                  </p>
                </div>
              </div>
            </Card>

            {/* Document Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Document Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">File Type:</span>
                  <span className="font-medium">PDF Document</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">Legal Summons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Added:</span>
                  <span className="font-medium">Sep 5, 2025</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start text-left bg-transparent border">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Explain key terms
                </Button>
                <Button className="w-full justify-start text-left bg-transparent border">
                  <Scale className="w-4 h-4 mr-2" />
                  Summarize document
                </Button>
                <Button className="w-full justify-start text-left bg-transparent border">
                  <FileText className="w-4 h-4 mr-2" />
                  Important deadlines
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 bg-purple-600 text-white">
                <AvatarFallback className="bg-purple-600 text-white">
                  <Scale className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">Legal AI Assistant</h3>
                <p className="text-sm text-gray-600">
                  Ready to help with your legal questions
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-start space-x-3 max-w-[80%]">
                    {message.sender === "ai" && (
                      <Avatar className="w-8 h-8 bg-purple-600 flex-shrink-0 text-white">
                        <AvatarFallback className="bg-purple-600 text-white">
                          <Scale className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.sender === "user"
                            ? "text-purple-200"
                            : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <Avatar className="w-8 h-8 bg-gray-600 flex-shrink-0 text-white">
                        <AvatarFallback className="bg-gray-600 text-white text-sm">
                          U
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your legal document..."
                className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • This AI provides general information and
              should not replace professional legal advice
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
