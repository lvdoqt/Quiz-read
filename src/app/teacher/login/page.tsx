"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit, LogIn, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from '@/lib/firebase';

// In a real app, you'd have a registration page.
// For now, we'll use a dummy account.
const DUMMY_EMAIL = "teacher@example.com";
const DUMMY_PASSWORD = "password123";

export default function TeacherLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start loading to check auth state
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to dashboard.
        router.replace('/teacher/dashboard');
      } else {
        // No user is signed in.
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        toast({
          title: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay trở lại.",
        });
        router.push('/teacher/dashboard');
      })
      .catch((error) => {
        const errorCode = error.code;
        console.error("Login error:", errorCode, error.message);
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại!",
          description: "Email hoặc mật khẩu không chính xác.",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  if (isLoading) {
     return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-2">
            <BrainCircuit className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold font-headline text-foreground">Đăng nhập Giáo viên</h1>
        </div>
        <p className="text-muted-foreground text-lg">Sử dụng tài khoản của bạn để quản lý các bài quiz.</p>
      </div>

      <Card className="w-full max-w-sm shadow-lg">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>
              Sử dụng email: <span className="font-bold">{DUMMY_EMAIL}</span> và mật khẩu: <span className="font-bold">{DUMMY_PASSWORD}</span> để đăng nhập.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="teacher@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : <> <LogIn className='mr-2' /> Đăng nhập </>}
            </Button>
            <Button variant="link" onClick={() => router.push('/')} className="text-foreground/80">
                Quay về trang chủ
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
