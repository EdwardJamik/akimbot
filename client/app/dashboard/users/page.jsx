"use client"

import {useEffect, useState} from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Ban, CheckCircle, User, Calendar, MessageSquare, Eye } from "lucide-react"
import { toast } from "sonner"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/getUsers`, {
          method: "GET",
          headers: {
            "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
          },
          credentials: "include",
        });
        
        const data = await res.json();
        
        setUsers(data);
      } catch (e) {
        console.error(e);
      }
    }
    
    getUser()
  }, [])
  
  const toggleBlock = async (userId) => {
    try {
      setUsers(users.map((u) => u._id === userId ? { ...u, ban: !u.ban } : u));
      
      const user = users.find((u) => u._id === userId);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/blockUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
        },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Помилка блокування");
      }
      
      toast.success(
        data.ban
          ? `Користувача ${user.first_name} заблоковано`
          : `Користувача ${user.first_name} розблоковано`
      );
      
    } catch (e) {
      console.error(e);
      toast.error("Сталася помилка при оновленні статусу");
    }
  };

  const openUserDetail = (user) => {
    setSelectedUser(user)
    setIsDetailOpen(true)
  }

  const getInitials = (first_name, last_name) => {
    return `${first_name?.[0] || ""}${last_name?.[0] || ""}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">Користувачі</h1>
      </div>

      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-[var(--foreground)]">Всього користувачів: {users.length}</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Пошук користувачів..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground)]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--border)] hover:bg-transparent">
                  <TableHead className="text-[var(--muted-foreground)]">Користувач</TableHead>
                  <TableHead className="text-[var(--muted-foreground)]">Telegram ID</TableHead>
                  <TableHead className="text-[var(--muted-foreground)]">Дата реєстрації</TableHead>
                  <TableHead className="text-[var(--muted-foreground)]">Активність</TableHead>
                  <TableHead className="text-[var(--muted-foreground)]">Статус</TableHead>
                  <TableHead className="text-[var(--muted-foreground)] text-right">Дії</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} className="border-[var(--border)]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--foreground)]">{user.chat_id}</TableCell>
                    <TableCell className="text-[var(--muted-foreground)]">
                      {new Date(user.createdAt).toLocaleString("pl-PL", {
  timeZone: "Europe/Warsaw",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})}
                    </TableCell>
                    <TableCell className="text-[var(--muted-foreground)]">
                      {new Date(user.updatedAt).toLocaleString("pl-PL", {
  timeZone: "Europe/Warsaw",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})}
                    </TableCell>
                    <TableCell>
                      {
                        user.is_user_ban ?
                          <Badge
                            variant={user.ban ? "destructive" : "outline"}
                            className={"bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20"}
                          >
                            Користувач заблокував бота
                          </Badge>
                          :
                          <Badge
                            variant={user.ban ? "destructive" : "outline"}
                            className={
                              user.ban
                                ? "bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20"
                                : "bg-green-500/10 text-green-500 border-green-500/20"
                            }
                          >
                            {user.ban ? "Заблокований" : "Активний"}
                          </Badge>
                      }
                      
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openUserDetail(user)}
                          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBlock(user._id)}
                          className={
                            user.ban
                              ? "text-green-500 hover:text-green-400 hover:bg-green-500/10"
                              : "text-[var(--destructive)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                          }
                        >
                          {user.ban ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div key={user._id} className="p-4 rounded-lg bg-[var(--secondary)] border border-[var(--border)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">{user.username}</p>
                    </div>
                  </div>
                  {
                    user.is_user_ban ?
                      <Badge
                        variant={user.ban ? "destructive" : "outline"}
                        className={"bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20"}
                      >
                        Користувач заблокував бота
                      </Badge>
                      :
                      <Badge
                        variant={user.ban ? "destructive" : "outline"}
                        className={
                          user.ban
                            ? "bg-[var(--destructive)]/10 text-[var(--destructive)] border-[var(--destructive)]/20"
                            : "bg-green-500/10 text-green-500 border-green-500/20"
                        }
                      >
                        {user.ban ? "Заблокований" : "Активний"}
                      </Badge>
                  }
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-[var(--muted-foreground)]">ID</p>
                    <p className="text-[var(--foreground)]">{user.chat_id}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted-foreground)]">Активність</p>
                    <p className="text-[var(--foreground)]">                      {new Date(user.updatedAt).toLocaleString("pl-PL", {
                      timeZone: "Europe/Warsaw",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openUserDetail(user)}
                    className="flex-1 border-[var(--border)] text-[var(--foreground)]"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Деталі
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBlock(user._id)}
                    className={
                      user.ban
                        ? "flex-1 border-green-500/20 text-green-500 hover:bg-green-500/10"
                        : "flex-1 border-[var(--destructive)]/20 text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                    }
                  >
                    {user.ban ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Розблокувати
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 mr-2" />
                        Заблокувати
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-[var(--muted-foreground)]">Користувачів не знайдено</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-[var(--card)] border-[var(--border)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)]">Інформація про користувача</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <p className="text-[var(--muted-foreground)]">@{selectedUser.username}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--secondary)]">
                  <User className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Telegram ID</p>
                    <p className="text-[var(--foreground)]">{selectedUser.chat_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--secondary)]">
                  <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Дата реєстрації</p>
                    <p className="text-[var(--foreground)]">
                      {new Date(selectedUser.createdAt).toLocaleString("pl-PL", {
  timeZone: "Europe/Warsaw",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--secondary)]">
                  <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Остання активність</p>
                    <p className="text-[var(--foreground)]">
                      {new Date(selectedUser.updatedAt).toLocaleString("pl-PL", {
  timeZone: "Europe/Warsaw",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--secondary)]">
                  <MessageSquare className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Рівень</p>
                    <p className="text-[var(--foreground)]">{selectedUser.final_level}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  toggleBlock(selectedUser._id)
                  setIsDetailOpen(false)
                }}
                className={
                  selectedUser.ban
                    ? "w-full bg-green-600 hover:bg-green-700 text-white"
                    : "w-full bg-[var(--destructive)] hover:bg-[var(--destructive)]/90 text-[var(--destructive-foreground)]"
                }
              >
                {selectedUser.ban ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Розблокувати користувача
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4 mr-2" />
                    Заблокувати користувача
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
