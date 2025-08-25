export interface Player {
  id: string;
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

export const mockQuizQuestions: Question[] = [
  { text: "Thủ đô của Việt Nam là gì?", options: ["Hà Nội", "Đà Nẵng", "TP. Hồ Chí Minh", "Hải Phòng"], correctAnswer: "Hà Nội" },
  { text: "Hành tinh nào được mệnh danh là 'Hành tinh Đỏ'?", options: ["Trái Đất", "Sao Hỏa", "Sao Mộc", "Sao Kim"], correctAnswer: "Sao Hỏa" },
  { text: "Đại dương lớn nhất trên Trái Đất là gì?", options: ["Đại Tây Dương", "Ấn Độ Dương", "Bắc Băng Dương", "Thái Bình Dương"], correctAnswer: "Thái Bình Dương" },
  { text: "Ai là tác giả của 'Truyện Kiều'?", options: ["Nguyễn Du", "Hồ Xuân Hương", "Nguyễn Trãi", "Tô Hoài"], correctAnswer: "Nguyễn Du" },
  { text: "Ký hiệu hóa học của nước là gì?", options: ["O2", "H2O", "CO2", "NaCl"], correctAnswer: "H2O" },
  { text: "Có bao nhiêu châu lục trên thế giới?", options: ["5", "6", "7", "8"], correctAnswer: "7" },
  { text: "Ai đã vẽ bức tranh 'Mona Lisa'?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], correctAnswer: "Leonardo da Vinci" },
  { text: "Chất tự nhiên cứng nhất trên Trái Đất là gì?", options: ["Vàng", "Sắt", "Kim cương", "Thạch anh"], correctAnswer: "Kim cương" },
  { text: "Tàu Titanic bị chìm vào năm nào?", options: ["1912", "1905", "1898", "1923"], correctAnswer: "1912" },
  { text: "Đơn vị tiền tệ của Nhật Bản là gì?", options: ["Nhân dân tệ", "Won", "Yên", "Baht"], correctAnswer: "Yên" },
];

export const mockPlayers: Player[] = [
  { id: 'p2', name: 'Bot An', score: 0, avatar: `https://robohash.org/an.png?size=40x40&set=set4` },
  { id: 'p3', name: 'Bot Bình', score: 0, avatar: `https://robohash.org/binh.png?size=40x40&set=set4` },
  { id: 'p4', name: 'Bot Châu', score: 0, avatar: `https://robohash.org/chau.png?size=40x40&set=set4` },
  { id: 'p5', name: 'Bot Dũng', score: 0, avatar: `https://robohash.org/dung.png?size=40x40&set=set4` },
];
