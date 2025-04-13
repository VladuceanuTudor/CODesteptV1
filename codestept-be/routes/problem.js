const express = require("express");
const Problem = require("../models/Problem");
const { executeInDocker } = require("../utils/dockerExecutor");
const auth = require("../middleware/auth"); // Authentication middleware
const admin = require("../middleware/admin"); // Admin middleware
const { executeInDockerTest } = require("../utils/dockerExecutorTest");
const User = require("../models/User"); // User model

const router = express.Router();

// 🔹 Fetch paginated problems
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const problems = await Problem.find({}, "title difficulty category videoId likes dislikes author")
      .populate("author", "username profilePic") // Populate author with username and profilePic
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit);

    const totalProblems = await Problem.countDocuments();

    res.json({
      problems,
      hasMore: skip + limit < totalProblems,
    });
  } catch (error) {
    console.error("❌ Error fetching problems:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Add a new problem (Requires authentication)
router.post("/", auth, admin, async (req, res) => {
  try {
    const newProblem = new Problem({
      ...req.body, // Spread the incoming form data
      author: req.user._id, // Add the authenticated user's ID as the author
    });
    await newProblem.save();
    res.status(201).json({ message: "Problem added successfully!", problem: newProblem });
  } catch (error) {
    console.error("❌ Error adding problem:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Submit C++ source code & execute in Docker
// router.post("/:id/submit", async (req, res) => {
//   try {
//     const { sourceCode } = req.body;
//     if (!sourceCode) return res.status(400).json({ error: "Source code is required" });

//     const problem = await Problem.findById(req.params.id);
//     if (!problem) return res.status(404).json({ error: "Problem not found" });

//     if (!problem.testCases || problem.testCases.length === 0) {
//       return res.status(400).json({ error: "No test cases available for this problem" });
//     }

//     console.log(`📝 Problem: ${problem.title}`);
//     console.log(`📝 Test Cases: ${JSON.stringify(problem.testCases)}`);

//     const { results } = await executeInDocker(sourceCode, problem.testCases);
//     res.json({ results });
//   } catch (err) {
//     console.error("❌ Route error:", err);
//     res.status(500).json({ error: err.error || "Execution failed", details: err.details || "Unknown error" });
//   }
// });

router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const problems = await Problem.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: {
          path: "$author",
          preserveNullAndEmptyArrays: true, // Keep problems even if author is missing
        },
      },
      {
        $match: {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } },
            { "author.username": { $regex: query, $options: "i" } },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          difficulty: 1,
          category: 1,
          videoId: 1,
          likes: 1,
          dislikes: 1,
          "author.username": 1,
          "author.profilePic": 1,
        },
      },
      { $limit: 10 },
    ]);

    res.json({ problems });
  } catch (error) {
    console.error("❌ Error searching problems:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/myProblems', auth, admin,  async (req, res) => {
  const userId = req.user._id; // The user ID should be decoded from the token
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    // Check if the user is an admin
    if (!req.user.role === "admin") {
      return res.status(403).json({ error: "You don't have permission to access this resource" });
    }

    // Find problems created by the admin user
    const problems = await Problem.find({ author: userId })
      .skip(skip)
      .limit(Number(limit));

    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching problems' });
  }
});

// 🔹 Fetch problem for editing
router.get("/edit/:id", auth, admin, async (req, res) => {
  try {
    console.log("Fetching problem with ID:", req.params.id);
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      console.log("Problem not found:", req.params.id);
      return res.status(404).json({ error: "Problem not found" });
    }

    const user = req.user;
    console.log("User attempting to edit:", user);

    problem.testCases = problem.testCases || [];
    console.log("Problem data:", problem);

    if (user._id.toString() === problem.author.toString() || user.role === "admin") {
      console.log("User authorized to edit problem:", user._id);
      res.json(problem); // Return problem directly
    } else {
      console.log("User not authorized to edit problem:", user._id);
      return res.status(403).json({ error: "You don't have permission to access this resource" });
    }
  } catch (error) {
    console.error("❌ Error fetching editable content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Update problem
router.put("/edit/:id", auth, admin, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const user = req.user;
    if (user._id.toString() !== problem.author.toString() && !user.role === "admin") {
      return res.status(403).json({ error: "You don't have permission to update this problem" });
    }

    const {
      title, problemStatement, description, difficulty, category,
      examples, constraints, starterCode, handlerFunction, starterFunctionName, testCases
    } = req.body;

    problem.title = title || problem.title;
    problem.problemStatement = problemStatement || problem.problemStatement;
    problem.description = description || problem.description;
    problem.difficulty = difficulty || problem.difficulty;
    problem.category = category || problem.category;
    problem.examples = examples || problem.examples;
    problem.constraints = constraints || problem.constraints;
    problem.starterCode = starterCode || problem.starterCode;
    problem.handlerFunction = handlerFunction || problem.handlerFunction;
    problem.starterFunctionName = starterFunctionName || problem.starterFunctionName;
    problem.testCases = testCases || problem.testCases;

    await problem.save();

    res.json({ message: "Problem updated successfully!", problem });
  } catch (error) {
    console.error("❌ Error updating problem:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/submit", auth, async (req, res) => {
  try {
    const { sourceCode } = req.body;
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    if (!problem.testCases || problem.testCases.length === 0) {
      return res.status(400).json({ error: "No test cases available for this problem" });
    }

    console.log(`📝 Problem: ${problem.title}`);
    console.log(`📝 Test Cases: ${JSON.stringify(problem.testCases)}`);

    const { results } = await executeInDocker(sourceCode, problem.testCases);

    // Check if all test cases passed
    const allTestsPassed = results.every((result) => result.status === "passed");

    if (allTestsPassed) {
      // Check if req.user is defined before proceeding
      if (!req.user || !req.user._id) {
        console.log("No authenticated user found in req.user:", req.user);
        // Still return results, but skip updating solvedProblems
      } else {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: "User not found" });
    
        const problemIdStr = problem._id.toString();
        const alreadySolved = user.solvedProblems.includes(problemIdStr);
    
        // If not already solved, add it to solvedProblems and award XP
        if (!alreadySolved) {
          user.solvedProblems.push(problemIdStr);
    
          // Award XP based on problem difficulty
          let xpGained = 0;
          switch (problem.difficulty?.toLowerCase()) {
            case "easy":
              xpGained = 50;
              break;
            case "medium":
              xpGained = 100;
              break;
            case "hard":
              xpGained = 200;
              break;
            default:
              xpGained = 0;
          }
    
          // Initialize xp if not already present
          user.xp = user.xp || 0;
          user.xp += xpGained;
    
          await user.save();
          console.log(`✅ Problem ${problem._id} added to ${user.username}'s solvedProblems`);
          console.log(`✨ ${xpGained} XP awarded to ${user.username} (Total: ${user.xp})`);
        }
      }
    
    }

    res.json({ results });
  } catch (err) {
    console.error("❌ Route error:", err);
    res.status(500).json({ error: err.error || "Execution failed", details: err.details || "Unknown error" });
  }
});

router.get("/test", async (req, res) => {
  try {
    const { results } = await executeInDockerTest();
    res.json({ results });
  } catch (err) {
    console.error("❌ Route error:", err);
    res.status(500).json({ error: err.error || "Execution failed", details: err.details || "Unknown error" });
  }
});

// 🔹 Fetch problem by ID
router.get("/:id", async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    res.json(problem);
  } catch (err) {
    console.error("❌ Error fetching problem:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Like a problem
router.put("/:id/like", auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const userId = req.user._id;

    // Check if user already disliked it
    if (problem.dislikedBy.includes(userId)) {
      problem.dislikes -= 1;
      problem.dislikedBy = problem.dislikedBy.filter((id) => id.toString() !== userId.toString());
    }

    // Toggle like
    if (problem.likedBy.includes(userId)) {
      problem.likes -= 1;
      problem.likedBy = problem.likedBy.filter((id) => id.toString() !== userId.toString());
    } else {
      problem.likes += 1;
      problem.likedBy.push(userId);
    }

    await problem.save();
    res.json({ likes: problem.likes, dislikes: problem.dislikes, likedBy: problem.likedBy, dislikedBy: problem.dislikedBy });
  } catch (err) {
    console.error("❌ Error liking problem:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Dislike a problem
router.put("/:id/dislike", auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const userId = req.user._id;

    // Check if user already liked it
    if (problem.likedBy.includes(userId)) {
      problem.likes -= 1;
      problem.likedBy = problem.likedBy.filter((id) => id.toString() !== userId.toString());
    }

    // Toggle dislike
    if (problem.dislikedBy.includes(userId)) {
      problem.dislikes -= 1;
      problem.dislikedBy = problem.dislikedBy.filter((id) => id.toString() !== userId.toString());
    } else {
      problem.dislikes += 1;
      problem.dislikedBy.push(userId);
    }

    await problem.save();
    res.json({ likes: problem.likes, dislikes: problem.dislikes, likedBy: problem.likedBy, dislikedBy: problem.dislikedBy });
  } catch (err) {
    console.error("❌ Error disliking problem:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});





module.exports = router;
