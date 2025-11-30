"use client"

import { useCallback, useState } from "react"
import { Upload, X, ImageIcon, Video, Music, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function FileUpload({ onFileSelect, accept, label, currentFile, onRemove }) {
  const [isDragging, setIsDragging] = useState(false)
  
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])
  
  const handleDragIn = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])
  
  const handleDragOut = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])
  
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      
      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        onFileSelect(files[0])
      }
    },
    [onFileSelect],
  )
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }
  
  const getFileIcon = () => {
    if (accept?.includes("image")) return <ImageIcon className="w-8 h-8" />
    if (accept?.includes("video")) return <Video className="w-8 h-8" />
    if (accept?.includes("audio")) return <Music className="w-8 h-8" />
    return <File className="w-8 h-8" />
  }
  
  if (currentFile) {
    return (
      <div className="relative rounded-lg border border-border bg-secondary p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentFile?.name ? currentFile?.name.substring(0, 26) : currentFile.substring(0, 26)}...
            </p>
            <p className="text-xs text-muted-foreground">Завантажений файл</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
      )}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">Перетягніть або натисніть для вибору</p>
        </div>
      </div>
    </div>
  )
}
