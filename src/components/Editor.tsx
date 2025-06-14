
import { useState, useEffect, useRef, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Toolbar from './Toolbar'
import ChatPanel from './ChatPanel'
import { useSettings } from '@/hooks/useSettings'

const Editor = () => {
  const [content, setContent] = useState('# Welcome to Studio\n\nStart writing your markdown here...\n\n## Features\n- AI-powered assistance\n- Rich text editing\n- Export to multiple formats\n- Custom fonts\n\n**Try typing** some *markdown* and see the preview!\n\n### Lists work too:\n1. First item\n2. Second item\n3. Third item\n\n- Bullet point\n- Another bullet\n- Last bullet')
  const [showPreview, setShowPreview] = useState(false)

  // Keyboard shortcuts
  const [history, setHistory] = useState<string[]>([''])
  const [historyPosition, setHistoryPosition] = useState(0)

  useEffect(() => {
    setHistory(prev => [...prev.slice(0, historyPosition + 1), content])
    setHistoryPosition(prev => prev + 1)
  }, [content])

  const handleUndo = () => {
    if (historyPosition > 0) {
      setHistoryPosition(prev => prev - 1)
      setContent(history[historyPosition - 1])
    }
  }

  const handleRedo = () => {
    if (historyPosition < history.length - 1) {
      setHistoryPosition(prev => prev + 1)
      setContent(history[historyPosition + 1])
    }
  }

  useHotkeys('mod+z', handleUndo, [handleUndo])
  useHotkeys('mod+y,mod+shift+z', handleRedo, [handleRedo])

  const { settings } = useSettings()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [settingsKey, setSettingsKey] = useState(0)

  useEffect(() => {
    setSettingsKey(prev => prev + 1)
  }, [settings])

  useEffect(() => {
    if (settings.fontFamily && settings.fontFamily !== 'Inter') {
      document.documentElement.style.setProperty('--font-family', settings.fontFamily)
    }
  }, [settings.fontFamily])

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = before + selectedText + after
    
    setContent(content.substring(0, start) + newText + content.substring(end))
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const insertContentFromChat = (newContent: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      // If no cursor position, append to end
      setContent(prev => prev + '\n\n' + newContent)
      return
    }

    const cursorPosition = textarea.selectionStart
    const beforeCursor = content.substring(0, cursorPosition)
    const afterCursor = content.substring(cursorPosition)
    
    setContent(beforeCursor + newContent + afterCursor)
    
    // Set cursor position after inserted content
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(cursorPosition + newContent.length, cursorPosition + newContent.length)
    }, 0)
  }

  return (
    <div className="h-full flex font-inter">
      {/* Editor Side */}
      <div className="flex-1 flex flex-col border-r border-gray-200">
        <Toolbar 
          onBold={() => insertText('**', '**')}
          onItalic={() => insertText('*', '*')}
          onHeading={() => insertText('## ')}
          onLink={() => insertText('[', '](url)')}
          onCode={() => insertText('`', '`')}
          onPreviewToggle={() => setShowPreview(!showPreview)}
          showPreview={showPreview}
          content={content}
        />
        
        <div className="flex-1 flex h-full">
          {/* Text Editor */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} h-full`}>
            <div className="flex-1 h-full">
            
                
            
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  setHistory(prev => [...prev.slice(0, historyPosition + 1), e.target.value])
                  setHistoryPosition(prev => prev + 1)
                }}
                className="flex-1 h-full w-full px-4 py-2 bg-gray-50"
                placeholder="Write your markdown here..."
              />
            
          </div>
          </div>
          
          {/* Preview */}
          {showPreview && (
            <div className="w-1/2 border-l border-gray-200 bg-gray-50">
              <div className="p-6 h-full overflow-y-auto">
                <div 
                  className="prose prose-gray max-w-none 
                    prose-headings:font-inter prose-headings:font-semibold prose-headings:text-gray-900
                    prose-h1:text-2xl prose-h1:mb-6 prose-h1:mt-0 prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-2
                    prose-h2:text-xl prose-h2:mb-4 prose-h2:mt-6
                    prose-h3:text-lg prose-h3:mb-3 prose-h3:mt-5
                    prose-p:font-inter prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                    prose-strong:font-inter prose-strong:font-semibold prose-strong:text-gray-900
                    prose-em:font-inter prose-em:italic prose-em:text-gray-700
                    prose-a:font-inter prose-a:text-blue-600 prose-a:underline prose-a:decoration-blue-300 hover:prose-a:decoration-blue-500
                    prose-code:font-fira-code prose-code:text-purple-700 prose-code:bg-purple-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                    prose-pre:font-fira-code prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:text-sm prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                    prose-ul:font-inter prose-ul:text-gray-700 prose-ul:space-y-1
                    prose-ol:font-inter prose-ol:text-gray-700 prose-ol:space-y-1
                    prose-li:font-inter prose-li:text-gray-700
                    prose-blockquote:font-inter prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600"
                  style={{ fontFamily: settings.fontFamily || 'Inter' }}
                >
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      code: ({ children }) => <code className="bg-gray-100 p-1 rounded">{children}</code>
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Chat Panel */}
      <div className="w-80">
        <ChatPanel key={settingsKey} onInsertContent={insertContentFromChat} />
      </div>
    </div>
  )
}

export default Editor
