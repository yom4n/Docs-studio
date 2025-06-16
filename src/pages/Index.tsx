
import { useState, useEffect } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import Editor from '@/components/Editor'
import SettingsDialog from '@/components/SettingsDialog'
import { useSettings } from '@/hooks/useSettings'

const Index = () => {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { settings } = useSettings()

  // Apply custom font from settings (but always default to Inter)
  useEffect(() => {
    if (settings.fontFamily && settings.fontFamily !== 'Inter') {
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${settings.fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)
      
      document.documentElement.style.setProperty('--font-family', settings.fontFamily)
    } else {
      document.documentElement.style.setProperty('--font-family', 'Inter')
    }
    
    if (settings.fontSize) {
      document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`)
    }
  }, [settings])

  return (
    <div className="h-screen flex flex-col bg-white font-inter">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 font-inter">Docs Studio</h1>
          <span className="text-sm text-gray-600 font-inter">AI-Powered Editor</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="font-inter"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Editor />
      </div>
      <SettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
     
    </div>
  )
}

export default Index
