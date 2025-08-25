"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gamepad2, Trophy, School } from 'lucide-react'
import Image from 'next/image'


export default function Home() {
  const [quizCode, setQuizCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const router = useRouter()

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    if (quizCode.trim() && playerName.trim()) {
      localStorage.setItem('playerName', playerName.trim())
      router.push(`/quiz/${quizCode.trim()}`)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="text-center mb-10">
        <div className="flex justify-center items-center gap-4 mb-2">
            <Trophy className="h-16 w-16 text-primary" />
            <h1 className="text-6xl font-bold font-headline text-gray-800">Đấu trường Quiz</h1>
        </div>
        <p className="text-gray-500 text-xl">Chiến trường đố vui thời gian thực đỉnh cao.</p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Player Card */}
        <Card className="w-full shadow-2xl rounded-2xl transform hover:scale-[1.02] transition-transform duration-300">
          <form onSubmit={handleJoinQuiz}>
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                 <Gamepad2 className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Vào phòng thi</CardTitle>
              <CardDescription>Nhập mã quiz và tên của bạn để bắt đầu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8">
              <div className="relative">
                <Image 
                  src="https://lop12.com/wp-content/uploads/2025/08/Quiz-Game-Arena.png" 
                  alt="Học sinh tham gia quiz" 
                  width={600}
                  height={400}
                  className="rounded-lg object-cover"
                  data-ai-hint="students classroom fun"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-code" className="text-base font-semibold text-gray-700">Mã Quiz</Label>
                <Input 
                  id="quiz-code" 
                  placeholder="ví dụ: 1234" 
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                  required 
                  className="text-lg h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="player-name" className="text-base font-semibold text-gray-700">Tên của bạn</Label>
                <Input 
                  id="player-name" 
                  placeholder="Nhập tên của bạn"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required 
                  className="text-lg h-12"
                />
              </div>
            </CardContent>
            <CardFooter className="p-8">
              <Button type="submit" className="w-full text-lg h-14 rounded-xl">Vào Đấu trường</Button>
            </CardFooter>
          </form>
        </Card>

        {/* Teacher Card */}
        <Card className="w-full shadow-2xl rounded-2xl transform hover:scale-[1.02] transition-transform duration-300 flex flex-col">
            <CardHeader className="text-center">
               <div className="mx-auto bg-red-500/10 p-3 rounded-full w-fit mb-2">
                 <School className="h-10 w-10 text-red-500" />
              </div>
              <CardTitle className="text-3xl font-bold">Khu vực Giáo viên</CardTitle>
              <CardDescription>Tạo và quản lý các bài quiz của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-8 flex-grow flex flex-col">
               <div className="relative">
                <Image 
                  src="https://lop12.com/wp-content/uploads/2025/08/teacher-quiz.jpg" 
                  alt="Giáo viên tạo quiz" 
                  width={600}
                  height={400}
                  className="rounded-lg object-cover"
                  data-ai-hint="teacher laptop classroom"
                />
              </div>
              <div className="text-center text-gray-600 mt-4">
                <p className="text-base">
                  Chào mừng đến với <span className="font-bold text-primary">Đấu trường Quiz</span>! Nền tảng cho phép giáo viên dễ dàng tạo ra các cuộc thi trắc nghiệm hấp dẫn.
                </p>
                <p className="text-sm mt-2">
                  Tự động tạo câu hỏi bằng AI, quản lý bài thi và theo dõi kết quả của học sinh trong thời gian thực.
                </p>
                <p className="text-base">
                  <span className="font-bold text-primary">Liên hệ: Thầy Đồ - lvdoqt@gmail.com</span>
                </p>
              </div>
            </CardContent>
             <CardFooter className="p-8 mt-auto">
                <Button variant="destructive" onClick={() => router.push('/teacher/login')} className="w-full text-lg h-14 rounded-xl">
                  Truy cập
                </Button>
            </CardFooter>
          </Card>
      </div>
    </main>
  )
}
