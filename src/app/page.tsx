"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gamepad2, BrainCircuit, BookUser, User, School } from 'lucide-react'

export default function Home() {
  const [quizCode, setQuizCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const router = useRouter()

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    if (quizCode.trim() && playerName.trim()) {
      // In a real app, you'd validate the quiz code against a backend.
      localStorage.setItem('playerName', playerName.trim())
      router.push(`/quiz/${quizCode.trim()}`)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--accent))] p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <BrainCircuit className="h-12 w-12 text-foreground" />
            <h1 className="text-5xl font-bold font-headline text-foreground">Đấu trường Quiz</h1>
        </div>
        <p className="text-foreground/80 text-lg">Chiến trường đố vui thời gian thực đỉnh cao.</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <Card className="w-full shadow-lg bg-card/50 backdrop-blur-sm border-border/30">
          <form onSubmit={handleJoinQuiz}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl"><Gamepad2 /> Tham gia Quiz</CardTitle>
              <CardDescription>Nhập mã quiz và tên của bạn để bắt đầu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-code">Mã Quiz</Label>
                <Input 
                  id="quiz-code" 
                  placeholder="ví dụ: 1234" 
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                  required 
                  className="text-base bg-transparent placeholder:text-foreground/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="player-name">Tên của bạn</Label>
                <Input 
                  id="player-name" 
                  placeholder="Nhập tên của bạn"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required 
                  className="text-base bg-transparent placeholder:text-foreground/60"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" size="lg">Vào Đấu trường</Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="w-full shadow-lg bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl"><BookUser /> Hướng dẫn sử dụng</CardTitle>
              <CardDescription>Làm theo các bước sau để bắt đầu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
               <div>
                <h3 className="font-semibold flex items-center gap-2 mb-1"><User /> Dành cho Người chơi:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/90">
                  <li>Nhận mã quiz từ giáo viên của bạn.</li>
                  <li>Nhập mã vào trường "Mã Quiz" ở trên.</li>
                  <li>Nhập tên của bạn.</li>
                  <li>Nhấp vào "Vào Đấu trường" để bắt đầu quiz!</li>
                </ol>
              </div>
            </CardContent>
             <CardFooter className="flex-col items-center">
                 <p className="text-sm text-foreground/80">Bạn là giáo viên?</p>
                <Button variant="secondary" onClick={() => router.push('/teacher/login')} className="text-foreground">
                  <School className="mr-2"/>
                  Khu vực giáo viên
                </Button>
            </CardFooter>
          </Card>
      </div>
    </main>
  )
}
