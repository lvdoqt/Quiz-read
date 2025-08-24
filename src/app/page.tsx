"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gamepad2, BrainCircuit, BookUser, User } from 'lucide-react'

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
            <h1 className="text-5xl font-bold font-headline text-foreground">Quiz Arena</h1>
        </div>
        <p className="text-foreground/80 text-lg">The ultimate real-time trivia battleground.</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <Card className="w-full shadow-lg bg-card/50 backdrop-blur-sm border-border/30">
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
                  className="text-base bg-transparent placeholder:text-foreground/60"
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
                  className="text-base bg-transparent placeholder:text-foreground/60"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" size="lg">Enter Arena</Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="w-full shadow-lg bg-card/50 backdrop-blur-sm border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">How to Use</CardTitle>
              <CardDescription>Follow these steps to get started.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-1"><BookUser /> For Teachers:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/90">
                  <li>Click on "Create a New Quiz" below.</li>
                  <li>Fill in the 10 questions and their respective answer choices.</li>
                  <li>Mark the correct answer for each question.</li>
                  <li>Click "Generate Quiz" to get a unique code.</li>
                  <li>Share this code with your students.</li>
                </ol>
              </div>
               <div>
                <h3 className="font-semibold flex items-center gap-2 mb-1"><User /> For Players:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/90">
                  <li>Get the quiz code from your teacher.</li>
                  <li>Enter the code in the "Quiz Code" field above.</li>
                  <li>Enter your name.</li>
                  <li>Click "Enter Arena" to start the quiz!</li>
                </ol>
              </div>
            </CardContent>
             <CardFooter className="flex-col items-center">
                 <p className="text-sm text-foreground/80">Are you a teacher?</p>
                <Button variant="link" onClick={() => router.push('/create')} className="text-foreground">
                Create a New Quiz
                </Button>
            </CardFooter>
          </Card>
      </div>
    </main>
  )
}
