const mongoose = require("mongoose");

const ProblemSchema = new mongoose.Schema({
  title: String,
  problemStatement: String,
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  category: { type: String, required: true },
  examples: [
    {
      id: Number,
      inputText: String,
      outputText: String,
      explanation: String,
    },
  ],
  constraints: [String], // Changed to array of strings
  order: Number,
  starterCode: String,
  handlerFunction: String,
  starterFunctionName: String,
  testCases: [
    {
      input: String,
      expectedOutput: String,
    },
  ],
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who liked
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who disliked
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Problem", ProblemSchema);