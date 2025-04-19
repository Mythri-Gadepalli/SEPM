// File: frontend/src/logic/fiftyThirtyTwenty.js

/**
 * Get initial allocation based on monthly income and rule percentages.
 * @param {number} income - Monthly income of the user.
 * @param {number[]} percentages - Breakdown percentages like [50, 30, 20].
 * @returns {object} - Priority-wise allocation.
 */
export const getInitialSummary = (income, percentages = [50, 30, 20]) => {
    return {
      1: Math.round((percentages[0] / 100) * income),
      2: Math.round((percentages[1] / 100) * income),
      3: Math.round((percentages[2] / 100) * income),
    };
  };
  
  /**
   * Calculate remaining budget per priority after categories are added.
   * @param {object} initialSummary - Initial budget breakdown.
   * @param {array} categories - Array of category objects with { name, amount, priority }.
   * @returns {object} - Remaining budget per priority.
   */
  export const getRemainingBudget = (initialSummary, categories) => {
    const remaining = { ...initialSummary };
  
    categories.forEach((cat) => {
      if (remaining[cat.priority] !== undefined) {
        remaining[cat.priority] -= cat.amount;
      }
    });
  
    return remaining;
  };
  
  /**
   * Validate category addition for budget overflows.
   * @param {number} amount - Amount user wants to assign to category.
   * @param {number} priority - Priority level of the category.
   * @param {object} remainingBudget - Current remaining budget per priority.
   * @returns {object} - { isValid, message }
   */
  export const validateCategory = (amount, priority, remainingBudget) => {
    const remaining = remainingBudget[priority];
  
    if (remaining === undefined) {
      return { isValid: false, message: "Invalid priority level." };
    }
  
    if (priority === 1 && amount > remaining) {
      return {
        isValid: false,
        message:
          "Priority 1 is going over budget. Consider customizing this rule.",
      };
    }
  
    if (priority === 2 && amount > remaining) {
      return {
        isValid: false,
        message: "Cut down the amount — Priority 2 is exceeding its budget.",
      };
    }
  
    // For Priority 3 (savings), we allow overbudget with no warning
    return { isValid: true, message: "" };
  };
  
