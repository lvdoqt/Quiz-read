"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gamepad2, BrainCircuit, BookUser, User, School, PlusCircle } from 'lucide-react'

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
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <BrainCircuit className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold font-headline text-foreground">Đấu trường Quiz</h1>
        </div>
        <p className="text-muted-foreground text-lg">Chiến trường đố vui thời gian thực đỉnh cao.</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <Card className="w-full shadow-lg">
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
                  className="text-base"
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
                  className="text-base"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" size="lg">Vào Đấu trường</Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl"><BookUser /> Hướng dẫn sử dụng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
               <div>
                <h3 className="font-semibold flex items-center gap-2 mb-1"><School /> Dành cho Giáo viên:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/90">
                  <li>Truy cập Khu vực giáo viên để đăng nhập.</li>
                  <li>Tạo một quiz mới bằng cách tải lên tệp câu hỏi dạng JSON.</li>
                  <li>Nhận mã quiz gồm 4 chữ số.</li>
                  <li>Chia sẻ mã này với học sinh của bạn để bắt đầu.</li>
                </ol>
              </div>
               <div>
                <h3 className="font-semibold flex items-center gap-2 mb-1 mt-4"><User /> Dành cho Người chơi:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/90">
                  <li>Nhận mã quiz từ giáo viên của bạn.</li>
                  <li>Nhập mã vào trường "Mã Quiz" ở trên.</li>
                  <li>Nhập tên của bạn.</li>
                  <li>Nhấp vào "Vào Đấu trường" để bắt đầu quiz!</li>
                </ol>
              </div>
            </CardContent>
             <CardFooter className="flex-col items-start gap-2">
                 <p className="text-sm text-muted-foreground">Bạn là giáo viên?</p>
                <Button variant="secondary" onClick={() => router.push('/teacher/login')} className="w-full">
                  <School className="mr-2"/>
                  Khu vực giáo viên
                </Button>
            </CardFooter>
          </Card>
      </div>
    </main>
  )
}
