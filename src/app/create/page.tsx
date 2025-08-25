"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Wand2, Upload, Bot, Loader2, FileJson, Pencil } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Question } from '@/lib/quiz-data'
import { generateQuiz } from '@/ai/flows/quiz-generator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth'

export default function CreateQuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fileName, setFileName] = useState('');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [duration, setDuration] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        toast({
          variant: "destructive",
          title: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để tạo quiz.",
        });
        router.push('/teacher/login');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const parsedContent = JSON.parse(content);
            const parsedQuestions = Array.isArray(parsedContent) ? parsedContent : parsedContent.questions;
            
            if (Array.isArray(parsedQuestions) && parsedQuestions.every(q => q.text && q.options && q.correctAnswer)) {
              setQuestions(parsedQuestions);
              setNumQuestions(parsedQuestions.length);
              setFileName(file.name);
               toast({
                title: "Tải tệp thành công!",
                description: `Đã tải ${parsedQuestions.length} câu hỏi từ tệp ${file.name}.`,
              });
            } else {
              throw new Error("Invalid JSON format");
            }
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Lỗi!",
            description: "Tệp JSON không hợp lệ hoặc không đúng định dạng.",
          });
          setQuestions([]);
          setFileName('');
        }
      };
      reader.readAsText(file);
    } else {
      toast({
        variant: "destructive",
        title: "Lỗi!",
        description: "Vui lòng chọn một tệp JSON.",
      });
      setQuestions([]);
      setFileName('');
    }
  };

  const handleGenerateQuiz = async () => {
    if (!topic || numQuestions <= 0) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập chủ đề và số câu hỏi hợp lệ.",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateQuiz({ topic, numQuestions });
      if (result && result.questions) {
        setQuestions(result.questions);
        toast({
          title: "Tạo đề thành công!",
          description: `Đã tạo ${result.questions.length} câu hỏi về chủ đề "${topic}".`,
        });
      } else {
        throw new Error("Không nhận được câu hỏi từ AI.");
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Lỗi tạo đề bằng AI",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!currentUser) {
       toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xác định người dùng. Vui lòng đăng nhập lại.",
      });
      return;
    }
    if (questions.length === 0) {
      toast({
        variant: "destructive",
        title: "Chưa có câu hỏi",
        description: "Vui lòng tạo câu hỏi bằng AI hoặc tải lên tệp JSON.",
      });
      return;
    }
    setIsSaving(true);
    const quizCode = Math.floor(1000 + Math.random() * 9000).toString();
    const quizData = {
      teacherId: currentUser.uid,
      questions,
      durationMinutes: duration,
      totalQuestions: questions.length
    };
    
    try {
        await setDoc(doc(db, "quizzes", quizCode), quizData);
        toast({
            title: "Tạo Quiz thành công!",
            description: `Mã quiz của bạn là: ${quizCode}. Hãy chia sẻ với học sinh của bạn!`,
            duration: 10000,
        });
        router.push('/teacher/dashboard');
    } catch(error) {
        console.error("Error creating quiz:", error);
        toast({
            variant: "destructive",
            title: "Lỗi lưu Quiz",
            description: "Không thể lưu quiz lên cơ sở dữ liệu. Vui lòng thử lại."
        })
    } finally {
        setIsSaving(false);
    }
  };

  if (!currentUser) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
        <header className="p-4 border-b">
            <Button variant="outline" onClick={() => router.push('/teacher/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Về trang quản lý
            </Button>
        </header>
        <main className="container mx-auto py-8 px-4">
            <Card className="max-w-4xl mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Tạo Quiz mới</CardTitle>
                    <CardDescription>Tạo câu hỏi bằng AI, tự soạn hoặc tải lên từ tệp JSON.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="numQuestions">Số lượng câu hỏi</Label>
                            <Input id="numQuestions" type="number" value={numQuestions} onChange={e => setNumQuestions(parseInt(e.target.value))} min="1" max="50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Thời gian làm bài (phút)</Label>
                            <Input id="duration" type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} min="1" />
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="ai"><Bot className="mr-2 h-4 w-4"/>Tạo bằng AI</TabsTrigger>
                        <TabsTrigger value="manual"><Pencil className="mr-2 h-4 w-4"/>Tự soạn</TabsTrigger>
                        <TabsTrigger value="upload"><FileJson className="mr-2 h-4 w-4"/>Tải tệp JSON</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="ai" className="mt-4 p-4 border rounded-md">
                         <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="topic">Chủ đề câu hỏi</Label>
                                <Input id="topic" placeholder="ví dụ: Lịch sử Việt Nam, Hóa học lớp 12..." value={topic} onChange={e => setTopic(e.target.value)} />
                            </div>
                            <Button onClick={handleGenerateQuiz} disabled={isGenerating} className="w-full">
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                                {isGenerating ? 'Đang tạo đề...' : 'Tạo đề tự động'}
                            </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="manual" className="mt-4 p-4 border rounded-md">
                        <p className="text-center text-muted-foreground">(Tính năng đang được phát triển)</p>
                      </TabsContent>

                      <TabsContent value="upload" className="mt-4 p-4 border rounded-md">
                         <div className="space-y-2">
                            <Label htmlFor="quiz-file">Tệp câu hỏi (.json)</Label>
                            <div className="flex items-center gap-4">
                                <Input id="quiz-file" type="file" accept=".json" onChange={handleFileChange} className="hidden" />
                                <Label htmlFor="quiz-file" className="flex-grow">
                                    <div className="h-12 border border-dashed border-input rounded-md flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                                    {fileName ? (
                                        <span className="text-sm font-medium text-foreground">{fileName}</span>
                                    ) : (
                                        <div className='flex items-center gap-2 text-muted-foreground'>
                                        <Upload className="h-5 w-5" />
                                        <span>Nhấp để chọn tệp</span>
                                        </div>
                                    )}
                                    </div>
                                </Label>
                            </div>
                            <p className="text-xs text-muted-foreground pt-1">
                                Chưa có tệp mẫu? {" "}
                                <a href="/quiz-example.json" download className="underline hover:text-primary">Tải tệp JSON mẫu tại đây.</a>
                            </p>
                         </div>
                      </TabsContent>
                    </Tabs>

                    {questions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Xem trước Quiz</h3>
                        <p className="text-sm text-muted-foreground">Đã có {questions.length} câu hỏi. Tổng thời gian: {duration} phút.</p>
                        <div className="mt-4 max-h-60 overflow-y-auto space-y-2 rounded-md border p-4">
                          {questions.map((q, i) => (
                            <div key={i} className="text-xs border-b pb-2 last:border-b-0">
                              <p className="font-bold">{i+1}. {q.text}</p>
                              <p className="text-green-600">Đáp án: {q.correctAnswer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button onClick={handleCreateQuiz} className="w-full mt-6" size="lg" disabled={questions.length === 0 || isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                        {isSaving ? "Đang lưu..." : "Lưu và Tạo Quiz"}
                    </Button>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
