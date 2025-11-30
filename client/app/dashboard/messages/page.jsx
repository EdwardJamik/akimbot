"use client"

import {useEffect, useState} from 'react'
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileUpload } from "@/components/file-upload"
import { Edit, MessageSquare, ChevronDown, ChevronUp, ImageIcon, BotMessageSquare, Video, Music } from "lucide-react"
import { toast } from "sonner"

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingMessage, setEditingMessage] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const [formData, setFormData] = useState({
    message: "",
    image: null,
    video: null,
    audio: null,
    command: "",
    type: "message",
  })
  const [selectedMediaType, setSelectedMediaType] = useState("none")
  
  useEffect(() => {
    getMessage()
  }, [])
  
  const getMessage = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/getMessages`, {
        method: "GET",
        headers: {
          "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
        },
        credentials: "include",
      });
      
      const data = await res.json();
      
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  }
  
  const resetForm = () => {
    setFormData({
      message: "",
      image: null,
      video: null,
      audio: null,
      command: "",
      type: "message",
    })
    setSelectedMediaType("none")
    setEditingMessage(null)
  }

  const handleOpenDialog = (msg = null) => {
    if (msg) {
      setEditingMessage(msg)
      setFormData({ ...msg })
      // Determine which media type is set
      if (msg.image) setSelectedMediaType("image")
      else if (msg.video) setSelectedMediaType("video")
      else if (msg.audio) setSelectedMediaType("audio")
      else setSelectedMediaType("none")
    } else {
      resetForm()
    }
    setIsOpen(true)
  }

  const handleMediaTypeChange = (type) => {
    setSelectedMediaType(type)
    setFormData({
      ...formData,
      image: null,
      video: null,
      audio: null,
    })
  }

  const handleFileSelect = (file) => {
    const newFormData = { ...formData, image: null, video: null, audio: null }
    if (selectedMediaType === "image") newFormData.image = file
    else if (selectedMediaType === "video") newFormData.video = file
    else if (selectedMediaType === "audio") newFormData.audio = file
    setFormData(newFormData)
  }
  
  const handleSave = async () => {
    try {
      if (!formData.message) {
        toast.error("Заповніть поле 'текст'")
        return
      }
      
      const fd = new FormData();
      if (editingMessage) fd.append("id", editingMessage._id);
      fd.append("message", formData.message);
      fd.append("type", formData.type);
      
      if (formData.image) fd.append("image", formData.image);
      if (formData.video) fd.append("video", formData.video);
      if (formData.audio) fd.append("audio", formData.audio);
      
      if (selectedMediaType === "none") {
        fd.append("removeMedia", "true");
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/updateMessageTemplate`, {
        method: "POST",
        headers: {
          "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
        },
        body: fd,
        credentials: "include",
      });
      
      toast.success("Повідомлення оновлено");
      setIsOpen(false);
      getMessage()
      
      resetForm();
    } catch (e) {
      console.error(e);
      toast.error("Помилка серверу");
    }
  };

  const getMediaInfo = (msg) => {
    if (msg.image && msg.image.length) return { type: "Фото", icon: ImageIcon, color: "blue" }
    if (msg.video && msg.video.length) return { type: "Відео", icon: Video, color: "purple" }
    if (msg.audio && msg.audio.length) return { type: "Аудіо", icon: Music, color: "green" }
    return null
  }

  const getCurrentFile = () => {
    if (selectedMediaType === "image") return formData.image
    if (selectedMediaType === "video") return formData.video
    if (selectedMediaType === "audio") return formData.audio
    return null
  }

  const getAcceptType = () => {
    if (selectedMediaType === "image") return "image/*"
    if (selectedMediaType === "video") return "video/*"
    if (selectedMediaType === "audio") return "audio/*"
    return "*/*"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Повідомлення бота</h1>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>

          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Редагувати повідомлення
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">

              <div className="space-y-2">
                <Label className="text-foreground">Текст *</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Введіть текст повідомлення..."
                  rows={4}
                  className="bg-secondary border-border"
                />
              </div>
              {editingMessage?.type !== 'button' ?
                <div className="space-y-4">
                  <Label className="text-foreground">Медіа файл</Label>
                  <RadioGroup
                    value={selectedMediaType}
                    onValueChange={handleMediaTypeChange}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none"/>
                      <Label htmlFor="none" className="cursor-pointer">
                        Без медіа
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id="image"/>
                      <Label htmlFor="image" className="cursor-pointer flex items-center gap-1">
                        <ImageIcon className="w-4 h-4"/> Фото
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="video" id="video"/>
                      <Label htmlFor="video" className="cursor-pointer flex items-center gap-1">
                        <Video className="w-4 h-4"/> Відео
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="audio" id="audio"/>
                      <Label htmlFor="audio" className="cursor-pointer flex items-center gap-1">
                        <Music className="w-4 h-4"/> Аудіо
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {selectedMediaType !== 'none' && (
                    <FileUpload
                      accept={getAcceptType()}
                      label={`Завантажити ${selectedMediaType === 'image' ? 'фото' : selectedMediaType === 'video' ? 'відео' : 'аудіо'}`}
                      currentFile={getCurrentFile()}
                      onFileSelect={handleFileSelect}
                      onRemove={() => handleFileSelect(null)}
                    />
                  )}
                </div>
                :
                <></>
              }
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="border-border">
                  Скасувати
                </Button>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  Зберегти
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {messages.map((msg) => {
          const mediaInfo = getMediaInfo(msg)
          return (
            <Card key={msg._id} className="bg-card border-border overflow-hidden">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedId(expandedId === msg._id ? null : msg._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${msg.type === 'button' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                      {msg.type === 'button' ?
                        <BotMessageSquare className="w-5 h-5 "/>
                        :
                        <MessageSquare className="w-5 h-5 text-primary"/>
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${msg.type === 'button' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}
                        >
                          {msg.type === 'button' ? 'Кнопка' : 'Повідомлення'}
                        </span>
                      </div>
                      <CardDescription className="text-muted-foreground line-clamp-1">
                        {msg.message.substring(0, 120)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenDialog(msg)
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                   
                    {expandedId === msg._id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedId === msg._id && (
                <CardContent className="border-t border-border pt-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Повний текст</Label>
                      <p className="mt-1 text-foreground whitespace-pre-wrap">{msg.message}</p>
                    </div>

                    {mediaInfo && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div
                          className={`w-8 h-8 rounded bg-${mediaInfo.color}-500/10 flex items-center justify-center`}
                        >
                          <mediaInfo.icon className={`w-4 h-4 text-${mediaInfo.color}-500`} />
                        </div>
                        {mediaInfo.type} прикріплено
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
