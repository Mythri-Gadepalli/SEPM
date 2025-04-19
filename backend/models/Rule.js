import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema({
  // Rule name (e.g., "50/30/20", "60/20/20", etc.)
  name: {
    type: String,
    required: true,
    trim: true,
  },

  // Default breakdown: e.g., { needs: 50, wants: 30, savings: 20 }
  defaultBreakdown: {
    type: Map,
    of: Number,
    required: true,
    default: {},
  },

  // Indicates if the rule can be customized by the user
  isCustomizable: {
    type: Boolean,
    default: true,
  },

  // Optional limit on the number of categories or priorities this rule supports
  priorityLimit: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true, // Optional: adds createdAt and updatedAt timestamps
});

const Rule = mongoose.model("Rule", ruleSchema);
export default Rule;
