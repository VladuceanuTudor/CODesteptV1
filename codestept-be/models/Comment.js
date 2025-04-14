const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  
    text: String,
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", CommentSchema);