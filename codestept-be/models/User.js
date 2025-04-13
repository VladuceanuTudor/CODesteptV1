// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  xp: { type: Number, default: 0 },
  starredProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
  profilePic: { type: String, default: "" },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  role: {
    type: String,
    enum: ["user", "admin", "manager"],
    default: "user",
  },
  homework: [
    {
      problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
      assignedAt: { type: Date, default: Date.now },
    },
  ],
});

// Hash password before saving
// userSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

module.exports = mongoose.model('User', userSchema);