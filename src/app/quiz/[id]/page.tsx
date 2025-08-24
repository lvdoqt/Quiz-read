"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { mockQuizQuestions, mockPlayers, Player, Question } from '@/lib/quiz-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Clock, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MathRenderer } from '@/components/ui/math-renderer'

const QUIZ_DURATION_MINUTES = 15;

function encodeState(state: any): string {
  try {
    const jsonString = JSON.stringify(state);
    const encoded = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
    }));
    return encoded;
  } catch (error) {
    console.error("Encoding failed:", error);
    return '';
  }
}

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string;

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [playerName, setPlayerName] = useState('Người chơi')
  const [players, setPlayers] = useState<Player[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_MINUTES * 60)
  const [isFlipping, setIsFlipping] = useState(false);


  const currentQuestion = useMemo(() => quizQuestions[currentQuestionIndex], [currentQuestionIndex, quizQuestions])

  useEffect(() => {
    const storedQuiz = localStorage.getItem(`quiz-${quizId}`);
    if (storedQuiz) {
        try {
            const parsedQuestions = JSON.parse(storedQuiz);
            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
              setQuizQuestions(parsedQuestions);
            } else {
              setQuizQuestions(mockQuizQuestions); // Fallback to mock
            }
        } catch(e) {
            console.error("Failed to parse quiz from localStorage", e);
            setQuizQuestions(mockQuizQuestions); // Fallback to mock
        }
    } else {
       setQuizQuestions(mockQuizQuestions); // Fallback to mock
    }

    const name = localStorage.getItem('playerName') || 'Khách'
    setPlayerName(name)
    const userPlayer: Player = { id: 'p1', name, score: 0, avatar: `https://robohash.org/${name.split(' ').join('') || 'guest'}.png?size=40x40&set=set4` }
    setPlayers([userPlayer, ...mockPlayers])
  }, [quizId])

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      router.push(`/quiz/${params.id}/results?finalState=${encodeState(players)}`);
    }
  }, [currentQuestionIndex, quizQuestions.length, router, params.id, players]);
  
  const handleNext = useCallback(() => {
    setIsFlipping(true);
    setTimeout(() => {
      goToNextQuestion();
      setIsFlipping(false);
    }, 500); // Duration of the flip animation
  }, [goToNextQuestion]);


  useEffect(() => {
    if (timeLeft <= 0) {
      router.push(`/quiz/${params.id}/results?finalState=${encodeState(players)}`)
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

    setTimeout(handleNext, 2000)
  }
  
  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players])

  if (!currentQuestion) {
    return <div className="flex items-center justify-center min-h-screen bg-background">Đang tải Quiz...</div>
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <div className="lg:col-span-2 perspective">
          <Card className={cn("shadow-lg w-full min-h-[500px] bg-card flex flex-col transition-transform duration-500", isFlipping && "flip-card")}>
            <div className='card-face card-front flex flex-col w-full h-full'>
              <CardHeader>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-muted-foreground">Câu hỏi {currentQuestionIndex + 1} trên {quizQuestions.length}</p>
                  <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm font-semibold">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</span>
                  </div>
                </div>
                <Progress value={((currentQuestionIndex + 1) / quizQuestions.length) * 100} className="w-full" />
                
                <div className="mt-6 p-4 rounded-lg bg-muted/50 border-2 border-primary/30 min-h-[120px] flex items-center justify-center">
                    {currentQuestion.image && (
                        <div className="mb-4 relative w-full h-64">
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
                    <CardTitle className="text-xl md:text-2xl font-headline text-center">
                        <MathRenderer text={currentQuestion.text} />
                    </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow pb-8">
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
                           "bg-background/20 border-border hover:bg-muted",
                          isSelected && !isAnswered && "ring-2 ring-primary border-primary bg-primary/10",
                          isAnswered && isCorrect && "bg-green-500/20 border-green-500 text-foreground hover:bg-green-500/30",
                          isAnswered && isSelected && !isCorrect && "bg-red-500/20 border-red-500 text-foreground hover:bg-red-500/30"
                        )}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={isAnswered}
                      >
                          <div className="flex items-center w-full">
                              {isAnswered && isCorrect && <CheckCircle className="mr-3 h-6 w-6 flex-shrink-0 text-green-500" />}
                              {isAnswered && isSelected && !isCorrect && <XCircle className="mr-3 h-6 w-6 flex-shrink-0 text-red-500" />}
                              <span className="flex-1 text-left"><MathRenderer text={option} /></span>
                          </div>
                      </Button>
                    )
                  })}
                </div>
                <div className="flex-grow" />
                <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer || isAnswered} className="w-full mt-8" size="lg">
                  {isAnswered ? 'Vui lòng đợi...' : 'Gửi câu trả lời'}
                </Button>
              </CardContent>
            </div>
            <div className='card-face card-back'>
                <div className="flex items-center justify-center h-full">
                    <p className="text-2xl font-bold">Chuẩn bị câu hỏi tiếp theo...</p>
                </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-400" /> Bảng xếp hạng</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 max-h-[60vh] lg:max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
                {sortedPlayers.map((player, index) => (
                  <li key={player.id} className={cn("flex items-center justify-between p-3 rounded-lg", player.name === playerName ? 'bg-primary/10 border' : 'bg-muted/50')}>
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
