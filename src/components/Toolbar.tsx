
import { Bold, Italic, Heading, Link, Code, Eye, EyeOff, Download, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import ExportDropdown from './ExportDropdown'

interface ToolbarProps {
  onBold: () => void
  onItalic: () => void
  onHeading: () => void
  onLink: () => void
  onCode: () => void
  onPreviewToggle: () => void
  showPreview: boolean
  content: string
}

const Toolbar = ({ 
  onBold, 
  onItalic, 
  onHeading, 
  onLink, 
  onCode, 
  onPreviewToggle, 
  showPreview,
  content 
}: ToolbarProps) => {
  return (
    <div className="border-b border-gray-200 px-6 py-3 flex items-center space-x-2 bg-white">
      <Button variant="ghost" size="sm" onClick={onBold}>
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onItalic}>
        <Italic className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onHeading}>
        <Heading className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      <Button variant="ghost" size="sm" onClick={onLink}>
        <Link className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onCode}>
        <Code className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      <Button variant="ghost" size="sm" onClick={onPreviewToggle}>
        {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
      
      <div className="flex-1" />
      
      <ExportDropdown content={content} />
    </div>
  )
}

export default Toolbar
