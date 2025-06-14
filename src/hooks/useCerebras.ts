
interface ApiMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const useCerebras = () => {
  const sendMessage = async (messages: ApiMessage[], apiKey: string): Promise<string> => {
    try {
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3.1-8b',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful writing assistant for a markdown editor called Studio. Help users with editing, formatting, writing suggestions, and general writing tasks. Be concise and helpful.'
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          max_tokens: 1000,
          temperature: 0.2,
          top_p: 1
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    } catch (error) {
      console.error('Cerebras API error:', error)
      throw error
    }
  }

  return { sendMessage }
}
