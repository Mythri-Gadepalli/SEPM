import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import User from '../models/User.js';
import Rule from '../models/Rule.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET user profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update user profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const updateFields = { ...req.body };

    if (updateFields.password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(updateFields.password, salt);
    }

    const user = await User.findByIdAndUpdate(req.userId, updateFields, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// User Registration
router.post("/register", async (req, res) => {
  const username = req.body.username?.trim();
  const email = req.body.email?.trim();
  const password = req.body.password;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists" });
    }

    const newUser = new User({ username, email, password }); // plain password

    
    await newUser.save();

    res
      .status(201)
      .json({ message: "Account created successfully. You can now log in." });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// User Login with populated selected rule
router.post("/login", async (req, res) => {
  const username = req.body.username?.trim();
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ username }).populate("selectedRule");

    if (!existingUser) {
      return res.status(400).json({ message: "Username does not exist." });
    }


    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    const token = jwt.sign(
      { userId: existingUser._id, username: existingUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const userWithoutPassword = {
      _id: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      age: existingUser.age,
      gender: existingUser.gender,
      monthlyIncome: existingUser.monthlyIncome,
      totalSavings: existingUser.totalSavings,
      selectedRule: existingUser.selectedRule,
      selectedRuleBreakdown: existingUser.selectedRuleBreakdown,
      customPercentages: existingUser.customPercentages,
      customCategories: existingUser.customCategories,
    };

    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Update Profile Info (age, gender, income, savings)
router.put("/update-profile", async (req, res) => {
  const { userId, age, gender, monthlyIncome, totalSavings } = req.body;
  console.log("Update profile request body:", req.body);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { age, gender, monthlyIncome, totalSavings },
      { new: true }
    ).populate("selectedRule");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userWithoutPassword = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      age: updatedUser.age,
      gender: updatedUser.gender,
      monthlyIncome: updatedUser.monthlyIncome,
      totalSavings: updatedUser.totalSavings,
      selectedRule: updatedUser.selectedRule,
      selectedRuleBreakdown: updatedUser.selectedRuleBreakdown,
      customPercentages: updatedUser.customPercentages,
      customCategories: updatedUser.customCategories,
    };

    res.status(200).json({ message: "Profile updated", user: userWithoutPassword });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change Password
router.put("/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// userRoutes.js
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// POST login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      token: "dummyToken", // Replace with JWT if needed
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// POST select rule
router.post("/select-rule", async (req, res) => {
  const { userId, ruleId, customBreakdown } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const rule = await Rule.findById(ruleId);
    if (!rule) return res.status(404).json({ message: "Rule not found" });

    user.selectedRule = rule._id;

    if (rule.isCustomizable && customBreakdown?.percentages && customBreakdown?.categories) {
      const { percentages, categories } = customBreakdown;

      // Save individual arrays
      user.customPercentages = percentages;
      user.customCategories = categories;

      // Save breakdown as plain object
      const breakdown = {};
      for (let i = 0; i < categories.length; i++) {
        breakdown[categories[i]] = percentages[i];
      }

      user.selectedRuleBreakdown = breakdown;
      user.customRuleBreakdown = {
        percentages,
        categories,
      };

      console.log("✅ Saving breakdown to DB:", breakdown);
    } else {
      // 🚨 Clear custom fields if rule is not customizable or no custom data is passed
      user.customPercentages = [];
      user.customCategories = [];
      user.selectedRuleBreakdown = {};
      user.customRuleBreakdown = null;

      console.log("🧼 Cleared custom data for non-customizable rule or missing data.");
    }

    await user.save();
    res.status(200).json({ message: "Rule and customization saved successfully." });
  } catch (err) {
    console.error("❌ Error saving rule:", err);
    res.status(500).json({ message: "Server error while saving rule." });
  }
});

// GET selected rule + customization
// GET selected rule (basic info only)
router.get("/users/:userId/selected-rule", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate({
        path: "selectedRule",
        select: "name defaultBreakdown isCustomizable"
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      rule: user.selectedRule || null
    });
  } catch (error) {
    console.error("❌ Error fetching selected rule:", error);
    res.status(500).json({ message: "Failed to fetch selected rule" });
  }
});


// GET full user profile
router.get("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching full user profile:", err);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

// In backend/routes/userRoutes.js

router.get('/:id/selected-rule', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("selectedRule");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      rule: user.selectedRule,
      user: {
        customRuleBreakdown: user.customRuleBreakdown || null
      }
    });
  } catch (err) {
    console.error("Error in GET /:id/selected-rule", err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;
