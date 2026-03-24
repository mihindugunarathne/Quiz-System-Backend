# QuizJoy — Interactive Quiz System

A full-stack interactive quiz application for children. Built with a Node.js/Express REST API backend and a React + Tailwind CSS frontend.

---

## Features

- One question at a time with free Previous / Next navigation
- Per-attempt answer tracking (re-submit anytime before finishing)
- **Countdown timer** — 1 minute per question, auto-submits when time runs out
- Live progress panel with answered / unanswered question map
- Instant per-question feedback on the results screen
- Score, correct/incorrect count, and percentage on final result
- Mobile-friendly, ocean-blue UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Backend framework | Express.js v5 |
| Database | MongoDB (Mongoose ODM) |
| Frontend framework | React 18 (Vite) |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |

---

## Project Structure

```
Quiz System/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Thin request/response layer
│   │   ├── services/           # Business logic
│   │   ├── models/             # Mongoose schemas (Quiz, Question, Attempt)
│   │   ├── routes/             # API route definitions
│   │   ├── middleware/         # Input validation middleware
│   │   ├── utils/              # Helper functions
│   │   └── seed.js             # Seed script for test data
│   ├── server.js               # Entry point
│   ├── .env                    # Environment variables
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg         # Custom QuizJoy favicon
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx    # Landing page with quiz start
│   │   │   ├── QuizPage.jsx    # Quiz flow with timer & navigation
│   │   │   └── ResultPage.jsx  # Score + per-question review
│   │   ├── services/
│   │   │   └── api.js          # All backend API calls
│   │   ├── App.jsx             # Router setup
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Tailwind CSS import
│   ├── index.html
│   ├── .env                    # Frontend environment variables
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Backend

**1. Install dependencies**

```bash
cd backend
npm install
```

**2. Configure environment variables**

Create `backend/.env`:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

**3. Seed the database**

```bash
npm run seed
```

This inserts a sample quiz with 5 questions and prints the **Quiz ID** — copy it for use in the frontend `.env`.

**4. Start the server**

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Backend runs at `http://localhost:5000`

---

### Frontend

**1. Install dependencies**

```bash
cd frontend
npm install
```

**2. Configure environment variables**

Create `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:5000
VITE_QUIZ_ID=your_quiz_id_from_seed
```

**3. Start the dev server**

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Endpoints

Base URL: `http://localhost:5000/api/quiz`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a new quiz |
| POST | `/:quizId/questions` | Add a question to a quiz |
| POST | `/:quizId/start` | Start a quiz attempt (returns first question) |
| GET | `/:quizId/question/:index` | Get question by index |
| POST | `/answer` | Submit an answer |
| GET | `/progress/:attemptId` | Get current progress |
| GET | `/result/:attemptId` | Get final result |

---

## Testing Workflow (Postman)

Follow these steps in order to test the full quiz flow.

---

### Step 1 — Create a Quiz

**POST** `http://localhost:5000/api/quiz`

```json
{
  "title": "Space Quiz",
  "description": "Test your space knowledge!"
}
```

Response:
```json
{
  "quizId": "<quizId>",
  "title": "Space Quiz"
}
```

> Save the `quizId`.

---

### Step 2 — Add Questions

**POST** `http://localhost:5000/api/quiz/:quizId/questions`

```json
{
  "questionText": "What is the closest planet to the Sun?",
  "options": [
    { "text": "Venus",   "isCorrect": false },
    { "text": "Mercury", "isCorrect": true  },
    { "text": "Mars",    "isCorrect": false },
    { "text": "Earth",   "isCorrect": false }
  ]
}
```

> Repeat for each question. Exactly **one** option must have `"isCorrect": true`.

---

### Step 3 — Start the Quiz

**POST** `http://localhost:5000/api/quiz/:quizId/start`

No body required.

Response:
```json
{
  "attemptId": "<attemptId>",
  "totalQuestions": 3,
  "question": {
    "_id": "<questionId>",
    "questionText": "...",
    "options": [{ "text": "..." }, ...]
  }
}
```

> Save the `attemptId` — required for all remaining steps.

---

### Step 4 — Get a Question by Index

**GET** `http://localhost:5000/api/quiz/:quizId/question/0?attemptId=:attemptId`

Change the index (`0`, `1`, `2`…) to navigate between questions.

Response:
```json
{
  "question": {
    "_id": "...",
    "questionText": "...",
    "options": [{ "text": "..." }, ...]
  },
  "selectedOption": null
}
```

> `selectedOption` returns the previously selected index if the question was already answered.

---

### Step 5 — Submit an Answer

**POST** `http://localhost:5000/api/quiz/answer`

```json
{
  "attemptId": "<attemptId>",
  "questionId": "<questionId>",
  "selectedOptionIndex": 1
}
```

Response:
```json
{
  "correct": true,
  "score": 1,
  "correctOptionIndex": 1
}
```

> You can re-submit an answer for the same question — the score updates correctly.

---

### Step 6 — Check Progress

**GET** `http://localhost:5000/api/quiz/progress/:attemptId`

Response:
```json
{
  "total": 3,
  "answered": 2,
  "score": 1
}
```

---

### Step 7 — Get Final Result

**GET** `http://localhost:5000/api/quiz/result/:attemptId`

Response:
```json
{
  "totalQuestions": 3,
  "score": 2,
  "correct": 2,
  "wrong": 1,
  "percentage": 67
}
```

> Calling this endpoint marks the attempt as `completed: true` in the database.

---

## Input Validation

The API returns `400` errors with clear messages for invalid input:

| Scenario | Error Message |
|----------|--------------|
| Missing quiz title | `"title is required"` |
| Missing question text | `"questionText is required"` |
| Less than 2 options | `"options must be an array with at least 2 items"` |
| Option missing text | `"each option must have a text field"` |
| Not exactly one correct answer | `"exactly one option must have isCorrect: true"` |
| Missing `attemptId` | `"attemptId is required"` |
| Missing `questionId` | `"questionId is required"` |
| Missing `selectedOptionIndex` | `"selectedOptionIndex is required"` |
| Invalid option index | `"selectedOptionIndex must be a non-negative number"` |

---

## Backend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with nodemon (development) |
| `npm start` | Start server with node (production) |
| `npm run seed` | Seed the database with a sample quiz |

## Frontend Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
