import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Other", ""],
    default: "",
  },

  monthlyIncome: {
    type: Number,
  },

  totalSavings: {
    type: Number,
  },

  // Selected budgeting rule (referencing Rule collection)
  selectedRule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rule", // Populates the rule data from Rule model
  },

  // Optional breakdown map (e.g., Needs: 50, Wants: 30, Savings: 20)
  selectedRuleBreakdown: {
    type: Map,
    of: Number,
  },

  customRuleBreakdown: {
    categories: [String],
    percentages: [Number],
  },
  
  // Custom percentages for customizable rules (must sum to 100)
  customPercentages: {
    type: [Number],
    validate: {
      validator: function (arr) {
        if (!arr || arr.length === 0) return true; // allow empty
        const total = arr.reduce((sum, val) => sum + val, 0);
        return total === 100;
      },
      message: "Custom percentages must add up to 100",
    },
  },

  // For fully custom category names in certain budgeting strategies
  customCategories: {
    type: [String],
  },
});

// Password hashing before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
