"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Wand2, Upload } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Question } from '@/lib/quiz-data'

export default function CreateQuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fileName, setFileName] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const parsedQuestions = JSON.parse(content);
            // Basic validation
            if (Array.isArray(parsedQuestions) && parsedQuestions.every(q => q.text && q.options && q.correctAnswer)) {
              setQuestions(parsedQuestions);
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


  const handleCreateQuiz = () => {
    if (questions.length === 0) {
      toast({
        variant: "destructive",
        title: "Chưa có câu hỏi",
        description: "Vui lòng tải lên một tệp JSON chứa các câu hỏi.",
      });
      return;
    }
    const quizCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Quiz Data:", questions);
    // Here you would typically save the quiz to a database
    localStorage.setItem(`quiz-${quizCode}`, JSON.stringify(questions));

    toast({
      title: "Tạo Quiz thành công!",
      description: `Mã quiz của bạn là: ${quizCode}. Hãy chia sẻ với học sinh của bạn!`,
      duration: 10000,
    });
     router.push('/teacher/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
        <header className="p-4 border-b">
            <Button variant="outline" onClick={() => router.push('/teacher/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Về trang quản lý
            </Button>
        </header>
        <main className="container mx-auto py-8 px-4">
            <Card className="max-w-2xl mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Tạo Quiz mới</CardTitle>
                    <CardDescription>Tải lên một tệp JSON chứa danh sách các câu hỏi của bạn.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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

                    {questions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Xem trước Quiz</h3>
                        <p className="text-sm text-muted-foreground">Đã tải {questions.length} câu hỏi.</p>
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

                    <Button onClick={handleCreateQuiz} className="w-full mt-6" size="lg" disabled={questions.length === 0}>
                        <Wand2 className="mr-2 h-5 w-5" />
                        Tạo Quiz
                    </Button>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
