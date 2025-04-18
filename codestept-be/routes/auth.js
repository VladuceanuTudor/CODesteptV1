const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();
const transporter = require("../config/emailConfig");


// Register a new user
router.post("/register", async (req, res) => {
	const { username, email, password } = req.body;

	try {
		const existingUser = await User.findOne({ $or: [{ email }, { username }] });
		if (existingUser) {
			return res.status(400).json({ error: "Există deja un utilizator cu acest email/nume." });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = new User({ username, email, password: hashedPassword });
		await user.save();

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

		res.status(201).json({ message: "User registered successfully", token });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Login user
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Email sau parolă incorectă" });

		console.log(password, user.password);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Email sau parolă incorectă" });

		if( user.isActive === false) return res.status(400).json({ error: "Contul tău a fost dezactivat. Te rugăm să contactezi un administrator." });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: "A apărut o eroare la autentificare." });
    }
});

// Request password reset (send email)
router.post("/forgot-password", async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ error: "Nu există niciun utilizator cu acest email." });

		// Generate a reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		const hashedToken = await bcrypt.hash(resetToken, 10);

		// Store the hashed token and expiration time in the user's document
		user.resetPasswordToken = hashedToken;
		user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
		await user.save();

		// Send email with reset link
		const resetUrl = `http://localhost:3000/auth/reset-password/${resetToken}`;
		const mailOptions = {
			to: user.email,
			from: process.env.EMAIL_USER,
			subject: "Resetează parola",
			text: `Salut, ${user.username}!\n\nAi cerut resetarea parolei.\nDă click pe linkul următor pentru a o reseta:\n\n${resetUrl}\n\nDacă nu ai cerut acest lucru, ignoră acest email.`,
		};

		await transporter.sendMail(mailOptions);
		res.json({ message: "Un email de resetare a fost trimis." });
	} catch (err) {
		res.status(500).json({ error: "A apărut o eroare la trimiterea emailului." });
	}
});

// Reset password
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Găsește utilizatorul care are acest token și nu este expirat
        const user = await User.findOne({
            resetPasswordToken: { $exists: true },
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user || !(await bcrypt.compare(token, user.resetPasswordToken))) {
            return res.status(400).json({ error: "Token invalid sau expirat." });
        }

        // Hash the new password
        user.password = await bcrypt.hash(newPassword, 10);

        // Șterge token-ul utilizat
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        
        res.json({ message: "Parola a fost resetată cu succes!" });
    } catch (err) {
        res.status(500).json({ error: "A apărut o eroare la resetarea parolei." });
    }
});

// Verify token
router.get("/verify", async (req, res) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		return res.status(401).json({ error: "Nu a fost furnizat niciun token." });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select("-password");

		if (!user) return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });

		res.status(200).json({ user });
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ error: "Token-ul a expirat. Te rugăm să te autentifici din nou." });
		}
		res.status(401).json({ error: "Token invalid." });
	}
});

// server/routes/auth.js
router.get("/is-admin", auth, async (req, res) => {
	try {
	  const user = await User.findById(req.user._id).select("role");
	  if (!user) {
		return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
	  }
	  res.json({ isAdmin: user.role === "admin" });
	} catch (error) {
	  console.error("❌ Eroare la verificarea statutului de admin:", error);
	  res.status(500).json({ error: "Eroare internă a serverului." });
	}
  });

  router.get("/is-manager", async (req, res) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
	  return res.status(401).json({ error: "Nu a fost furnizat niciun token." });
	}
	try {
	  const decoded = jwt.verify(token, process.env.JWT_SECRET);
	  const user = await User.findById(decoded.userId).select("role");
	  if (!user) {
		return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
	  }
	  res.json({ isManager: user.role === "manager" });
	} catch (error) {
	  console.error("❌ Eroare la verificarea rolului de manager:", error);
	  res.status(500).json({ error: "Eroare internă a serverului." });
	}
  });

module.exports = router;
