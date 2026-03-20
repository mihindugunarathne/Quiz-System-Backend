require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Quiz = require("./models/Quiz");
const Question = require("./models/Question");

const seedData = {
  title: "General Knowledge for Kids",
  description: "A fun quiz to test your general knowledge!",
  questions: [
    {
      questionText: "What color is the sky on a clear day?",
      options: [
        { text: "Green", isCorrect: false },
        { text: "Blue", isCorrect: true },
        { text: "Red", isCorrect: false },
        { text: "Yellow", isCorrect: false }
      ]
    },
    {
      questionText: "How many legs does a spider have?",
      options: [
        { text: "6", isCorrect: false },
        { text: "4", isCorrect: false },
        { text: "8", isCorrect: true },
        { text: "10", isCorrect: false }
      ]
    },
    {
      questionText: "Which animal is known as the King of the Jungle?",
      options: [
        { text: "Tiger", isCorrect: false },
        { text: "Elephant", isCorrect: false },
        { text: "Cheetah", isCorrect: false },
        { text: "Lion", isCorrect: true }
      ]
    },
    {
      questionText: "What shape has 3 sides?",
      options: [
        { text: "Square", isCorrect: false },
        { text: "Triangle", isCorrect: true },
        { text: "Circle", isCorrect: false },
        { text: "Rectangle", isCorrect: false }
      ]
    },
    {
      questionText: "What do bees make?",
      options: [
        { text: "Milk", isCorrect: false },
        { text: "Butter", isCorrect: false },
        { text: "Honey", isCorrect: true },
        { text: "Jam", isCorrect: false }
      ]
    }
  ]
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    await Quiz.deleteMany({});
    await Question.deleteMany({});
    console.log("Cleared existing data");

    const quiz = await Quiz.create({
      title: seedData.title,
      description: seedData.description
    });

    const questions = seedData.questions.map(q => ({
      quizId: quiz._id,
      questionText: q.questionText,
      options: q.options
    }));

    await Question.insertMany(questions);

    console.log("----------------------------");
    console.log("Seed completed successfully!");
    console.log(`Quiz ID : ${quiz._id}`);
    console.log(`Questions added : ${questions.length}`);
    console.log("----------------------------");

  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
