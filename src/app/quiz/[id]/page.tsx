"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { mockQuizQuestions, mockPlayers, Player, Question } from '@/lib/quiz-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Clock, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const QUIZ_DURATION_MINUTES = 15;

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string;

  const [quizQuestions, setQuizQuestions] = useState<Question[]>(mockQuizQuestions);
  const [playerName, setPlayerName] = useState('Người chơi')
  const [players, setPlayers] = useState<Player[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_MINUTES * 60)

  const currentQuestion = useMemo(() => quizQuestions[currentQuestionIndex], [currentQuestionIndex, quizQuestions])

  useEffect(() => {
    // In a real app, you'd fetch quiz data based on quizId
    const storedQuiz = localStorage.getItem(`quiz-${quizId}`);
    if (storedQuiz) {
      setQuizQuestions(JSON.parse(storedQuiz));
    }

    const name = localStorage.getItem('playerName') || 'Khách'
    setPlayerName(name)
    const userPlayer: Player = { id: 'p1', name, score: 0, avatar: `https://robohash.org/${name.split(' ').join('') || 'guest'}.png?size=40x40&set=set4` }
    setPlayers([userPlayer, ...mockPlayers])
  }, [quizId])

  useEffect(() => {
    if (timeLeft <= 0) {
      router.push(`/quiz/${params.id}/results?finalState=${btoa(JSON.stringify(players))}`)
      return
    }
    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, router, params.id, players])

  useEffect(() => {
    const botInterval = setInterval(() => {
      setPlayers(prevPlayers => 
        prevPlayers.map(p => {
          if (p.id !== 'p1' && Math.random() > 0.6) {
            const isCorrect = Math.random() > 0.3;
            return { ...p, score: p.score + (isCorrect ? 10 : 0) }
          }
          return p
        })
      )
    }, 3000)

    return () => clearInterval(botInterval)
  }, [])

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return
    setSelectedAnswer(option)
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return
    setIsAnswered(true)
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, score: p.score + 10 } : p))
    }

    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setSelectedAnswer(null)
        setIsAnswered(false)
      } else {
        router.push(`/quiz/${params.id}/results?finalState=${btoa(JSON.stringify(players))}`)
      }
    }, 2000)
  }
  
  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players])

  if (!currentQuestion) {
    return <div>Đang tải Quiz...</div>
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">Câu hỏi {currentQuestionIndex + 1} trên {quizQuestions.length}</p>
                <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm font-semibold">
                  <Clock className="h-4 w-4" />
                  <span>{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</span>
                </div>
              </div>
              <Progress value={((currentQuestionIndex + 1) / quizQuestions.length) * 100} className="w-full" />
              {currentQuestion.image && (
                <div className="mt-4 relative w-full h-64">
                   <Image 
                      src={currentQuestion.image} 
                      alt={`Hình ảnh cho câu hỏi ${currentQuestionIndex + 1}`} 
                      fill
                      style={{ objectFit: 'contain' }}
                      className="rounded-md"
                      data-ai-hint="math problem"
                    />
                </div>
              )}
              <CardTitle className="pt-6 text-2xl md:text-3xl font-headline">{currentQuestion.text}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, i) => {
                  const isCorrect = option === currentQuestion.correctAnswer
                  const isSelected = selectedAnswer === option
                  
                  return (
                    <Button
                      key={i}
                      variant="outline"
                      className={cn(
                        "h-auto justify-start p-4 text-base md:text-lg text-left whitespace-normal transition-all duration-300",
                        isSelected && !isAnswered && "ring-2 ring-primary border-primary",
                        isAnswered && isCorrect && "bg-accent/30 border-accent text-accent-foreground hover:bg-accent/40",
                        isAnswered && isSelected && !isCorrect && "bg-destructive/20 border-destructive text-destructive-foreground hover:bg-destructive/30"
                      )}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={isAnswered}
                    >
                      {isAnswered && isCorrect && <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="mr-2 h-5 w-5 flex-shrink-0" />}
                      {option}
                    </Button>
                  )
                })}
              </div>
              <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer || isAnswered} className="w-full mt-8" size="lg">
                {isAnswered ? 'Vui lòng đợi...' : 'Gửi câu trả lời'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" /> Bảng xếp hạng</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
                {sortedPlayers.map((player, index) => (
                  <li key={player.id} className={cn("flex items-center justify-between p-2 rounded-lg", player.name === playerName ? 'bg-primary/20' : 'bg-muted/50')}>
                    <div className="flex items-center gap-3">
                        <span className="font-bold w-6 text-center text-muted-foreground">{index + 1}</span>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={player.avatar} alt={player.name} />
                            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium truncate max-w-[120px]">{player.name}</p>
                    </div>
                    <p className="font-bold text-lg text-primary">{player.score}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
