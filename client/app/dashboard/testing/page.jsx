"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/file-upload"
import { Plus, Edit, Trash2, HelpCircle, BookOpen, ChevronUp, ChevronDown, ImageIcon, Video, Music } from "lucide-react"
import { toast } from "sonner"

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"]

const api = {
  getTasks: () =>
    fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/tasks`, {
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    }).then((r) => r.json()),
  
  createTask: (data) =>
    fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/task`, {
      method: "POST",
      body: data,
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    }),
  
  updateTask: (id, data) => {
    data.append("id", id)
    return fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/task`, {
      method: "POST",
      body: data,
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    })
  },
  
  updateTaskOrder: (data) => {
    return fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/tasks/update-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
      body: JSON.stringify(data)
    })
  },
  
  deleteTask: (id) =>
    fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/task/${id}`, {
      method: "DELETE",
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    }),
  
  getCategories: () =>
    fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/categories`, {
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    }).then((r) => r.json()),
  
  setTaskRecommend: (data) => {
    return fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/task-recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
      body: JSON.stringify(data)
    })
  }
}

export default function TestingPage() {
  const [tasks, setTasks] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedLevel, setSelectedLevel] = useState("A1")
  const [isTaskOpen, setIsTaskOpen] = useState(false)
  const [isRecommendOpen, setIsRecommendOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recommendedCourses, setRecommendedCourses] = useState({})
  
  const [taskForm, setTaskForm] = useState({
    question: "",
    media: null,
    mediaType: null,
    answers: ["", "", "", ""],
    correct_answer: 0,
    type: "A1",
    question_position: 1,
    recommended_course_id: null,
    removeMedia: false
  })
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      setLoading(true)
      const [tasksData, coursesData] = await Promise.all([api.getTasks(), api.getCategories()])
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setCourses(Array.isArray(coursesData) ? coursesData : [])
    } catch (e) {
      console.error(e)
      toast.error("Помилка завантаження даних")
      setTasks([])
      setCourses([])
    } finally {
      setLoading(false)
    }
  }
  
  const resetTaskForm = () => {
    const levelTasks = tasks.filter((t) => t.type === selectedLevel)
    const maxPosition = levelTasks.length > 0 ? Math.max(...levelTasks.map((t) => t.question_position)) : 0
    
    setTaskForm({
      question: "",
      media: null,
      mediaType: null,
      answers: ["", "", "", ""],
      correct_answer: 0,
      type: selectedLevel,
      question_position: maxPosition + 1,
      recommended_course_id: null,
    })
    setEditingTask(null)
  }
  
  const getAcceptType = (mediaType) => {
    if (mediaType === "image") return "image/*"
    if (mediaType === "video") return "video/*"
    if (mediaType === "audio") return "audio/*"
    return "*/*"
  }
  
  const getMediaLabel = (mediaType) => {
    if (mediaType === "image") return "Завантажити фото"
    if (mediaType === "video") return "Завантажити відео"
    if (mediaType === "audio") return "Завантажити аудіо"
    return "Завантажити файл"
  }
  
  const handleMediaTypeChange = (type) => {
    setTaskForm({ ...taskForm, media: null, mediaType: type, removeMedia: type === null })
  }
  
  const handleFileSelect = (file) => {
    setTaskForm({ ...taskForm, media: file, removeMedia: false})
  }
  
  const getCurrentFile = () => {
    return taskForm.media
  }
  
  const handleOpenTask = (task = null) => {
    if (task) {
      setEditingTask(task)
      setTaskForm({
        question: task.question || "",
        media: task.image || task.video || task.audio || null,
        mediaType: task.image ? "image" : task.video ? "video" : task.audio ? "audio" : null,
        answers: [...task.answers],
        correct_answer: task.correct_answer || 0,
        type: task.type || "A1",
        question_position: task.question_position || 1,
        recommended_course_id: task.recommended_course_id || null,
      })
    } else {
      resetTaskForm()
    }
    setIsTaskOpen(true)
  }
  
  const handleSaveTask = async () => {
    if (!taskForm.question) {
      toast.error("Введіть текст питання")
      return
    }
    
    const validAnswers = taskForm.answers.filter((a) => a.trim() !== "")
    if (validAnswers.length < 2) {
      toast.error("Додайте мінімум 2 варіанти відповідей")
      return
    }
    
    const formData = new FormData()
    formData.append("question", taskForm.question)
    formData.append("answers", JSON.stringify(validAnswers))
    formData.append("correct_answer", taskForm.correct_answer)
    formData.append("type", taskForm.type)
    formData.append("question_position", taskForm.question_position)
    formData.append("recommended_course_id", taskForm.recommended_course_id || "")
   
    formData.append("removeMedia", taskForm.removeMedia)
    
    if (taskForm.media) {
      if (taskForm.mediaType === "image") formData.append("image", taskForm.media)
      else if (taskForm.mediaType === "video") formData.append("video", taskForm.media)
      else if (taskForm.mediaType === "audio") formData.append("audio", taskForm.media)
    }
    
    try {
      if (editingTask) {
        await api.updateTask(editingTask._id, formData)
        toast.success("Питання оновлено")
      } else {
        await api.createTask(formData)
        toast.success("Питання створено")
      }
      setIsTaskOpen(false)
      resetTaskForm()
      loadData()
    } catch (e) {
      console.error(e)
      toast.error("Помилка при збереженні питання")
    }
  }
  
  const handleDeleteTask = async (id) => {
    try {
      await api.deleteTask(id)
      toast.success("Питання видалено")
      loadData()
    } catch (e) {
      toast.error("Помилка видалення")
    }
  }
  
  const handleTaskRecommend = async (id) => {
    try {
      const levelTasks = tasks.filter((t) => t.type === selectedLevel)

      await api.setTaskRecommend({tasks:levelTasks, id})
      
      await loadData()
      toast.success("Рекомендації оновлено")
    } catch (e) {
      toast.error("Помилка оновлення")
    }
  }
  
  const updateAnswer = (index, value) => {
    const newAnswers = [...taskForm.answers]
    newAnswers[index] = value
    setTaskForm({ ...taskForm, answers: newAnswers })
  }
  
  const addAnswer = () => {
    if (taskForm.answers.length < 6) {
      setTaskForm({ ...taskForm, answers: [...taskForm.answers, ""] })
    }
  }
  
  const removeAnswer = (index) => {
    if (taskForm.answers.length > 2) {
      const newAnswers = taskForm.answers.filter((_, i) => i !== index)
      let newCorrect = taskForm.correct_answer
      if (index === taskForm.correct_answer) newCorrect = 0
      else if (index < taskForm.correct_answer) newCorrect--
      setTaskForm({ ...taskForm, answers: newAnswers, correct_answer: newCorrect })
    }
  }
  
  const moveTask = async (taskId, direction) => {
    const taskIndex = tasks.findIndex((t) => t._id === taskId)
    const task = tasks[taskIndex]
    
    const levelTasks = tasks
      .filter((t) => t.type === task.type)
      .sort((a, b) => a.question_position - b.question_position)
    
    const posIndex = levelTasks.findIndex((t) => t._id === taskId)
    
    let updatedTasks = [...tasks]
    
    if (direction === "up" && posIndex > 0) {
      const prev = levelTasks[posIndex - 1]
      
      updatedTasks = updatedTasks.map((t) => {
        if (t._id === task._id) return { ...t, question_position: prev.question_position }
        if (t._id === prev._id) return { ...t, question_position: task.question_position }
        return t
      })
    }
    
    if (direction === "down" && posIndex < levelTasks.length - 1) {
      const next = levelTasks[posIndex + 1]
      
      updatedTasks = updatedTasks.map((t) => {
        if (t._id === task._id) return { ...t, question_position: next.question_position }
        if (t._id === next._id) return { ...t, question_position: task.question_position }
        return t
      })
    }
    
    setTasks(updatedTasks)
    
    await api.updateTaskOrder({
      tasks: updatedTasks
        .filter(t => t.type === task.type)
        .map(t => ({
          id: t._id,
          question_position: t.question_position
        }))
    })
  }

  const levelTasks = tasks
    .filter((t) => t.type === selectedLevel)
    .sort((a, b) => a.question_position - b.question_position)
  
  const getLevelStats = (level) => {
    return tasks.filter((t) => t.type === level).length
  }
  
  const getRecommendedCourseName = (level) => {
    const task = levelTasks[0]
    if (task?.recommended_course_id) {
      const course = courses.find((c) => c._id === task.recommended_course_id)
      return course?.title || "Невідомий курс"
    }
    return "Не обрано"
  }
  
  if (loading) {
    return <div className="flex items-center justify-center h-96">Завантаження...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Тестування</h1>
          <p className="text-muted-foreground mt-1">Управління питаннями для тестів по рівням</p>
        </div>
        
        <Button onClick={() => handleOpenTask()} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Додати питання
        </Button>
      </div>
      
      {/* Level Tabs */}
      <Tabs value={selectedLevel} onValueChange={setSelectedLevel} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 bg-secondary h-auto p-1">
          {levels.map((level) => (
            <TabsTrigger
              key={level}
              value={level}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
            >
              <span className="font-semibold">{level}</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {getLevelStats(level)}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {levels.map((level) => (
          <TabsContent key={level} value={level} className="mt-6">
            <Card className="bg-card border-border mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Рекомендований курс для {level}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg bg-secondary">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Після проходження тесту на рівень {level} буде рекомендовано:
                    </p>
                    <p className="font-medium text-foreground mt-1">{getRecommendedCourseName(level)}</p>
                  </div>
                  <Select
                    value={levelTasks[0]?.recommended_course_id || "none"}
                    onValueChange={(courseId) => {
                      if (levelTasks.length > 0) {
                        handleTaskRecommend(courseId)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-48 bg-background border-border">
                      <SelectValue placeholder="Обрати курс" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="none">Нічого не рекомендувати</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {levelTasks.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-16 text-center">
                  <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">Немає питань для рівня {level}</p>
                  <Button onClick={() => handleOpenTask()} className="mt-4 bg-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Додати перше питання
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {levelTasks.map((task, index) => (
                  <Card key={task._id} className="bg-card border-border overflow-hidden">
                    <CardHeader
                      className="cursor-pointer py-4"
                      onClick={() => setExpandedId(expandedId === task._id ? null : task._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {task.question_position}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground line-clamp-1">{task.question}</p>
                            <p className="text-sm text-muted-foreground">
                              {task.answers.length} відповідей
                              {task.image && ` • Фото`}
                              {task.video && ` • Відео`}
                              {task.audio && ` • Аудіо`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveTask(task._id, "up")
                            }}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveTask(task._id, "down")
                            }}
                            disabled={index === levelTasks.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenTask(task)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTask(task._id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedId === task._id && (
                      <CardContent className="border-t border-border pt-4">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">Повне питання</Label>
                            <p className="mt-1 text-foreground">{task.question}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm text-muted-foreground">Варіанти відповідей</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                              {task.answers.map((answer, i) => (
                                <div
                                  key={i}
                                  className={`p-3 rounded-lg border ${
                                    i === task.correct_answer
                                      ? "bg-green-500/10 border-green-500/50 text-green-400"
                                      : "bg-secondary border-border text-foreground"
                                  }`}
                                >
                                  <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                                  {answer}
                                  {i === task.correct_answer && (
                                    <Badge className="ml-2 bg-green-500/20 text-green-400">Правильна</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Task Dialog */}
      <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingTask ? "Редагувати питання" : "Нове питання"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Рівень *</Label>
                <Select value={taskForm.type} onValueChange={(value) => setTaskForm({ ...taskForm, type: value })}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Текст питання *</Label>
              <Textarea
                value={taskForm.question}
                onChange={(e) => setTaskForm({ ...taskForm, question: e.target.value })}
                placeholder="Введіть текст питання..."
                rows={3}
                className="bg-secondary border-border"
              />
            </div>
            
            <div className="space-y-4">
              <Label>Медіа файл</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="media-none"
                    name="mediaType"
                    value="none"
                    checked={!taskForm.mediaType}
                    onChange={() => handleMediaTypeChange(null)}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="media-none" className="cursor-pointer">
                    Без медіа
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="media-image"
                    name="mediaType"
                    value="image"
                    checked={taskForm.mediaType === "image"}
                    onChange={() => handleMediaTypeChange("image")}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="media-image" className="cursor-pointer flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" /> Фото
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="media-video"
                    name="mediaType"
                    value="video"
                    checked={taskForm.mediaType === "video"}
                    onChange={() => handleMediaTypeChange("video")}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="media-video" className="cursor-pointer flex items-center gap-1">
                    <Video className="w-4 h-4" /> Відео
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="media-audio"
                    name="mediaType"
                    value="audio"
                    checked={taskForm.mediaType === "audio"}
                    onChange={() => handleMediaTypeChange("audio")}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="media-audio" className="cursor-pointer flex items-center gap-1">
                    <Music className="w-4 h-4" /> Аудіо
                  </Label>
                </div>
              </div>
              
              {taskForm.mediaType && (
                <FileUpload
                  accept={getAcceptType(taskForm.mediaType)}
                  label={getMediaLabel(taskForm.mediaType)}
                  currentFile={getCurrentFile()}
                  onFileSelect={handleFileSelect}
                  onRemove={() => setTaskForm({ ...taskForm, media: null })}
                />
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Варіанти відповідей *</Label>
                {taskForm.answers.length < 6 && (
                  <Button type="button" variant="outline" size="sm" onClick={addAnswer}>
                    <Plus className="w-4 h-4 mr-1" />
                    Додати
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                {taskForm.answers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium shrink-0 cursor-pointer transition-colors ${
                        index === taskForm.correct_answer
                          ? "bg-green-500/20 text-green-400 border border-green-500/50"
                          : "bg-secondary text-muted-foreground border border-border hover:border-primary"
                      }`}
                      onClick={() => setTaskForm({ ...taskForm, correct_answer: index })}
                      title="Клікніть щоб вибрати правильну відповідь"
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Input
                      value={answer}
                      onChange={(e) => updateAnswer(index, e.target.value)}
                      placeholder={`Відповідь ${index + 1}`}
                      className="bg-secondary border-border flex-1"
                    />
                    {taskForm.answers.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeAnswer(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsTaskOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleSaveTask} className="bg-primary">
                {editingTask ? "Зберегти" : "Створити"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
