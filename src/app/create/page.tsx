"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, Wand2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

type Question = {
  text: string;
  options: string[];
  correctAnswer: string;
};

const initialQuestions: Question[] = Array(10).fill({}).map(() => ({
  text: '',
  options: ['', '', '', ''],
  correctAnswer: '',
}));

export default function CreateQuizPage() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const router = useRouter();
  const { toast } = useToast();

  const handleQuestionChange = (index: number, field: 'text' | 'correctAnswer', value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[oIndex] = value;
    newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
    setQuestions(newQuestions);
  };

  const handleCreateQuiz = () => {
    const quizCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log("Quiz Data:", questions);
    toast({
      title: "Quiz Created!",
      description: `Your quiz code is: ${quizCode}. Share it with your students!`,
      duration: 10000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--accent))]">
        <header className="p-4 border-b border-border/30">
            <Button variant="outline" onClick={() => router.push('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Button>
        </header>
        <main className="container mx-auto py-8 px-4">
            <Card className="max-w-4xl mx-auto shadow-lg bg-card/50 backdrop-blur-sm border-border/30">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Create a New Quiz</CardTitle>
                    <CardDescription>Fill in the 10 questions for your quiz arena.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                        {questions.map((q, qIndex) => (
                            <AccordionItem value={`item-${qIndex + 1}`} key={qIndex}>
                                <AccordionTrigger>Question {qIndex + 1}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 p-2">
                                        <div className="space-y-2">
                                            <Label htmlFor={`q-text-${qIndex}`}>Question Text</Label>
                                            <Input id={`q-text-${qIndex}`} value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} placeholder="What is 2 + 2?" className="bg-transparent placeholder:text-foreground/60" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Answer Options & Correct Answer</Label>
                                            <RadioGroup onValueChange={value => handleQuestionChange(qIndex, 'correctAnswer', value)} value={q.correctAnswer}>
                                                {q.options.map((opt, oIndex) => (
                                                    <div key={oIndex} className="flex items-center space-x-2">
                                                        <Input value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} className="bg-transparent placeholder:text-foreground/60"/>
                                                        <RadioGroupItem value={opt} id={`q-${qIndex}-opt-${oIndex}`} />
                                                        <Label htmlFor={`q-${qIndex}-opt-${oIndex}`}>Correct</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <Button onClick={handleCreateQuiz} className="w-full mt-6" size="lg">
                        <Wand2 className="mr-2 h-5 w-5" />
                        Generate Quiz
                    </Button>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
