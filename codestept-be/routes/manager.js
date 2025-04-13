// server/routes/manager.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Problem = require("../models/Problem");
const managerMiddleware = require("../middleware/manager");

// Get all users
router.get("/users", managerMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("username email xp createdAt role");
    res.json({ users });
  } catch (error) {
    console.error("❌ Eroare la obținerea utilizatorilor:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// Create a user
router.post("/users", managerMiddleware, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Rol invalid. Managerii nu pot seta alți manageri." });
    }
    const user = new User({ username, email, password, role });
    await user.save();
    res.status(201).json({ message: "Utilizator creat cu succes.", user });
  } catch (error) {
    console.error("❌ Eroare la crearea utilizatorului:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// Update a user
router.put("/users/:userId", managerMiddleware, async (req, res) => {
  try {
    const { username, email, role } = req.body;
    if (role === "manager") {
      return res.status(400).json({ error: "Managerii nu pot seta alți manageri." });
    }
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
    }
    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;
    await user.save();
    res.json({ message: "Utilizator actualizat cu succes.", user });
  } catch (error) {
    console.error("❌ Eroare la actualizarea utilizatorului:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// Delete a user
router.delete("/users/:userId", managerMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
    }
    if (user.role === "manager") {
      return res.status(403).json({ error: "Nu se poate șterge un manager." });
    }
    await user.deleteOne();
    res.json({ message: "Utilizator șters cu succes." });
  } catch (error) {
    console.error("❌ Eroare la ștergerea utilizatorului:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});


// Get all problems
router.get("/problems", managerMiddleware, async (req, res) => {
  try {
    const problems = await Problem.find()
      .populate("author", "username");
    res.json({ problems });
  } catch (error) {
    console.error("❌ Eroare la obținerea problemelor:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// Create a problem
router.post("/problems", managerMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      category,
      examples,
      constraints,
      starterCode,
      handlerFunction,
      starterFunctionName,
      testCases,
    } = req.body;
    const problem = new Problem({
      title,
      description,
      difficulty,
      category,
      examples,
      constraints,
      starterCode,
      handlerFunction,
      starterFunctionName,
      testCases,
      author: req.user._id,
    });
    await problem.save();
    res.status(201).json({ message: "Problemă creată cu succes.", problem });
  } catch (error) {
    console.error("❌ Eroare la crearea problemei:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// Update a problem
router.put("/problems/:problemId", managerMiddleware, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problema nu a fost găsită." });
    }
    const {
      title,
      description,
      difficulty,
      category,
      examples,
      constraints,
      starterCode,
      handlerFunction,
      starterFunctionName,
      testCases,
    } = req.body;
    Object.assign(problem, {
      title,
      description,
      difficulty,
      category,
      examples,
      constraints,
      starterCode,
      handlerFunction,
      starterFunctionName,
      testCases,
    });
    await problem.save();
    res.json({ message: "Problemă actualizată cu succes.", problem });
  } catch (error) {
    console.error("❌ Eroare la actualizarea problemei:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// Delete a problem
router.delete("/problems/:problemId", managerMiddleware, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problema nu a fost găsită." });
    }
    await problem.deleteOne();
    res.json({ message: "Problemă ștearsă cu succes." });
  } catch (error) {
    console.error("❌ Eroare la ștergerea problemei:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// Assign homework
router.post("/homework/assign/:userId", managerMiddleware, async (req, res) => {
  try {
    const { problemIds } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
    }
    const problems = await Problem.find({ _id: { $in: problemIds } });
    if (problems.length !== problemIds.length) {
      return res.status(400).json({ error: "Unele probleme nu au fost găsite." });
    }
    user.homework.push(
      ...problemIds.map((problemId) => ({
        problemId,
        assignedAt: new Date(),
      }))
    );
    await user.save();
    res.json({ message: "Temă atribuită cu succes." });
  } catch (error) {
    console.error("❌ Eroare la atribuirea temei:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// View homework
router.get("/homework/:userId", managerMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("username homework")
      .populate("homework.problemId", "title _id");
    if (!user) {
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
    }
    const homework = user.homework.map((hw) => ({
      problemId: hw.problemId._id,
      title: hw.problemId.title,
      assignedAt: hw.assignedAt,
    }));
    res.json({ username: user.username, homework });
  } catch (error) {
    console.error("❌ Eroare la obținerea temelor:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

module.exports = router;