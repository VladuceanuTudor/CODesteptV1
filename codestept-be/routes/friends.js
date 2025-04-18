const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Send a friend request
router.post("/request/:receiverId", auth, async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.receiverId;

    // Validate receiverId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: "ID utilizator invalid." });
    }

    // Prevent self-request
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ error: "Nu poți trimite o cerere de prietenie către tine." });
    }

    // Find sender and receiver
    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select("friends friendRequests isActive"),
      User.findById(receiverId).select("friends friendRequests isActive"),
    ]);

    if (!receiver) {
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
    }

    if (!sender.isActive || !receiver.isActive) {
      return res.status(403).json({ error: "Unul dintre utilizatori nu este activ." });
    }

    // Check if already friends
    if (sender.friends.includes(receiverId) || receiver.friends.includes(senderId)) {
      return res.status(400).json({ error: "Utilizatorii sunt deja prieteni." });
    }

    // Check if request already sent
    if (receiver.friendRequests.includes(senderId)) {
      return res.status(400).json({ error: "Cererea de prietenie a fost deja trimisă." });
    }

    // Add sender to receiver's friendRequests
    receiver.friendRequests.push(senderId);
    await receiver.save();

    res.json({ message: "Cerere de prietenie trimisă cu succes." });
  } catch (error) {
    console.error("❌ Eroare la trimiterea cererii de prietenie:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// Accept a friend request
router.post("/accept/:senderId", auth, async (req, res) => {
  try {
    const receiverId = req.user._id;
    const senderId = req.params.senderId;

    // Validate senderId
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ error: "ID utilizator invalid." });
    }

    // Find sender and receiver
    const [receiver, sender] = await Promise.all([
      User.findById(receiverId).select("friends friendRequests isActive"),
      User.findById(senderId).select("friends isActive"),
    ]);

    if (!sender) {
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
    }

    if (!sender.isActive || !receiver.isActive) {
      return res.status(403).json({ error: "Unul dintre utilizatori nu este activ." });
    }

    // Check if request exists
    if (!receiver.friendRequests.includes(senderId)) {
      return res.status(400).json({ error: "Nu există nicio cerere de prietenie de la acest utilizator." });
    }

    // Add each user to the other's friends list
    receiver.friends.push(senderId);
    sender.friends.push(receiverId);

    // Remove the friend request
    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== senderId.toString()
    );

    // Save both users
    await Promise.all([receiver.save(), sender.save()]);

    res.json({ message: "Cerere de prietenie acceptată cu succes." });
  } catch (error) {
    console.error("❌ Eroare la acceptarea cererii de prietenie:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// Reject a friend request
router.post("/reject/:senderId", auth, async (req, res) => {
  try {
    const receiverId = req.user._id;
    const senderId = req.params.senderId;

    // Validate senderId
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ error: "ID utilizator invalid." });
    }

    // Find receiver
    const receiver = await User.findById(receiverId).select("friendRequests isActive");

    if (!receiver) {
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
    }

    if (!receiver.isActive) {
      return res.status(403).json({ error: "Utilizatorul nu este activ." });
    }

    // Check if request exists
    if (!receiver.friendRequests.includes(senderId)) {
      return res.status(400).json({ error: "Nu există nicio cerere de prietenie de la acest utilizator." });
    }

    // Remove the friend request
    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== senderId.toString()
    );

    await receiver.save();

    res.json({ message: "Cerere de prietenie respinsă cu succes." });
  } catch (error) {
    console.error("❌ Eroare la respingerea cererii de prietenie:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// Unfriend a user
router.post("/unfriend/:friendId", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    // Validate friendId
    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ error: "ID utilizator invalid." });
    }

    // Prevent self-unfriend
    if (userId.toString() === friendId) {
      return res.status(400).json({ error: "Nu te poți elimina pe tine însuți din lista de prieteni." });
    }

    // Find both users
    const [user, friend] = await Promise.all([
      User.findById(userId).select("friends isActive"),
      User.findById(friendId).select("friends isActive"),
    ]);

    if (!friend) {
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
    }

    if (!user.isActive || !friend.isActive) {
      return res.status(403).json({ error: "Unul dintre utilizatori nu este activ." });
    }

    // Check if users are friends
    if (!user.friends.includes(friendId) || !friend.friends.includes(userId)) {
      return res.status(400).json({ error: "Utilizatorii nu sunt prieteni." });
    }

    // Remove each user from the other's friends list
    user.friends = user.friends.filter((id) => id.toString() !== friendId.toString());
    friend.friends = friend.friends.filter((id) => id.toString() !== userId.toString());

    // Save both users
    await Promise.all([user.save(), friend.save()]);

    res.json({ message: "Prieten eliminat cu succes." });
  } catch (error) {
    console.error("❌ Eroare la eliminarea prietenului:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// View pending friend requests
router.get("/requests", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user and populate friendRequests with username and email
    const user = await User.findById(userId)
      .select("friendRequests")
      .populate("friendRequests", "username email profilePic");

    if (!user) {
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
    }

    // Format response
    const friendRequests = user.friendRequests.map((sender) => ({
      userId: sender._id,
      username: sender.username,
      email: sender.email,
      profilePic: sender.profilePic || null,
    }));
    //console.log("Cereri de prietenie:", friendRequests);
    res.json({ friendRequests });
  } catch (error) {
    console.error("❌ Eroare la obținerea cererilor de prietenie:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

// View friends
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user and populate friends with username and email
    const user = await User.findById(userId)
      .select("friends")
      .populate("friends", "username email profilePic");

    if (!user) {
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
    }

    // Format response
    const friends = user.friends.map((friend) => ({
      userId: friend._id,
      username: friend.username,
      email: friend.email,
      profilePic: friend.profilePic || null,
    }));

    res.json({ friends });
  } catch (error) {
    console.error("❌ Eroare la obținerea prietenilor:", error);
    res.status(500).json({ error: "Eroare internă a serverului." });
  }
});

module.exports = router;