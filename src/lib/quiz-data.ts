export interface Player {
  id: string; // Firebase document ID or a unique identifier for the player
  name: string;
  score: number;
  avatar: string;
}

export interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
  image?: string; // Optional image URL
}

export interface QuizData {
  questions: Question[];
  totalQuestions: number;
  durationMinutes: number;
}
