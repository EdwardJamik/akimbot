"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileUpload } from "@/components/file-upload"
import { Send, Users, Clock, CheckCircle, AlertCircle, History, ImageIcon, Video, Music } from "lucide-react"
import { toast } from "sonner"

export default function BroadcastPage() {
  const [text, setText] = useState("")
  const [photo, setPhoto] = useState(null)
  const [video, setVideo] = useState(null)
  const [audio, setAudio] = useState(null)
  const [selectedMediaType, setSelectedMediaType] = useState("none")
  const [isSending, setIsSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [broadcastHistory, setBroadcastHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
  
  useEffect(() => {
    fetchHistoryAndUsers()
  }, [])
  
  const fetchHistoryAndUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/broadcast/history`, {
        headers: {
          "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
        },
        credentials: "include",
      })
      const data = await res.json()
      setBroadcastHistory(data.history || [])
      setTotalUsers(data.totalActiveUsers || 0)
    } catch (error) {
      console.error("Failed to fetch history:", error)
      toast.error("Помилка при завантаженні історії")
    } finally {
      setLoading(false)
    }
  }
  
  const handleMediaTypeChange = (type) => {
    setSelectedMediaType(type)
    setPhoto(null)
    setVideo(null)
    setAudio(null)
  }
  
  const getCurrentFile = () => {
    if (selectedMediaType === "image") return photo
    if (selectedMediaType === "video") return video
    if (selectedMediaType === "audio") return audio
    return null
  }
  
  const getAcceptType = () => {
    if (selectedMediaType === "image") return "image/*"
    if (selectedMediaType === "video") return "video/*"
    if (selectedMediaType === "audio") return "audio/*"
    return "*/*"
  }
  
  const handleFileSelect = (file) => {
    if (selectedMediaType === "image") setPhoto(file)
    else if (selectedMediaType === "video") setVideo(file)
    else if (selectedMediaType === "audio") setAudio(file)
  }
  
  const handleSend = async () => {
    if (!text.trim()) {
      toast.error("Введіть текст повідомлення")
      return
    }
    
    setIsSending(true)
    setProgress(0)
    
    try {
      const formData = new FormData()
      formData.append("message", text)
      if (photo) formData.append("image", photo)
      if (video) formData.append("video", video)
      if (audio) formData.append("audio", audio)
      
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 300)
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/broadcast/send`, {
        method: "POST",
        body: formData,
        headers: {
          "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
        },
        credentials: "include",
      })
      
      clearInterval(progressInterval)
      setProgress(100)
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success(`Розсилку надіслано ${data.totalUsers} користувачам`)
        setText("")
        setPhoto(null)
        setVideo(null)
        setAudio(null)
        setSelectedMediaType("none")
        await fetchHistoryAndUsers()
      } else {
        toast.error(data.message || "Помилка при відправці")
      }
    } catch (error) {
      console.error("Send error:", error)
      toast.error("Помилка при відправці розсилки")
    } finally {
      setIsSending(false)
      setProgress(0)
    }
  }
  
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Завершено
          </Badge>
        )
      case "sending":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Надсилається
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Помилка
          </Badge>
        )
      default:
        return null
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">Розсилка</h1>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-[var(--card)] border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)]">Нова розсилка</CardTitle>
            <CardDescription className="text-[var(--muted-foreground)]">
              Створіть повідомлення для всіх користувачів ({totalUsers} активних)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">Текст повідомлення *</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Введіть текст розсилки..."
                rows={6}
                className="bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground)]"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-[var(--foreground)]">Медіа файл</Label>
              <RadioGroup
                value={selectedMediaType}
                onValueChange={handleMediaTypeChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none" className="cursor-pointer">
                    Без медіа
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image" className="cursor-pointer flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" /> Фото
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="video" />
                  <Label htmlFor="video" className="cursor-pointer flex items-center gap-1">
                    <Video className="w-4 h-4" /> Відео
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="audio" id="audio" />
                  <Label htmlFor="audio" className="cursor-pointer flex items-center gap-1">
                    <Music className="w-4 h-4" /> Аудіо
                  </Label>
                </div>
              </RadioGroup>
              
              {selectedMediaType !== "none" && (
                <FileUpload
                  accept={getAcceptType()}
                  label={`Завантажити ${selectedMediaType === "image" ? "фото" : selectedMediaType === "video" ? "відео" : "аудіо"}`}
                  currentFile={getCurrentFile()}
                  onFileSelect={handleFileSelect}
                  onRemove={() => handleFileSelect(null)}
                />
              )}
            </div>
            {isSending && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Надсилання...</span>
                  <span className="text-[var(--foreground)]">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            <Button
              onClick={handleSend}
              disabled={isSending || !text.trim()}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)]"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Надсилання..." : `Надіслати`}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
            <History className="w-5 h-5" />
            Історія розсилок
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-[var(--muted-foreground)]">Завантаження...</div>
          ) : broadcastHistory.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted-foreground)]">Розсилок ще немає</div>
          ) : (
            <div className="space-y-4">
              {broadcastHistory.map((broadcast) => (
                <div
                  key={broadcast._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--secondary)] border border-[var(--border)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--foreground)] line-clamp-1">{broadcast.message}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(broadcast.sentAt).toLocaleString("uk-UA")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {broadcast.deliveredCount}/{broadcast.totalUsers}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(broadcast.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
