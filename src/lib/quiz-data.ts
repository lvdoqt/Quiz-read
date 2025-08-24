export interface Player {
  id: string;
  name: string;
  score: number;
  avatar: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

export const mockQuizQuestions: Question[] = [
  { id: 1, text: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correctAnswer: "Paris" },
  { id: 2, text: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], correctAnswer: "Mars" },
  { id: 3, text: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correctAnswer: "Pacific" },
  { id: 4, text: "Who wrote 'To Kill a Mockingbird'?", options: ["Harper Lee", "Mark Twain", "F. Scott Fitzgerald", "Ernest Hemingway"], correctAnswer: "Harper Lee" },
  { id: 5, text: "What is the chemical symbol for water?", options: ["O2", "H2O", "CO2", "NaCl"], correctAnswer: "H2O" },
  { id: 6, text: "How many continents are there?", options: ["5", "6", "7", "8"], correctAnswer: "7" },
  { id: 7, text: "Who painted the Mona Lisa?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], correctAnswer: "Leonardo da Vinci" },
  { id: 8, text: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Quartz"], correctAnswer: "Diamond" },
  { id: 9, text: "In which year did the Titanic sink?", options: ["1912", "1905", "1898", "1923"], correctAnswer: "1912" },
  { id: 10, text: "What is the currency of Japan?", options: ["Yuan", "Won", "Yen", "Baht"], correctAnswer: "Yen" },
];

export const mockPlayers: Player[] = [
  { id: 'p2', name: 'Bot Alice', score: 0, avatar: `https://robohash.org/alice.png?size=40x40&set=set4` },
  { id: 'p3', name: 'Bot Bob', score: 0, avatar: `https://robohash.org/bob.png?size=40x40&set=set4` },
  { id: 'p4', name: 'Bot Charlie', score: 0, avatar: `https://robohash.org/charlie.png?size=40x40&set=set4` },
  { id: 'p5', name: 'Bot Diana', score: 0, avatar: `https://robohash.org/diana.png?size=40x40&set=set4` },
];
