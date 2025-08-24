"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { mockQuizQuestions, mockPlayers, Player, Question } from '@/lib/quiz-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Clock, CheckCircle, XCircle, Zap, Star, Target } from 'lucide-react'
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
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);


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
    setShowCorrectAnswer(true)
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, score: p.score + 10 } : p))
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }

    setTimeout(handleNext, 2000)
  }
  
  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players])

  if (!currentQuestion) {
    return <div className="flex items-center justify-center min-h-screen bg-background">Đang tải Quiz...</div>
  }

  return (
    <>
      {/* Main content with padding bottom to prevent overlap with fixed button */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 md:p-8 relative pb-28 lg:pb-24">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}}></div>
        </div>
        
        <div className="flex flex-col max-w-7xl mx-auto">
          {/* Question Card - Full width */}
          <div className="order-1 perspective min-h-[calc(100vh-160px)] lg:min-h-auto">
            <Card className={cn(
              "shadow-2xl w-full bg-white/80 backdrop-blur-sm flex flex-col transition-all duration-500 border-2 border-gradient-to-r from-blue-400/30 to-purple-400/30 hover:shadow-3xl lg:hover:scale-[1.02] lg:h-[calc(100vh-120px)]",
              isFlipping && "flip-card"
            )}>
              <div className='card-face card-front flex flex-col w-full h-full'>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        <Target className="h-4 w-4" />
                        <span>Câu {currentQuestionIndex + 1}/{quizQuestions.length}</span>
                      </div>
                      {streak > 1 && (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-orange-400 to-red-400 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce">
                          <Zap className="h-3 w-3" />
                          <span>{streak} streak!</span>
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all duration-300",
                      timeLeft > 60 ? "bg-gradient-to-r from-green-400 to-blue-400 text-white" :
                      timeLeft > 30 ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white animate-pulse" :
                      "bg-gradient-to-r from-red-400 to-pink-400 text-white animate-pulse"
                    )}>
                      <Clock className="h-4 w-4" />
                      <span className="tabular-nums">{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={((currentQuestionIndex + 1) / quizQuestions.length) * 100} 
                      className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-grow lg:flex-row lg:gap-8">
                  {/* Left side - Question and Answers */}
                  <div className="flex flex-col flex-grow lg:w-2/3">
                    {/* Question Section */}
                    <div className="mb-4 lg:mb-6 p-4 lg:p-6 rounded-2xl bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm border-2 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      {currentQuestion.image && (
                        <div className="mb-4 lg:mb-6 relative w-full h-32 lg:h-48 rounded-xl overflow-hidden shadow-lg">
                          <Image 
                            src={currentQuestion.image} 
                            alt={`Hình ảnh cho câu hỏi ${currentQuestionIndex + 1}`} 
                            fill
                            style={{ objectFit: 'contain' }}
                            className="rounded-xl lg:hover:scale-105 transition-transform duration-300"
                            data-ai-hint="math problem"
                          />
                        </div>
                      )}
                      <CardTitle className="text-base lg:text-xl font-bold text-center text-gray-800 leading-relaxed">
                        <MathRenderer text={currentQuestion.text} />
                      </CardTitle>
                    </div>

                    {/* Answer Options Section */}
                    <div className="flex-grow">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3 mb-4">
                        {currentQuestion.options.map((option, i) => {
                          const isCorrect = option === currentQuestion.correctAnswer
                          const isSelected = selectedAnswer === option
                          const optionLabels = ['A', 'B', 'C', 'D'];
                          
                          return (
                            <Button
                              key={i}
                              variant="outline"
                              className={cn(
                                "group relative h-auto justify-start p-2 lg:p-3 text-xs lg:text-sm text-left whitespace-normal transition-all duration-500 transform lg:hover:scale-[1.02] hover:shadow-lg min-h-[40px] lg:min-h-[50px]",
                                "bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 hover:border-blue-300/50 rounded-xl lg:rounded-2xl",
                                isSelected && !isAnswered && "ring-4 ring-blue-400/50 border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg lg:scale-[1.02]",
                                isAnswered && isCorrect && "bg-gradient-to-r from-green-400/20 to-emerald-400/20 border-green-400 text-foreground hover:from-green-400/30 hover:to-emerald-400/30 shadow-lg animate-pulse",
                                isAnswered && isSelected && !isCorrect && "bg-gradient-to-r from-red-400/20 to-pink-400/20 border-red-400 text-foreground hover:from-red-400/30 hover:to-pink-400/30 shadow-lg animate-shake",
                                !isAnswered && "lg:hover:bg-gradient-to-r lg:hover:from-blue-50 lg:hover:to-purple-50"
                              )}
                              onClick={() => handleAnswerSelect(option)}
                              disabled={isAnswered}
                            >
                              <div className="flex items-center w-full">
                                <div className={cn(
                                  "flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6 rounded-full mr-2 lg:mr-3 flex-shrink-0 font-bold text-xs transition-all duration-300",
                                  isSelected && !isAnswered && "bg-blue-500 text-white",
                                  isAnswered && isCorrect && "bg-green-500 text-white",
                                  isAnswered && isSelected && !isCorrect && "bg-red-500 text-white",
                                  !isSelected && !isAnswered && "bg-gray-200 text-gray-600 lg:group-hover:bg-blue-100 lg:group-hover:text-blue-600"
                                )}>
                                  {isAnswered && isCorrect ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : isAnswered && isSelected && !isCorrect ? (
                                    <XCircle className="h-3 w-3" />
                                  ) : (
                                    optionLabels[i]
                                  )}
                                </div>
                                <span className="flex-1 text-left font-medium text-gray-800 leading-tight lg:leading-relaxed">
                                  <MathRenderer text={option} />
                                </span>
                                {isAnswered && isSelected && (
                                  <span className={cn(
                                    "ml-2 text-xs font-bold",
                                    isCorrect ? "text-green-600 animate-pulse" : "text-red-600 animate-shake"
                                  )}>
                                    {isCorrect ? "Đúng!" : "Sai!"}
                                  </span>
                                )}
                              </div>
                              {/* Hover effect overlay */}
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-purple-400/0 lg:group-hover:from-blue-400/5 lg:group-hover:to-purple-400/5 rounded-xl lg:rounded-2xl transition-all duration-300 pointer-events-none"></div>
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Leaderboard (only on desktop) */}
                  <div className="hidden lg:block lg:w-1/3">
                    <div className="bg-white/60 backdrop-blur-sm border-2 border-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full">
                          <Trophy className="text-white h-4 w-4" />
                        </div>
                        <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent font-bold text-lg">
                          Bảng xếp hạng
                        </span>
                      </div>
                      <ul className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                        {sortedPlayers.map((player, index) => (
                          <li key={player.id} className={cn(
                            "flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:shadow-lg text-sm",
                            player.name === playerName 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg' 
                              : 'bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80'
                          )}>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs",
                                index === 0 && "bg-gradient-to-r from-yellow-400 to-orange-400 text-white",
                                index === 1 && "bg-gradient-to-r from-gray-300 to-gray-400 text-white",
                                index === 2 && "bg-gradient-to-r from-amber-600 to-amber-700 text-white",
                                index > 2 && "bg-gray-100 text-gray-600"
                              )}>
                                {index < 3 ? <Star className="h-3 w-3" /> : index + 1}
                              </div>
                              <Avatar className="h-6 w-6 ring-2 ring-white shadow-lg">
                                <AvatarImage src={player.avatar} alt={player.name} />
                                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold truncate max-w-[80px] text-xs text-gray-800">{player.name}</p>
                                {player.name === playerName && (
                                  <p className="text-xs text-blue-600 font-medium">Bạn</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {player.score}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </div>
              
              <div className='card-face card-back'>
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-2xl font-bold">Chuẩn bị câu hỏi tiếp theo...</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Mobile Leaderboard - Show below quiz on mobile */}
          <div className="order-2 lg:hidden mt-6">
            <Card className="shadow-2xl bg-white/80 backdrop-blur-sm border-2 border-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full">
                    <Trophy className="text-white h-4 w-4" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Bảng xếp hạng
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
                  {sortedPlayers.map((player, index) => (
                    <li key={player.id} className={cn(
                      "flex items-center justify-between p-3 rounded-2xl transition-all duration-300 hover:shadow-lg",
                      player.name === playerName 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg' 
                        : 'bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80'
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs",
                          index === 0 && "bg-gradient-to-r from-yellow-400 to-orange-400 text-white",
                          index === 1 && "bg-gradient-to-r from-gray-300 to-gray-400 text-white",
                          index === 2 && "bg-gradient-to-r from-amber-600 to-amber-700 text-white",
                          index > 2 && "bg-gray-100 text-gray-600"
                        )}>
                          {index < 3 ? <Star className="h-3 w-3" /> : index + 1}
                        </div>
                        <Avatar className="h-8 w-8 ring-2 ring-white shadow-lg">
                          <AvatarImage src={player.avatar} alt={player.name} />
                          <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold truncate max-w-[100px] text-sm text-gray-800">{player.name}</p>
                          {player.name === playerName && (
                            <p className="text-xs text-blue-600 font-medium">Bạn</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {player.score}
                        </p>
                        <p className="text-xs text-gray-500">điểm</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Fixed Submit Button at bottom */}
      <div className="fixed left-0 right-0 bottom-0 z-50 p-4 lg:p-6 bg-white/95 backdrop-blur-md border-t border-blue-200/50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Button 
            onClick={handleSubmitAnswer} 
            disabled={!selectedAnswer || isAnswered} 
            className={cn(
              "w-full max-w-md h-14 lg:h-16 text-base lg:text-lg font-bold rounded-2xl transition-all duration-300 transform lg:hover:scale-[1.02] shadow-lg",
              !selectedAnswer || isAnswered 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl"
            )}
            size="lg"
          >
            {isAnswered ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang chuyển câu tiếp theo...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 lg:h-5 lg:w-5" />
                Gửi câu trả lời
              </div>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
