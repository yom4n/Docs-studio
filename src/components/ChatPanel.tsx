
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Check, Settings } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { useCerebras } from '@/hooks/useCerebras'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  extractedArticle?: string
  timestamp: Date
}

interface ApiMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatPanelProps {
  onInsertContent: (content: string) => void
}

const ChatPanel = ({ onInsertContent }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI writing assistant. I can help you write articles, stories, and other content. Just ask me to write something!',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { settings } = useSettings()
  const { sendMessage } = useCerebras()

  

  // Add a loading state for validation
  const [isValidating, setIsValidating] = useState(false)

  // Function to validate API key
  const validateApiKey = async () => {
    if (!settings.cerebrasApiKey) return false
    
    setIsValidating(true)
    try {
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.cerebrasApiKey}`
        },
        body: JSON.stringify({
          model: 'llama3.1-8b',
          messages: [
            { role: 'system', content: 'Test validation' }
          ],
          max_tokens: 1
        })
      })
      return response.ok
    } catch (error) {
      console.error('API validation error:', error)
      return false
    } finally {
      setIsValidating(false)
    }
  }

  // Debug log to check API key
  

  const extractArticle = (content: string): string | null => {
    const match = content.match(/<article-start>([\s\S]*?)<article-end>/i)
    return match ? match[1].trim() : null
  }

  const handleSend = async () => {
    if (!input.trim()) return
    
    if (!settings.cerebrasApiKey || !settings.cerebrasApiKeyValidated) {
      alert('Please configure and validate your Cerebras API key in settings first.')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Create a prompt that ensures consistent article formatting
      const systemPrompt = `You are a helpful writing assistant. When users ask you to write content (articles, stories, etc.), please format your response exactly like this:

<article-start>
[The actual content they requested]
<article-end>

Always wrap ALL content between <article-start> and <article-end> tags. Do not include any other text outside these tags.`

      // Send all conversation history including system prompt
      const conversationHistory: ApiMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({ role: msg.role, content: msg.content } as ApiMessage)),
        { role: userMessage.role, content: userMessage.content } as ApiMessage
      ]

      const response = await sendMessage(conversationHistory, settings.cerebrasApiKey)
      
      const extractedArticle = extractArticle(response)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        extractedArticle: extractedArticle || undefined,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key in settings and try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleApprove = (content: string) => {
    onInsertContent(content)
  }

  // Show the chat interface regardless of API key status, but with different states
  const hasApiKey = settings.cerebrasApiKey && settings.cerebrasApiKey.trim().length > 0

  return (
    <div className="h-full bg-gray-50 border-l border-gray-200 flex flex-col font-inter">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="font-semibold text-gray-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span>AI Assistant</span>
          </div>
          {!hasApiKey && (
            <div className="flex items-center space-x-1">
              <Settings className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-amber-600">Setup Required</span>
            </div>
          )}
        </h2>
      </div>
      
      {!hasApiKey && (
        <div className="p-4 bg-amber-50 border-b border-amber-200">
          <p className="text-sm text-amber-800">
            Configure your Cerebras API key in settings to enable AI chat
          </p>
        </div>
      )}
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.role === 'user' ? '' : 'space-y-3'}`}>
                <div className={`rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    )}
                    {message.role === 'user' && (
                      <User className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                    )}
                    <div className={`text-sm leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`}>
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none 
                          prose-headings:text-gray-900 prose-headings:font-inter prose-headings:font-semibold
                          prose-h1:text-lg prose-h1:mb-3 prose-h1:mt-0
                          prose-h2:text-base prose-h2:mb-2 prose-h2:mt-3
                          prose-h3:text-sm prose-h3:mb-1 prose-h3:mt-2
                          prose-p:text-gray-700 prose-p:font-inter prose-p:leading-relaxed prose-p:mb-2
                          prose-strong:text-gray-900 prose-strong:font-inter prose-strong:font-semibold
                          prose-em:text-gray-700 prose-em:font-inter prose-em:italic
                          prose-a:text-blue-600 prose-a:font-inter prose-a:underline prose-a:decoration-blue-300 hover:prose-a:decoration-blue-500
                          prose-code:text-purple-700 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-fira-code prose-code:text-xs
                          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:font-fira-code prose-pre:text-xs prose-pre:p-3 prose-pre:rounded
                          prose-ul:font-inter prose-li:font-inter prose-li:text-gray-700
                          prose-ol:font-inter">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="font-inter">{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {message.role === 'assistant' && message.extractedArticle && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800 font-inter">Generated Content</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(message.extractedArticle!)}
                        className="bg-green-600 hover:bg-green-700 text-white h-6 px-2 text-xs font-inter"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Insert
                      </Button>
                    </div>
                    <div className="prose prose-sm max-w-none 
                      prose-headings:text-gray-900 prose-headings:font-inter prose-headings:font-semibold
                      prose-h1:text-lg prose-h1:mb-3 prose-h1:mt-0
                      prose-h2:text-base prose-h2:mb-2 prose-h2:mt-3
                      prose-h3:text-sm prose-h3:mb-1 prose-h3:mt-2
                      prose-p:text-gray-700 prose-p:font-inter prose-p:leading-relaxed prose-p:mb-2
                      prose-strong:text-gray-900 prose-strong:font-inter prose-strong:font-semibold
                      prose-em:text-gray-700 prose-em:font-inter prose-em:italic
                      prose-a:text-blue-600 prose-a:font-inter prose-a:underline prose-a:decoration-blue-300 hover:prose-a:decoration-blue-500
                      prose-code:text-purple-700 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-fira-code prose-code:text-xs
                      prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:font-fira-code prose-pre:text-xs prose-pre:p-3 prose-pre:rounded
                      prose-ul:font-inter prose-li:font-inter prose-li:text-gray-700
                      prose-ol:font-inter">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.extractedArticle}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={hasApiKey ? "Ask me to write something..." : "Configure API key first"}
            className="flex-1 font-inter"
            disabled={isLoading || !hasApiKey}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading || !hasApiKey}
            size="icon"
            className="font-inter"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
