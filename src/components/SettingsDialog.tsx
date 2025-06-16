
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettings } from '@/hooks/useSettings'
import { Eye, EyeOff } from 'lucide-react'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { settings, updateSettings } = useSettings()
  const [showApiKey, setShowApiKey] = useState(false)
  const [tempSettings, setTempSettings] = useState(settings)

  // Sync tempSettings when dialog opens or settings change
  useEffect(() => {
    if (open) {
      setTempSettings(settings)
    }
  }, [open, settings])

  const handleSave = async () => {
    try {
      // Validate API key by making a test request to Cerebras API
      const testMessage = {
        role: 'user',
        content: 'Test message to validate API key'
      }

      // Use the actual Cerebras API endpoint
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempSettings.cerebrasApiKey}`
        },
        body: JSON.stringify({
          model: 'llama3.1-8b',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful writing assistant for a markdown editor called Studio.'
            },
            testMessage
          ],
          max_tokens: 10,
          temperature: 0.2,
          top_p: 1
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Invalid API key: ${errorData?.error?.message || 'Authentication failed'}`)
      }

      // If validation passes, update settings
      updateSettings({
        ...tempSettings,
        cerebrasApiKeyValidated: true
      })
      
      // Close the dialog and reload the page
      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      alert('Invalid API key. Please try again.');
    }
  }

  const handleCancel = () => {
    setTempSettings(settings) // Reset to original settings
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and customize the appearance of your editor.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="cerebras-key">Cerebras API Key</Label>
              <div className="relative">
                <Input
                  id="cerebras-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={tempSettings.cerebrasApiKey}
                  onChange={(e) => setTempSettings({ ...tempSettings, cerebrasApiKey: e.target.value })}
                  placeholder="Enter your Cerebras API key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Get your API key from{' '}
                <a href="https://cloud.cerebras.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Cerebras Cloud
                </a>
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Input
                id="font-family"
                value={tempSettings.fontFamily}
                onChange={(e) => setTempSettings({ ...tempSettings, fontFamily: e.target.value })}
                placeholder="e.g., Inter, Roboto, Open Sans"
              />
              <p className="text-sm text-gray-500">
                Enter any Google Fonts family name. The font will be automatically loaded.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Input
                id="font-size"
                type="number"
                min="12"
                max="24"
                value={tempSettings.fontSize}
                onChange={(e) => setTempSettings({ ...tempSettings, fontSize: parseInt(e.target.value) || 16 })}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog
