
import jsPDF from 'jspdf'

export const exportToMarkdown = (content: string, filename: string = 'document') => {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const exportToPDF = (content: string, filename: string = 'document') => {
  const doc = new jsPDF()
  let yPosition = 20
  const pageHeight = doc.internal.pageSize.height
  const marginBottom = 20
  
  // Parse markdown and render with formatting
  const lines = content.split('\n')
  
  lines.forEach((line) => {
    // Check if we need a new page
    if (yPosition > pageHeight - marginBottom) {
      doc.addPage()
      yPosition = 20
    }
    
    if (line.startsWith('# ')) {
      // H1 - Large, bold
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      const text = line.replace('# ', '')
      doc.text(text, 20, yPosition)
      yPosition += 15
    } else if (line.startsWith('## ')) {
      // H2 - Medium, bold
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      const text = line.replace('## ', '')
      doc.text(text, 20, yPosition)
      yPosition += 12
    } else if (line.startsWith('### ')) {
      // H3 - Small, bold
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      const text = line.replace('### ', '')
      doc.text(text, 20, yPosition)
      yPosition += 10
    } else if (line.trim() === '') {
      // Empty line
      yPosition += 5
    } else {
      // Regular text with inline formatting
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      
      // Handle bold text **text**
      let processedLine = line
      const boldRegex = /\*\*(.*?)\*\*/g
      const boldMatches = [...line.matchAll(boldRegex)]
      
      if (boldMatches.length > 0) {
        let currentX = 20
        let lastIndex = 0
        
        boldMatches.forEach((match) => {
          // Add text before bold
          const beforeText = processedLine.substring(lastIndex, match.index)
          if (beforeText) {
            doc.setFont('helvetica', 'normal')
            doc.text(beforeText, currentX, yPosition)
            currentX += doc.getTextWidth(beforeText)
          }
          
          // Add bold text
          doc.setFont('helvetica', 'bold')
          const boldText = match[1]
          doc.text(boldText, currentX, yPosition)
          currentX += doc.getTextWidth(boldText)
          
          lastIndex = match.index! + match[0].length
        })
        
        // Add remaining text
        const remainingText = processedLine.substring(lastIndex)
        if (remainingText) {
          doc.setFont('helvetica', 'normal')
          doc.text(remainingText, currentX, yPosition)
        }
      } else {
        // Handle italic text *text*
        processedLine = processedLine.replace(/\*(.*?)\*/g, '$1') // Remove italic markers for now
        // Handle code `text`
        processedLine = processedLine.replace(/`(.*?)`/g, '$1') // Remove code markers for now
        // Handle links [text](url)
        processedLine = processedLine.replace(/\[(.*?)\]\(.*?\)/g, '$1')
        
        // Split long lines
        const splitText = doc.splitTextToSize(processedLine, 170)
        doc.text(splitText, 20, yPosition)
        yPosition += splitText.length * 6
      }
      
      yPosition += 4
    }
  })
  
  doc.save(`${filename}.pdf`)
}

export const exportToHTML = (content: string, filename: string = 'document') => {
  // Enhanced markdown to HTML conversion
  const html = content
    .replace(/^### (.*$)/gim, '<h3 style="font-family: Inter, sans-serif; font-weight: 600; color: #1f2937; margin: 16px 0 8px 0;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-family: Inter, sans-serif; font-weight: 600; color: #1f2937; margin: 20px 0 12px 0;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-family: Inter, sans-serif; font-weight: 600; color: #1f2937; margin: 24px 0 16px 0;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong style="font-family: Inter, sans-serif; font-weight: 600;">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em style="font-family: Inter, sans-serif; font-style: italic;">$1</em>')
    .replace(/`(.*?)`/gim, '<code style="font-family: \'Fira Code\', monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>')
    .replace(/\n/gim, '<br>')
  
  const fullHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Inter', sans-serif; 
          margin: 40px; 
          line-height: 1.6;
          color: #374151;
        }
        h1, h2, h3 { 
          color: #1f2937; 
          font-family: 'Inter', sans-serif;
        }
        code { 
          font-family: 'Fira Code', monospace !important;
          background: #f3f4f6; 
          padding: 2px 6px; 
          border-radius: 4px;
        }
        pre {
          font-family: 'Fira Code', monospace !important;
          background: #1f2937;
          color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `
  
  const blob = new Blob([fullHTML], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
