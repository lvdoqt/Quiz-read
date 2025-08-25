"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Player, Question, QuizData } from '@/lib/quiz-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Clock, CheckCircle, XCircle, Zap, Star, Target, Loader2, Home, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MathRenderer } from '@/components/ui/math-renderer'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, onSnapshot, setDoc, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast'


export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const { toast } = useToast();

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [playerName, setPlayerName] = useState('Người chơi');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = useMemo(() => quizData?.questions[currentQuestionIndex], [currentQuestionIndex, quizData]);

  // Fetch quiz data and setup player
  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      const docRef = doc(db, "quizzes", quizId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as QuizData;
        setQuizData(data);
        setTimeLeft(data.durationMinutes * 60);

        const name = localStorage.getItem('playerName') || 'Khách';
        setPlayerName(name);

        const playersColRef = collection(db, "quizzes", quizId, "players");
        const newPlayerDoc = await addDoc(playersColRef, {
          name,
          score: 0,
          avatar: `https://robohash.org/${name.split(' ').join('') || 'guest'}.png?size=40x40&set=set4`,
          joinedAt: serverTimestamp()
        });
        setPlayerId(newPlayerDoc.id);

      } else {
        setError(`Không tìm thấy bài quiz với mã "${quizId}". Vui lòng kiểm tra lại mã.`);
      }
      setIsLoading(false);
    };

    fetchQuiz().catch(err => {
      console.error(err);
      setError("Không thể tải quiz. Vui lòng kiểm tra kết nối và thử lại.");
      setIsLoading(false);
    });

  }, [quizId]);

  // Listen for player updates
  useEffect(() => {
    if (!quizId) return;
    const playersColRef = collection(db, "quizzes", quizId, "players");
    const q = query(playersColRef, orderBy("score", "desc"), orderBy("name"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const playersList: Player[] = [];
      querySnapshot.forEach((doc) => {
        playersList.push({ id: doc.id, ...doc.data() } as Player);
      });
      setPlayers(playersList);
    });

    return () => unsubscribe();
  }, [quizId]);


  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < (quizData?.questions.length ?? 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      router.push(`/quiz/${quizId}/results`);
    }
  }, [currentQuestionIndex, quizData?.questions.length, router, quizId]);
  
  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 && quizData) {
      router.push(`/quiz/${quizId}/results`);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, router, quizId, quizData]);

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !playerId || !currentQuestion) return;
    setIsAnswered(true);
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    let scoreIncrement = 0;
    
    if (isCorrect) {
      scoreIncrement = 10;
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    const playerDocRef = doc(db, "quizzes", quizId, "players", playerId);
    const playerDoc = await getDoc(playerDocRef);
    if(playerDoc.exists()){
      const currentScore = playerDoc.data().score || 0;
      await setDoc(playerDocRef, { score: currentScore + scoreIncrement }, { merge: true });
    }

    setTimeout(goToNextQuestion, 2000);
  }
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
  }
  
  if (error) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4"/>
        <h1 className="text-2xl font-bold text-destructive mb-2">Đã xảy ra lỗi</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push('/')}>
          <Home className="mr-2 h-4 w-4" />
          Quay về trang chủ
        </Button>
      </div>
     )
  }

  if (!currentQuestion) {
    return <div className="flex items-center justify-center min-h-screen bg-background">Đang chờ quiz bắt đầu...</div>
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm font-bold">
              <Target className="h-4 w-4 text-primary" />
              <span>Câu {currentQuestionIndex + 1}/{quizData?.questions.length}</span>
            </div>
            {streak > 1 && (
              <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold animate-bounce">
                <Zap className="h-3 w-3" />
                <span>{streak} streak!</span>
              </div>
            )}
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-300",
              timeLeft > 60 ? "bg-green-100 text-green-700" :
              timeLeft > 30 ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700 animate-pulse"
            )}>
              <Clock className="h-4 w-4" />
              <span className="tabular-nums">{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</span>
            </div>
          </div>
          <Progress 
            value={((currentQuestionIndex + 1) / (quizData?.questions.length ?? 1)) * 100} 
            className="w-full h-3" 
            indicatorClassName="bg-gradient-to-r from-cyan-400 to-blue-500"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content - Question */}
          <div className="w-full lg:w-2/3">
            <Card className="shadow-lg border-2 border-gray-100 h-full flex flex-col">
              <CardContent className="p-6 flex-grow flex flex-col">
                <div className="mb-6 flex-shrink-0">
                  {currentQuestion.image && (
                    <div className="mb-4 relative w-full h-48 rounded-lg overflow-hidden">
                      <Image 
                        src={currentQuestion.image} 
                        alt={`Hình ảnh cho câu hỏi ${currentQuestionIndex + 1}`} 
                        fill
                        style={{ objectFit: 'contain' }}
                        className="rounded-lg"
                        data-ai-hint="math problem"
                      />
                    </div>
                  )}
                  <CardTitle className="text-xl lg:text-2xl text-center font-bold text-green-700 leading-relaxed">
                    <MathRenderer text={currentQuestion.text} />
                  </CardTitle>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto">
                  {currentQuestion.options.map((option, i) => {
                    const isCorrect = option === currentQuestion.correctAnswer;
                    const isSelected = selectedAnswer === option;
                    const optionLabels = ['A', 'B', 'C', 'D'];
                    
                    return (
                      <Button
                        key={i}
                        variant="outline"
                        className={cn(
                          "group h-auto justify-start p-3 text-sm text-left whitespace-normal transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md min-h-[50px] rounded-lg",
                          "bg-green-50 border-2 border-green-100 hover:border-green-400 hover:bg-green-100 text-foreground",
                          isSelected && !isAnswered && "ring-4 ring-blue-300 border-blue-400 bg-blue-50",
                          isAnswered && isCorrect && "bg-green-100 border-green-500 text-foreground animate-pulse",
                          isAnswered && isSelected && !isCorrect && "bg-red-100 border-red-500 text-foreground animate-shake",
                          !isAnswered && "hover:text-green-800"
                        )}
                        onClick={() => setSelectedAnswer(option)}
                        disabled={isAnswered}
                      >
                        <div className="flex items-center w-full">
                          <div className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-md mr-3 flex-shrink-0 font-bold text-xs transition-all duration-300",
                            isSelected && !isAnswered && "bg-blue-500 text-white",
                            isAnswered && isCorrect && "bg-green-500 text-white",
                            isAnswered && isSelected && !isCorrect && "bg-red-500 text-white",
                            !isSelected && !isAnswered && "bg-white text-green-700 border border-green-200 group-hover:bg-green-200"
                          )}>
                            {isAnswered && isCorrect ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : isAnswered && isSelected && !isCorrect ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              optionLabels[i]
                            )}
                          </div>
                          <span className={cn("flex-1 text-left font-medium leading-tight", !isAnswered && "group-hover:text-green-800")}>
                            <MathRenderer text={option} />
                          </span>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="w-full lg:w-1/3">
            <Card className="shadow-lg border-2 border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <Trophy className="text-yellow-500 h-6 w-6" />
                  <span className="text-gray-700">Bảng xếp hạng</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
                  {players.map((player, index) => {
                    const isCurrentUser = player.id === playerId;
                    return (
                    <li key={player.id} className={cn(
                      "flex items-center justify-between p-2.5 rounded-lg transition-all duration-300",
                      isCurrentUser 
                        ? 'bg-blue-50 border-2 border-blue-200 shadow-md' 
                        : 'bg-gray-50'
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs text-white",
                          index === 0 && "bg-yellow-400",
                          index === 1 && "bg-gray-400",
                          index === 2 && "bg-amber-600",
                          index > 2 && "bg-gray-300 text-gray-600"
                        )}>
                          {index < 3 ? <Star className="h-3 w-3" /> : index + 1}
                        </div>
                        <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                          <AvatarImage src={player.avatar} alt={player.name} />
                          <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold truncate max-w-[120px] text-sm text-gray-800">{player.name}</p>
                          {isCurrentUser && (
                            <p className="text-xs text-blue-600 font-medium">Bạn</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">
                          {player.score}
                        </p>
                      </div>
                    </li>
                  )})}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer Submit Button */}
      <div className="w-full max-w-7xl mt-auto pt-6">
        <Button 
          onClick={handleSubmitAnswer} 
          disabled={!selectedAnswer || isAnswered} 
          className={cn(
            "w-full h-14 text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.01] shadow-lg",
            !selectedAnswer || isAnswered 
              ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl"
          )}
          size="lg"
        >
          {isAnswered ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin"/>
              Đang chuyển câu tiếp theo...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Gửi câu trả lời
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
