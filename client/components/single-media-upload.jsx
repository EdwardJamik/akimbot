"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ImageIcon, Video, Music, Upload, X, FileCheck, Slash } from "lucide-react"

export function SingleMediaUpload({
                                    currentFile,
                                    currentType,
                                    onFileSelect,
                                    onRemove,
                                    label = "Медіа файл (лише один тип)",
                                  }) {
  const [mediaType, setMediaType] = useState(currentType || "image")
  const fileInputRef = useRef(null)
  
  useEffect(() => {
    // Якщо currentType змінився зовні, оновлюємо локальний стан
    if (currentType) setMediaType(currentType)
  }, [currentType])
  
  const handleTypeChange = (type) => {
    setMediaType(type)
    if (currentFile || type === "none") {
      onRemove()
    }
  }
  
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file, mediaType)
    }
  }
  
  const getAcceptType = () => {
    switch (mediaType) {
      case "image":
        return "image/*"
      case "video":
        return "video/*"
      case "audio":
        return "audio/*"
      default:
        return "*/*"
    }
  }
  
  const getFileName = () => {
    if (!currentFile) return null
    if (typeof currentFile === "string") {
      return currentFile.split("/").pop()
    }
    return currentFile.name
  }
  
  const mediaTypes = [
    { value: "none", label: "Без медіа", icon: null },
    { value: "image", label: "Фото", icon: ImageIcon },
    { value: "video", label: "Відео", icon: Video },
    { value: "audio", label: "Аудіо", icon: Music }
  ]
  
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      <RadioGroup value={mediaType} onValueChange={handleTypeChange} className="flex flex-wrap gap-4">
        {mediaTypes.map(({ value, label, icon: Icon }) => (
          <div key={value} className="flex items-center space-x-2">
            <RadioGroupItem value={value} id={`media-${value}`} />
            <Label htmlFor={`media-${value}`} className="flex items-center gap-1.5 cursor-pointer text-sm">
              {Icon ?
                <Icon className="w-4 h-4" />
                :
                <></>
              }
              
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      {mediaType !== "none" && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptType()}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {currentFile ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground truncate">{getFileName()}</span>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onRemove}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Завантажити {mediaTypes.find((m) => m.value === mediaType)?.label.toLowerCase()}
            </Button>
          )}
        </>
      )}
    </div>
  )
}