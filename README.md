# Quiz System — Backend API

A Node.js REST API backend for an interactive quiz application designed for children. Supports full quiz flow including question navigation, answer submission, progress tracking, and final results.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** MongoDB (Mongoose)
- **Dev Tool:** Nodemon

---

## Project Structure

```
/src
  /controllers        → Request/response handling (thin layer)
  /services           → Business logic
  /models             → Mongoose schemas
  /routes             → API route definitions
  /middleware         → Input validation
  /utils              → Helper functions
  seed.js             → Seed script for test data

server.js             → Entry point
.env                  → Environment variables
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mihindugunarathne/Quiz-System-Backend.git
cd Quiz-System-Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 4. Seed the database

```bash
npm run seed
```

This inserts a sample quiz with 5 questions. The terminal will print the **Quiz ID** — copy it for testing.

### 5. Start the server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

---

## API Endpoints

Base URL: `http://localhost:5000/api/quiz`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a new quiz |
| POST | `/:quizId/questions` | Add a question to a quiz |
| POST | `/:quizId/start` | Start a quiz attempt |
| GET | `/:quizId/question/:index` | Get a question by index |
| POST | `/answer` | Submit an answer |
| GET | `/progress/:attemptId` | Get current progress |
| GET | `/result/:attemptId` | Get final result |

---

## Testing Workflow (Postman)

Follow these steps in order to test the full quiz flow.

---

### Step 1 — Create a Quiz

**POST** `/api/quiz`

```json
{
  "title": "Space Quiz",
  "description": "Test your space knowledge!"
}
```

**Response:**
```json
{
  "quizId": "...",
  "title": "Space Quiz"
}
```

> Save the `quizId`.

---

### Step 2 — Add Questions

**POST** `/api/quiz/:quizId/questions`

```json
{
  "questionText": "What is the closest planet to the Sun?",
  "options": [
    { "text": "Venus", "isCorrect": false },
    { "text": "Mercury", "isCorrect": true },
    { "text": "Mars", "isCorrect": false },
    { "text": "Earth", "isCorrect": false }
  ]
}
```

> Repeat for each question. Exactly one option must have `"isCorrect": true`.

---

### Step 3 — Start the Quiz

**POST** `/api/quiz/:quizId/start`

No body required.

**Response:**
```json
{
  "attemptId": "...",
  "totalQuestions": 5,
  "question": {
    "_id": "...",
    "questionText": "...",
    "options": [...]
  }
}
```

> Save the `attemptId`. You'll need it for all remaining steps.

---

### Step 4 — Get a Question by Index

**GET** `/api/quiz/:quizId/question/0?attemptId=:attemptId`

Change the index (`0`, `1`, `2`...) to navigate between questions.

**Response:**
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

**POST** `/api/quiz/answer`

```json
{
  "attemptId": "...",
  "questionId": "...",
  "selectedOptionIndex": 1
}
```

**Response:**
```json
{
  "correct": true,
  "score": 1
}
```

> You can re-submit an answer for the same question — the score will update correctly.

---

### Step 6 — Check Progress

**GET** `/api/quiz/progress/:attemptId`

**Response:**
```json
{
  "total": 5,
  "answered": 3,
  "score": 2
}
```

---

### Step 7 — Get Final Result

**GET** `/api/quiz/result/:attemptId`

**Response:**
```json
{
  "totalQuestions": 5,
  "score": 4,
  "correct": 4,
  "wrong": 1,
  "percentage": 80
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
| Missing attemptId | `"attemptId is required"` |
| Missing questionId | `"questionId is required"` |
| Missing selectedOptionIndex | `"selectedOptionIndex is required"` |
| Invalid option index | `"selectedOptionIndex must be a non-negative number"` |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with nodemon (development) |
| `npm start` | Start server with node (production) |
| `npm run seed` | Seed the database with sample quiz data |
