"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileUpload } from "@/components/file-upload"
import {
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Layers,
  ImageIcon,
  Video,
  Music,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from "lucide-react"
import { toast } from "sonner"

const api = {
  getCategories: () =>
    fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/categories`, {
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    }).then((r) => r.json()),
  
  updateCategoryOrder: (categories) =>
    fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/categories/update-order`, {
      method: "POST",
      body: JSON.stringify({ categories }),
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then((r) => r.json()),
  
  createCategory: (data) =>
    fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/category`, {
      method: "POST",
      body: data,
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    }),
  
  updateCategory: (id, data) => {
    data.append("id", id)
    return fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/category`, {
      method: "POST",
      body: data,
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    })
  },
  
  deleteCategory: (id) =>
    fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/category/${id}`, {
      method: "DELETE",
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    }),
  
  getCourses: () =>
    fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/courses`, {
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    }).then((r) => r.json()),
  
  createCourse: (data) =>
    fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/course`, {
      method: "POST",
      body: data,
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    }),
  
  updateCourse: (id, data) => {
    data.append("id", id)
    return fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/course`, {
      method: "POST",
      body: data,
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    })
  },
  
  deleteCourse: (id) =>
    fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/course/${id}`, {
      method: "DELETE",
      headers: {
        "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
      },
      credentials: "include",
    }),
}

export default function CoursesPage() {
  const [categories, setCategories] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isCourseOpen, setIsCourseOpen] = useState(false)
  const [isOptionOpen, setIsOptionOpen] = useState(false)
  
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingCourse, setEditingCourse] = useState(null)
  const [editingOption, setEditingOption] = useState(null)
  
  const [categoryForm, setCategoryForm] = useState({
    title: "",
    message: "",
    image: null,
    video: null,
    audio: null,
    active: true,
    removeMedia: false,
  })
  
  const [courseForm, setCourseForm] = useState({
    title: "",
    message: "",
    price: 0,
    image: null,
    video: null,
    audio: null,
    option: [],
    removeMedia: false,
    
  })
  
  const [optionForm, setOptionForm] = useState({
    title: "",
    message: "",
    main: false,
    image: null,
    video: null,
    audio: null,
    removeMedia: false,
  })
  
  const [categoryMediaType, setCategoryMediaType] = useState("none")
  const [courseMediaType, setCourseMediaType] = useState("none")
  const [optionMediaType, setOptionMediaType] = useState("none")
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesData, coursesData] = await Promise.all([api.getCategories(), api.getCourses()])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setCourses(Array.isArray(coursesData) ? coursesData : [])
    } catch (e) {
      console.error(e)
      toast.error("Помилка завантаження даних")
      setCategories([])
      setCourses([])
    } finally {
      setLoading(false)
    }
  }
  
  const resetCategoryForm = () => {
    setCategoryForm({
      title: "",
      message: "",
      image: null,
      video: null,
      audio: null,
      active: true,
      removeMedia: false,
    })
    setCategoryMediaType("none")
    setEditingCategory(null)
  }
  
  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      message: "",
      image: null,
      video: null,
      audio: null,
      price: 0,
      option: [],
      removeMedia: false,
    })
    setCourseMediaType("none")
    setEditingCourse(null)
  }
  
  const resetOptionForm = () => {
    setOptionForm({
      title: "",
      message: "",
      image: null,
      video: null,
      audio: null,
      main: false,
      removeMedia: false,
    })
    setOptionMediaType("none")
    setEditingOption(null)
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
  
  const handleCategoryMediaTypeChange = (type) => {
    setCategoryMediaType(type)
    setCategoryForm({ ...categoryForm, image: null, video: null, audio: null })
  }
  
  const handleCategoryFileSelect = (file) => {
    const newForm = { ...categoryForm, image: null, video: null, audio: null }
    if (categoryMediaType === "image") newForm.image = file
    else if (categoryMediaType === "video") newForm.video = file
    else if (categoryMediaType === "audio") newForm.audio = file
    setCategoryForm(newForm)
  }
  
  const getCategoryCurrentFile = () => {
    if (categoryMediaType === "image") return categoryForm.image
    if (categoryMediaType === "video") return categoryForm.video
    if (categoryMediaType === "audio") return categoryForm.audio
    return null
  }
  
  const handleOpenCategory = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        title: category.title || "",
        message: category.message || "",
        image: category?.image || null,
        video: category?.video || null,
        audio: category?.audio || null,
        active: category.active !== false,
      })
      if (category.image) setCategoryMediaType("image")
      else if (category.video) setCategoryMediaType("video")
      else if (category.audio) setCategoryMediaType("audio")
      else setCategoryMediaType("none")
    } else {
      resetCategoryForm()
    }
    setIsCategoryOpen(true)
  }
  
  const handleSaveCategory = async () => {
    if (!categoryForm.title) return toast.error("Введіть назву категорії")
    
    const formData = new FormData()
    formData.append("title", categoryForm.title)
    formData.append("message", categoryForm.message || "")
    formData.append("active", categoryForm.active)
    
    if (categoryForm.image) formData.append("image", categoryForm.image)
    if (categoryForm.video) formData.append("video", categoryForm.video)
    if (categoryForm.audio) formData.append("audio", categoryForm.audio)
    
    if(categoryMediaType === 'none'){
      formData.append("image", null)
      formData.append("video", null)
      formData.append("audio", null)
      formData.append("removeMedia", true)
    }
    
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory._id, formData)
        toast.success("Категорію оновлено")
      } else {
        await api.createCategory(formData)
        toast.success("Категорію створено")
      }
      setIsCategoryOpen(false)
      resetCategoryForm()
      loadData()
    } catch (e) {
      console.error(e)
      toast.error("Помилка при збереженні категорії")
    }
  }
  
  const handleDeleteCategory = async (id) => {
    try {
      await api.deleteCategory(id)
      toast.success("Категорію видалено")
      if (selectedCategory?._id === id) setSelectedCategory(null)
      loadData()
    } catch (e) {
      toast.error("Помилка видалення")
    }
  }
  
  const handleMoveCategoryUp = async (index) => {
    if (index === 0) return
    const newCategories = [...categories]
    const temp = newCategories[index]
    newCategories[index] = newCategories[index - 1]
    newCategories[index - 1] = temp
    
    try {
      await api.updateCategoryOrder(newCategories)
      toast.success("Порядок оновлено")
      loadData()
    } catch (e) {
      console.error(e)
      toast.error("Помилка при оновленні порядку")
    }
  }
  
  const handleMoveCategoryDown = async (index) => {
    if (index === categories.length - 1) return
    const newCategories = [...categories]
    const temp = newCategories[index]
    newCategories[index] = newCategories[index + 1]
    newCategories[index + 1] = temp
    
    try {
      await api.updateCategoryOrder(newCategories)
      toast.success("Порядок оновлено")
      loadData()
    } catch (e) {
      console.error(e)
      toast.error("Помилка при оновленні порядку")
    }
  }
  
  // Course handlers
  
  const handleCourseMediaTypeChange = (type) => {
    setCourseMediaType(type)
    setCourseForm({ ...courseForm, image: null, video: null, audio: null })
  }
  
  const handleCourseFileSelect = (file) => {
    const newForm = { ...courseForm, image: null, video: null, audio: null }
    if (courseMediaType === "image") newForm.image = file
    else if (courseMediaType === "video") newForm.video = file
    else if (courseMediaType === "audio") newForm.audio = file
    setCourseForm(newForm)
  }
  
  const getCourseCurrentFile = () => {
    if (courseMediaType === "image") return courseForm.image
    if (courseMediaType === "video") return courseForm.video
    if (courseMediaType === "audio") return courseForm.audio
    return null
  }
  
  const handleOpenCourse = (course = null) => {
    if (course) {
      setEditingCourse(course)
      setCourseForm({
        title: course.title || "",
        message: course.message || "",
        image: course?.image || null,
        video: course?.video || null,
        audio: course?.audio || null,
        price: course.price || 0,
        option: course.option || [],
      })
      if (course.image) setCourseMediaType("image")
      else if (course.video) setCourseMediaType("video")
      else if (course.audio) setCourseMediaType("audio")
      else setCourseMediaType("none")
    } else {
      resetCourseForm()
    }
    setIsCourseOpen(true)
  }
  
  const handleSaveCourse = async () => {
    if (!courseForm.title || !selectedCategory) return toast.error("Заповніть назву курсу")
    
    const formData = new FormData()
    formData.append("title", courseForm.title)
    formData.append("message", courseForm.message || "")
    formData.append("price", courseForm.price)
    formData.append("categoryId", selectedCategory._id)
    
    formData.append(
      "option",
      JSON.stringify(
        courseForm.option.map((opt) => ({
          title: opt.title,
          message: opt.message,
          main: opt.main || false,
          image: typeof opt.image === "string" ? opt.image : null,
          video: typeof opt.video === "string" ? opt.video : null,
          audio: typeof opt.audio === "string" ? opt.audio : null,
        })),
      ),
    )
    
    if (courseForm.image) formData.append("image", courseForm.image)
    if (courseForm.video) formData.append("video", courseForm.video)
    if (courseForm.audio) formData.append("audio", courseForm.audio)
    
    courseForm.option.forEach((opt, index) => {
      if (opt.image instanceof File) {
        formData.append(`optionMedia_${index}_image`, opt.image)
      }
      if (opt.video instanceof File) {
        formData.append(`optionMedia_${index}_video`, opt.video)
      }
      if (opt.audio instanceof File) {
        formData.append(`optionMedia_${index}_audio`, opt.audio)
      }
    })
    
    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse._id, formData)
        toast.success("Курс оновлено")
      } else {
        await api.createCourse(formData)
        toast.success("Курс створено")
      }
      setIsCourseOpen(false)
      resetCourseForm()
      loadData()
    } catch (e) {
      console.error(e)
      toast.error("Помилка при збереженні курсу")
    }
  }
  
  const handleDeleteCourse = async (id) => {
    try {
      await api.deleteCourse(id)
      toast.success("Курс видалено")
      loadData()
    } catch (e) {
      toast.error("Помилка видалення")
    }
  }
  
  // Option (lesson) handlers
  
  const handleOptionMediaTypeChange = (type) => {
    setOptionMediaType(type)
    setOptionForm({ ...optionForm, image: null, video: null, audio: null })
  }
  
  const handleOptionFileSelect = (file) => {
    const newForm = { ...optionForm, image: null, video: null, audio: null }
    if (optionMediaType === "image") newForm.image = file
    else if (optionMediaType === "video") newForm.video = file
    else if (optionMediaType === "audio") newForm.audio = file
    setOptionForm(newForm)
  }
  
  const getOptionCurrentFile = () => {
    if (optionMediaType === "image") return optionForm.image
    if (optionMediaType === "video") return optionForm.video
    if (optionMediaType === "audio") return optionForm.audio
    return null
  }
  
  const handleOpenOption = (option = null, index = null) => {
    if (option !== null) {
      setEditingOption(index)
      setOptionForm({
        title: option.title || "",
        message: option.message || "",
        main: option.main || false,
        image: option?.image || null,
        video: option?.video || null,
        audio: option?.audio || null,
      })
      if (option.image) setOptionMediaType("image")
      else if (option.video) setOptionMediaType("video")
      else if (option.audio) setOptionMediaType("audio")
      else setOptionMediaType("none")
    } else {
      resetOptionForm()
    }
    setIsOptionOpen(true)
  }
  
  const handleSaveOption = () => {
    if (!optionForm.title) return toast.error("Введіть назву опису")
    
    const optionToSave = { ...optionForm }
    
    if (editingOption !== null) {
      const newOptions = courseForm.option.map((o, i) => (i === editingOption ? optionToSave : o))
      setCourseForm({ ...courseForm, option: newOptions })
    } else {
      setCourseForm({ ...courseForm, option: [...courseForm.option, optionToSave] })
    }
    setIsOptionOpen(false)
    resetOptionForm()
  }
  
  const handleDeleteOption = (index) => {
    setCourseForm({
      ...courseForm,
      option: courseForm.option.filter((_, i) => i !== index),
    })
  }
  
  const categoryCourses = courses.filter((c) => c.categoryId === selectedCategory?._id)
  
  if (loading) {
    return <div className="flex items-center justify-center h-96">Завантаження...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Курси</h1>
          <p className="text-muted-foreground mt-1">Управління категоріями та курсами</p>
        </div>
        
        <Button onClick={() => handleOpenCategory()} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Нова категорія
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                Категорії
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Немає категорій</p>
                </div>
              ) : (
                categories.map((category, index) => (
                  <div
                    key={category._id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCategory?._id === category._id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <GripVertical className="w-4 h-4 shrink-0 opacity-50" />
                      <FolderOpen className="w-5 h-5 shrink-0" />
                      <div
                        className="min-w-0 flex-1"
                        onClick={() => {
                          setSelectedCategory(category)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{category.title}</p>
                          {!category.active && (
                            <Badge variant="secondary" className="text-xs">
                              Неактивна
                            </Badge>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            selectedCategory?._id === category._id
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          Кількість курсів: {courses.filter((c) => c.categoryId === category._id).length}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveCategoryUp(index)
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
                          handleMoveCategoryDown(index)
                        }}
                        disabled={index === categories.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenCategory(category)
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
                          handleDeleteCategory(category._id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Courses List */}
        <div className="lg:col-span-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {selectedCategory ? selectedCategory.title : "Оберіть категорію"}
                </CardTitle>
                
                {selectedCategory && (
                  <Button onClick={() => handleOpenCourse()} size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Додати курс
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedCategory ? (
                <div className="text-center py-16">
                  <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">Оберіть категорію зліва для перегляду курсів</p>
                </div>
              ) : categoryCourses.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">У цій категорії ще немає курсів</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryCourses.map((course) => (
                    <div key={course._id} className="p-4 rounded-lg bg-secondary border border-border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-primary font-semibold flex items-center gap-1">
                              {course.price} zl
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {course.option?.length || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenCourse(course)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteCourse(course._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Category Dialog */}
      <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingCategory ? "Редагувати категорію" : "Нова категорія"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Назва категорії *</Label>
              <Input
                value={categoryForm.title}
                onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                placeholder="Наприклад: IT Курси"
                className="bg-secondary border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Повідомлення</Label>
              <Textarea
                value={categoryForm.message || ""}
                onChange={(e) => setCategoryForm({ ...categoryForm, message: e.target.value })}
                placeholder="Опис категорії..."
                rows={3}
                className="bg-secondary border-border"
              />
            </div>
            
            <div className="space-y-4">
              <Label>Медіа файл</Label>
              <RadioGroup
                value={categoryMediaType}
                onValueChange={handleCategoryMediaTypeChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="cat-none" />
                  <Label htmlFor="cat-none" className="cursor-pointer">
                    Без медіа
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="cat-image" />
                  <Label htmlFor="cat-image" className="cursor-pointer flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" /> Фото
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="cat-video" />
                  <Label htmlFor="cat-video" className="cursor-pointer flex items-center gap-1">
                    <Video className="w-4 h-4" /> Відео
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="audio" id="cat-audio" />
                  <Label htmlFor="cat-audio" className="cursor-pointer flex items-center gap-1">
                    <Music className="w-4 h-4" /> Аудіо
                  </Label>
                </div>
              </RadioGroup>
              {categoryMediaType !== "none" && (
                <FileUpload
                  accept={getAcceptType(categoryMediaType)}
                  label={getMediaLabel(categoryMediaType)}
                  currentFile={getCategoryCurrentFile()}
                  onFileSelect={handleCategoryFileSelect}
                  onRemove={() => handleCategoryFileSelect(null)}
                />
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
              <Label>Активна категорія</Label>
              <Switch
                checked={categoryForm.active}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, active: checked })}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCategoryOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleSaveCategory} className="bg-primary">
                {editingCategory ? "Зберегти" : "Створити"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Course Dialog */}
      <Dialog open={isCourseOpen} onOpenChange={setIsCourseOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingCourse ? "Редагувати курс" : "Новий курс"}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary">
              <TabsTrigger value="general">Загальне</TabsTrigger>
              <TabsTrigger value="options">Опис ({courseForm.option.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Назва курсу *</Label>
                  <Input
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="Наприклад: Python для початківців"
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ціна (zl)</Label>
                  <Input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                    placeholder="0"
                    className="bg-secondary border-border"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="options" className="space-y-4 pt-4">
              <div className="flex justify-end">
                <Button onClick={() => handleOpenOption()} size="sm" className="bg-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Додати опис
                </Button>
              </div>
              
              {courseForm.option.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Ще немає опису</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {courseForm.option.map((opt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{opt.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {opt.main && <Badge className="bg-primary/20 text-primary">Головний</Badge>}
                            {(opt.image || opt.video || opt.audio) && <span>Медіа</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenOption(opt, index)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteOption(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
            <Button variant="outline" onClick={() => setIsCourseOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleSaveCourse} className="bg-primary">
              {editingCourse ? "Зберегти" : "Створити"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Option Dialog */}
      <Dialog open={isOptionOpen} onOpenChange={setIsOptionOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingOption !== null ? "Редагувати опис" : "Новий опис"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Назва опису *</Label>
              <Input
                value={optionForm.title}
                onChange={(e) => setOptionForm({ ...optionForm, title: e.target.value })}
                placeholder="Наприклад: Опис курсу"
                className="bg-secondary border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Опис</Label>
              <Textarea
                value={optionForm.message || ""}
                onChange={(e) => setOptionForm({ ...optionForm, message: e.target.value })}
                placeholder="Повідомлення..."
                rows={3}
                className="bg-secondary border-border"
              />
            </div>
            
            <div className="space-y-4">
              <Label>Медіа файл</Label>
              <RadioGroup
                value={optionMediaType}
                onValueChange={handleOptionMediaTypeChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="opt-none" />
                  <Label htmlFor="opt-none" className="cursor-pointer">
                    Без медіа
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="opt-image" />
                  <Label htmlFor="opt-image" className="cursor-pointer flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" /> Фото
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="opt-video" />
                  <Label htmlFor="opt-video" className="cursor-pointer flex items-center gap-1">
                    <Video className="w-4 h-4" /> Відео
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="audio" id="opt-audio" />
                  <Label htmlFor="opt-audio" className="cursor-pointer flex items-center gap-1">
                    <Music className="w-4 h-4" /> Аудіо
                  </Label>
                </div>
              </RadioGroup>
              
              {optionMediaType !== "none" && (
                <FileUpload
                  accept={getAcceptType(optionMediaType)}
                  label={getMediaLabel(optionMediaType)}
                  currentFile={getOptionCurrentFile()}
                  onFileSelect={handleOptionFileSelect}
                  onRemove={() => handleOptionFileSelect(null)}
                />
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
              <Label>Головний опис</Label>
              <Switch
                checked={optionForm.main}
                onCheckedChange={(checked) => setOptionForm({ ...optionForm, main: checked })}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsOptionOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleSaveOption} className="bg-primary">
                {editingOption !== null ? "Зберегти" : "Додати"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
