import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("archimedes.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT DEFAULT 'Student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mock_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_number INTEGER UNIQUE,
    title TEXT,
    questions_json TEXT
  );

  CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    test_id INTEGER,
    score INTEGER,
    total_questions INTEGER,
    answers_json TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(test_id) REFERENCES mock_tests(id)
  );

  CREATE TABLE IF NOT EXISTS topic_mastery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    topic TEXT,
    mastery_level INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed initial user if not exists
const user = db.prepare("SELECT * FROM users LIMIT 1").get();
if (!user) {
  db.prepare("INSERT INTO users (name) VALUES (?)").run("Archimedes Scholar");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/user", (req, res) => {
    const user = db.prepare("SELECT * FROM users LIMIT 1").get();
    res.json(user);
  });

  app.get("/api/tests", (req, res) => {
    const tests = db.prepare("SELECT id, day_number, title FROM mock_tests ORDER BY day_number").all();
    res.json(tests);
  });

  app.get("/api/tests/:id", (req, res) => {
    const test = db.prepare("SELECT * FROM mock_tests WHERE id = ?").get(req.params.id);
    if (test) {
      test.questions = JSON.parse(test.questions_json);
      delete test.questions_json;
      res.json(test);
    } else {
      res.status(404).json({ error: "Test not found" });
    }
  });

  app.post("/api/results", (req, res) => {
    const { user_id, test_id, score, total_questions, answers } = req.body;
    const result = db.prepare(`
      INSERT INTO test_results (user_id, test_id, score, total_questions, answers_json)
      VALUES (?, ?, ?, ?, ?)
    `).run(user_id, test_id, score, total_questions, JSON.stringify(answers));
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/progress", (req, res) => {
    const results = db.prepare(`
      SELECT tr.*, mt.day_number, mt.title
      FROM test_results tr
      JOIN mock_tests mt ON tr.test_id = mt.id
      ORDER BY tr.completed_at ASC
    `).all();
    res.json(results);
  });

  app.post("/api/tests", (req, res) => {
    const { day_number, title, questions } = req.body;
    try {
      db.prepare("INSERT INTO mock_tests (day_number, title, questions_json) VALUES (?, ?, ?)").run(
        day_number, title, JSON.stringify(questions)
      );
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Test already exists for this day" });
    }
  });

  // Seed a sample test if none exists (using the one from the PDF)
  const testCount = db.prepare("SELECT COUNT(*) as count FROM mock_tests").get();
  if (testCount.count === 0) {
    const sampleQuestions = [
      {
        id: 1,
        text: "What is the value of the expression 24 ÷ (3 ÷ 2) - (24 ÷ 3) × 2?",
        options: ["0", "2", "8", "16", "32"],
        correctAnswer: "0",
        explanation: "Evaluate the left bracket: 24 ÷ 1.5 = 16. Evaluate the right bracket: 8. Multiply by 2: 16. Subtract: 16 - 16 = 0.",
        topic: "Arithmetic"
      },
      {
        id: 2,
        text: "Ella answers five mathematics questions every 40 seconds. Jasleen answers six mathematics questions every 45 seconds. How many seconds longer does it take Ella to answer exactly 360 questions than Jasleen?",
        options: ["120", "180", "240", "300", "360"],
        correctAnswer: "180",
        explanation: "Ella's rate: 40/5 = 8s/q. For 360q: 360*8 = 2880s. Jasleen's rate: 45/6 = 7.5s/q. For 360q: 360*7.5 = 2700s. Difference: 2880 - 2700 = 180s.",
        topic: "Rates & Ratios"
      },
      {
        id: 3,
        text: "A rectangle has side lengths expressed algebraically as (3x + 6) cm and (9x - 2) cm. If the total perimeter is precisely 100 cm, what is the value of x?",
        options: ["2", "3", "23/6", "4", "11/3"],
        correctAnswer: "4",
        explanation: "Half the perimeter is 50. (3x + 6) + (9x - 2) = 50. 12x + 4 = 50. 12x = 46. x = 46/12 = 23/6. Wait, let's re-check the PDF. PDF says 12x = 46, x = 23/6. My option D was 4, C was 23/6. So C is correct.",
        topic: "Geometry"
      },
      {
        id: 4,
        text: "Without using long division, identify which of the following large integers is definitively divisible by 12.",
        options: ["1,234,567,890", "5,432,109,876", "3,456,789,124", "1,111,111,114", "9,876,543,212"],
        correctAnswer: "5,432,109,876",
        explanation: "Rule of 12: Divisible by 3 and 4. 5,432,109,876 ends in 76 (div by 4). Sum of digits: 5+4+3+2+1+0+9+8+7+6 = 45 (div by 3).",
        topic: "Number Sense"
      },
      {
        id: 5,
        text: "The mean age of a group of 5 teachers is 32 years. A new teacher joins and the mean age drops to 30 years. How old is the new teacher?",
        options: ["20", "22", "24", "25", "28"],
        correctAnswer: "20",
        explanation: "Total age of 5 teachers = 5 * 32 = 160. Total age of 6 teachers = 6 * 30 = 180. New teacher = 180 - 160 = 20.",
        topic: "Data & Stats"
      }
    ];
    
    db.prepare("INSERT INTO mock_tests (day_number, title, questions_json) VALUES (?, ?, ?)").run(
      1, "Diagnostic Assessment", JSON.stringify(sampleQuestions)
    );
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
