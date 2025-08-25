"use client"
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Trash2, PlusCircle, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Question, QuizData } from '@/lib/quiz-data'
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const { toast } = useToast();

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      setIsLoading(true);
      const docRef = doc(db, "quizzes", quizId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as QuizData;
        setQuizData(data);
        setQuestions(data.questions || []);
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: `Không tìm thấy quiz với mã ${quizId}.`
        });
        router.push('/teacher/dashboard');
      }
      setIsLoading(false);
    };

    fetchQuiz();
  }, [quizId, router, toast]);

  const handleQuestionChange = (index: number, field: keyof Question, value: string | string[]) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };
  
  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  }

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Basic validation
    if (questions.some(q => !q.text || q.options.some(o => !o) || !q.correctAnswer)) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin cho tất cả các câu hỏi và đáp án."
      });
      setIsSaving(false);
      return;
    }
    if (questions.some(q => !q.options.includes(q.correctAnswer))) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đáp án đúng phải là một trong các lựa chọn A, B, C, D."
      });
      setIsSaving(false);
      return;
    }

    try {
        const updatedQuizData = {
            ...quizData!,
            questions: questions,
            totalQuestions: questions.length,
        }
        await setDoc(doc(db, "quizzes", quizId), updatedQuizData);
        toast({
            title: "Thành công!",
            description: "Đã lưu các thay đổi của bạn."
        })
        router.push('/teacher/dashboard');
    } catch(error) {
        console.error("Error saving quiz: ", error);
        toast({
            variant: "destructive",
            title: "Lỗi Lưu",
            description: "Không thể lưu các thay đổi. Vui lòng thử lại."
        })
    } finally {
        setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="p-4 border-b flex justify-between items-center bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <Button variant="outline" onClick={() => router.push('/teacher/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Về trang quản lý
        </Button>
        <h1 className="text-xl font-bold">Chỉnh sửa Quiz: <span className='text-primary'>{quizId}</span></h1>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="space-y-6">
            {questions.map((q, qIndex) => (
                <Card key={qIndex} className="shadow-md">
                    <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle>Câu hỏi {qIndex + 1}</CardTitle>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xóa câu hỏi {qIndex + 1}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa câu hỏi này không?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeQuestion(qIndex)}>
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className='space-y-2'>
                            <Label htmlFor={`q-text-${qIndex}`}>Nội dung câu hỏi</Label>
                            <Textarea id={`q-text-${qIndex}`} value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} placeholder="Nhập nội dung câu hỏi tại đây..."/>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className='space-y-2'>
                                    <Label htmlFor={`q-${qIndex}-opt-${oIndex}`}>Lựa chọn {String.fromCharCode(65 + oIndex)}</Label>
                                    <Input id={`q-${qIndex}-opt-${oIndex}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} />
                                </div>
                            ))}
                        </div>
                         <div className='space-y-2'>
                            <Label htmlFor={`q-correct-${qIndex}`}>Đáp án đúng</Label>
                            <Input id={`q-correct-${qIndex}`} value={q.correctAnswer} onChange={e => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)} placeholder="Sao chép và dán nội dung đáp án đúng vào đây"/>
                            <p className="text-xs text-muted-foreground">Lưu ý: Nội dung đáp án đúng phải khớp chính xác với một trong các lựa chọn ở trên.</p>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button variant="outline" className='w-full' onClick={addQuestion}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm câu hỏi
            </Button>
        </div>
      </main>
    </div>
  );
}
