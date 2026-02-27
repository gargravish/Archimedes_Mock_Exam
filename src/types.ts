export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
}

export interface MockTest {
  id: number;
  day_number: number;
  title: string;
  questions: Question[];
}

export interface TestResult {
  id: number;
  user_id: number;
  test_id: number;
  score: number;
  total_questions: number;
  answers_json: string;
  completed_at: string;
  day_number: number;
  title: string;
}

export interface User {
  id: number;
  name: string;
  created_at: string;
}

export interface TopicMastery {
  topic: string;
  mastery: number; // 0 to 100
}
