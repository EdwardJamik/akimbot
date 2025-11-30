"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, Send, GraduationCap } from "lucide-react"
import {useEffect, useState} from 'react'


export default function DashboardPage() {
  const [isStats, setStats] = useState([])
  
  useEffect(() => {
    const getUserCounter = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/api/v1/admin/getUserCount`, {
          headers: {
            "x-key": process.env.NEXT_PUBLIC_ADMIN_KEY,
          },
          credentials: "include",
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setStats([{ title: "Користувачі", value: data, icon: Users, color: "text-blue-500" }])
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    }
    
    getUserCounter();

  }, [])
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">Панель керування</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Огляд статистики</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isStats.map((stat) => (
          <Card key={stat.title} className="bg-[var(--card)] border-[var(--border)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">{stat.title}</CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
