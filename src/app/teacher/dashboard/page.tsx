"use client"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PlusCircle, ListChecks, LogOut, BrainCircuit } from 'lucide-react'

export default function TeacherDashboard() {
  const router = useRouter()

  const handleLogout = () => {
    // In a real app, you'd clear the session/token
    localStorage.removeItem('teacherLoggedIn');
    router.push('/teacher/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--accent))] p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <BrainCircuit className="h-12 w-12 text-foreground" />
            <h1 className="text-5xl font-bold font-headline text-foreground">Trang quản lý giáo viên</h1>
        </div>
        <p className="text-foreground/80 text-lg">Quản lý các bài quiz của bạn tại đây.</p>
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-lg bg-card/50 backdrop-blur-sm border-border/30">
          <CardHeader>
            <CardTitle>Hành động</CardTitle>
            <CardDescription>Chọn một hành động để bắt đầu.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => router.push('/create')}>
              <PlusCircle className="h-8 w-8" />
              <span className="font-semibold">Tạo Quiz mới</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" disabled>
              <ListChecks className="h-8 w-8" />
              <span className="font-semibold">Quản lý Quiz (sắp có)</span>
            </Button>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full mt-4" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
