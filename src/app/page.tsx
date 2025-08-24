"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gamepad2, BrainCircuit } from 'lucide-react'

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
            <h1 className="text-5xl font-bold font-headline text-primary-foreground">Quiz Arena</h1>
        </div>
        <p className="text-muted-foreground text-lg">The ultimate real-time trivia battleground.</p>
      </div>

      <div className="w-full max-w-md">
        <Card className="w-full shadow-lg">
          <form onSubmit={handleJoinQuiz}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl"><Gamepad2 /> Join a Quiz</CardTitle>
              <CardDescription>Enter a quiz code and your name to start.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-code">Quiz Code</Label>
                <Input 
                  id="quiz-code" 
                  placeholder="e.g., A1B2C3" 
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                  required 
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="player-name">Your Name</Label>
                <Input 
                  id="player-name" 
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required 
                  className="text-base"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" size="lg">Enter Arena</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">Or, if you are a teacher...</p>
        <Button variant="link" onClick={() => router.push('/create')} className="text-primary">
          Create a New Quiz
        </Button>
      </div>
    </main>
  )
}
