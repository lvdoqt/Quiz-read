"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit, LogIn } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const DUMMY_PASSWORD = "password123";

export default function TeacherLoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem('teacherLoggedIn') === 'true') {
      router.replace('/teacher/dashboard');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      if (password === DUMMY_PASSWORD) {
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại.",
        });
        localStorage.setItem('teacherLoggedIn', 'true');
        router.push('/teacher/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại!",
          description: "Mật khẩu không chính xác. Vui lòng thử lại.",
        });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--accent))] p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <BrainCircuit className="h-12 w-12 text-foreground" />
            <h1 className="text-5xl font-bold font-headline text-foreground">Đăng nhập Giáo viên</h1>
        </div>
        <p className="text-foreground/80 text-lg">Chào mừng đến với khu vực quản lý.</p>
      </div>

      <Card className="w-full max-w-sm shadow-lg bg-card/50 backdrop-blur-sm border-border/30">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle>Nhập mật khẩu</CardTitle>
            <CardDescription>Sử dụng mật khẩu được cấp để truy cập.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="text-base bg-transparent placeholder:text-foreground/60"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : <> <LogIn className='mr-2' /> Đăng nhập </>}
            </Button>
            <Button variant="link" onClick={() => router.push('/')} className="text-foreground">
                Quay về trang chủ
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
