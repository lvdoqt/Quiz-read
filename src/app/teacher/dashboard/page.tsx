"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PlusCircle, Trash2, Pencil, LogOut, BrainCircuit, Loader2 } from 'lucide-react'
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
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface StoredQuiz {
  code: string;
  questionCount: number;
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<StoredQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "quizzes"));
        const loadedQuizzes: StoredQuiz[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedQuizzes.push({
            code: doc.id,
            questionCount: data.questions?.length || 0,
          });
        });
        setQuizzes(loadedQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes: ", error);
        toast({
          variant: "destructive",
          title: "Lỗi tải danh sách quiz",
          description: "Không thể kết nối đến cơ sở dữ liệu."
        })
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuizzes();
  }, [toast]);
  
  const handleLogout = () => {
    localStorage.removeItem('teacherLoggedIn');
    router.push('/teacher/login');
  };

  const deleteQuiz = async (quizCode: string) => {
    try {
      await deleteDoc(doc(db, "quizzes", quizCode));
      setQuizzes(quizzes.filter(q => q.code !== quizCode));
      toast({
        title: "Xóa thành công!",
        description: `Đã xóa quiz có mã ${quizCode}.`
      })
    } catch(error) {
      console.error("Error deleting quiz: ", error);
      toast({
        variant: "destructive",
        title: "Lỗi xóa quiz",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại."
      })
    }
  };


  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-2">
              <BrainCircuit className="h-12 w-12 text-primary" />
              <h1 className="text-5xl font-bold font-headline text-foreground">Trang quản lý giáo viên</h1>
          </div>
          <p className="text-muted-foreground text-lg">Quản lý các bài quiz của bạn tại đây.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-lg lg:col-span-1">
                <CardHeader>
                    <CardTitle>Hành động</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button variant="default" className="h-24 flex-col gap-2" onClick={() => router.push('/create')}>
                    <PlusCircle className="h-8 w-8" />
                    <span className="font-semibold text-lg">Tạo Quiz mới</span>
                    </Button>
                </CardContent>
                <CardFooter>
                    <Button variant="ghost" className="w-full mt-4" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                    </Button>
                </CardFooter>
            </Card>

            <Card className="shadow-lg lg:col-span-2">
                <CardHeader>
                    <CardTitle>Danh sách Quiz đã tạo</CardTitle>
                    <CardDescription>Xem và quản lý các quiz bạn đã tạo.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : quizzes.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {quizzes.map(quiz => (
                                <div key={quiz.code} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="font-bold text-lg">Mã Quiz: <span className="text-primary">{quiz.code}</span></p>
                                        <p className="text-sm text-muted-foreground">{quiz.questionCount} câu hỏi</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={() => router.push(`/teacher/edit/${quiz.code}`)}>
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Sửa</span>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Xóa</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn quiz có mã <span className="font-bold">{quiz.code}</span>.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteQuiz(quiz.code)}>
                                                    Tiếp tục
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">Chưa có quiz nào được tạo.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
