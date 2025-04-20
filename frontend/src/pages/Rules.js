import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Adjust path if needed

const Rules = () => {
  const { user } = useContext(AuthContext);
  const [openRule, setOpenRule] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRuleKey, setSelectedRuleKey] = useState(null);
  const [rulesMap, setRulesMap] = useState({});

  const toggleRule = (ruleKey) => {
    setOpenRule(openRule === ruleKey ? null : ruleKey);
  };

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await axios.get("/api/rules");
        const map = {};
        res.data.forEach(rule => {
          map[rule.key] = rule;
        });
        setRulesMap(map);
        console.log("📥 Rules fetched successfully:", map);
      } catch (err) {
        console.error("❌ Failed to fetch rules:", err);
      }
    };
    fetchRules();
  }, []);

  const handleCustomize = async (ruleKey) => {
    const rule = rulesMap[ruleKey];
    if (!rule) {
      alert("Rule not found.");
      console.warn("❌ Rule not found for customization:", ruleKey);
      return;
    }

    if (!rule.isCustomizable) {
      alert(`${rule.name} is not customizable because it depends entirely on user-created priorities or detailed allocations. Try selecting a customizable rule like 50/30/20 or 80/20 instead.`);
      console.info("ℹ Attempted to customize non-customizable rule:", rule.name);
      return;
    }

    const defaultBreakdown = rule.defaultBreakdown || {};
    const categories = Object.keys(defaultBreakdown);
    let inputs = [];

    console.log("🛠 Starting customization for:", rule.name);

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const value = prompt(`${cat} % (Priority ${i + 1}):`, defaultBreakdown[cat]);
      if (value === null) {
        console.warn("🚫 User cancelled input for:", cat);
        return;
      }
      const num = parseFloat(value);
      if (isNaN(num)) {
        alert("Please enter valid numbers only!");
        console.warn("❌ Invalid number entered:", value);
        return;
      }
      inputs.push({ category: cat, percentage: num });
    }

    const total = inputs.reduce((acc, item) => acc + item.percentage, 0);
    if (total !== 100) {
      alert("Percentages must add up to 100.");
      console.warn("❌ Percentages do not add to 100:", inputs);
      return;
    }

    console.log("✅ Custom inputs validated:", inputs);
    await saveCustomizedRule(rule._id, inputs);
  };

  const saveCustomizedRule = async (ruleId, inputs) => {
    const percentages = inputs.map(i => i.percentage);
    const categories = inputs.map(i => i.category);

    const payload = {
      userId: user._id,
      ruleId,
      customBreakdown: {
        percentages,
        categories
      }
    };

    console.log("📦 Sending customization payload:", payload);

    try {
      await axios.post("/api/users/select-rule", payload);
      alert("Customized rule saved successfully!");
      console.log("✅ Rule saved successfully");
    } catch (error) {
      alert("Failed to save customized rule.");
      console.error("❌ Error saving customized rule:", error);
    }
  };

  const rules = [
    {
      title: "50/30/20 Rule – Simple & Popular",
      key: "50-30-20",
      content: (
        <>
          <p>This rule divides your monthly after-tax income into three main categories:
            <strong> 50% for Needs</strong>, <strong>30% for Wants</strong>, and
            <strong>20% for Savings/Debt</strong>.
          </p>
          <p><strong>Example:</strong> If you earn ₹60,000/month:
            <ul>
              <li>₹30,000 → Needs</li>
              <li>₹18,000 → Wants</li>
              <li>₹12,000 → Savings</li>
            </ul>
          </p>
          <p>It's great for beginners who want a balanced budget without getting too detailed.</p>
        </>
      ),
    },
    {
      title: "Zero-Based Budgeting",
      key: "zero-based",
      content: (
        <>
          <p>Every rupee you earn is assigned a job — whether it's rent, food, savings, or fun.
            <strong> Income - Expenses = 0</strong>
          </p>
          <p><strong>Example:</strong> ₹50,000/month:
            <ul>
              <li>₹20,000 → Rent</li>
              <li>₹10,000 → Groceries</li>
              <li>₹10,000 → Savings</li>
              <li>₹10,000 → Misc</li>
            </ul>
          </p>
        </>
      ),
    },
    {
      title: "80/20 Rule (Pay Yourself First)",
      key: "80-20",
      content: (
        <>
          <p>Save first, then spend the rest:
            <strong> 20% Saving, 80% Living</strong>.
          </p>
          <p><strong>Example:</strong> ₹40,000/month:
            <ul>
              <li>₹8,000 → Save</li>
              <li>₹32,000 → Spend</li>
            </ul>
          </p>
        </>
      ),
    },
    {
      title: "70/20/10 Rule",
      key: "70-20-10",
      content: (
        <>
          <p>
            <strong>70% Living, 20% Savings, 10% Giving</strong>.
          </p>
          <p><strong>Example:</strong> ₹1,00,000/month:
            <ul>
              <li>₹70,000 → Living</li>
              <li>₹20,000 → Savings</li>
              <li>₹10,000 → Giving</li>
            </ul>
          </p>
        </>
      ),
    },
    {
      title: "Priority-Based Budgeting",
      key: "priority",
      content: (
        <>
          <p>You define your own categories and allocate based on priority.</p>
          <p><strong>Example:</strong>
            <ul>
              <li>₹20,000 → Rent (P1)</li>
              <li>₹10,000 → Travel (P2)</li>
              <li>₹7,000 → Food (P3)</li>
            </ul>
          </p>
        </>
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: "#F9FAFB", minHeight: "100vh", padding: "2rem", color: "#1F2937" }}>
      <Navbar />
      <h1 style={{ color: "#4F46E5", fontSize: "1.5rem", marginBottom: "1rem" }}>Budgeting Rules</h1>
      <p style={{ marginBottom: "2rem", fontWeight: "500" }}>
        We recommend starting with the <strong>50/30/20 rule</strong>.
      </p>

      {rules.map((rule) => (
        <div key={rule.key} style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "1rem", marginBottom: "1rem", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
          <div
            onClick={() => toggleRule(rule.key)}
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: "600",
              fontSize: "1.1rem",
              color: "#4F46E5",
            }}
          >
            {rule.title}
            <span style={{ transform: openRule === rule.key ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
              ▶
            </span>
          </div>

          {openRule === rule.key && (
            <div style={{ marginTop: "1rem", color: "#1F2937" }}>
              {rule.content}
              <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => {
                    setSelectedRuleKey(rule.key);
                    setShowPopup(true);
                    console.log("📌 Popup opened for rule:", rule.key);
                  }}
                  style={{
                    backgroundColor: "#10B981",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Choose This Rule
                </button>
                <button
                  onClick={() => handleCustomize(rule.key)}
                  style={{
                    backgroundColor: "#F97316",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Customize This Rule
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {showPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 999,
        }}>
          <div style={{
            backgroundColor: "#fff", padding: "2rem", borderRadius: "12px",
            maxWidth: "500px", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{ color: "#4F46E5", marginBottom: "1rem" }}>Customize Your Rule?</h2>
            <p style={{ color: "#1F2937", marginBottom: "1.5rem" }}>
              Customizing allows you to adjust the rule’s default percentages to match your lifestyle. For example, change 50/30/20 to 60/20/20!
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <button
                onClick={() => {
                  handleCustomize(selectedRuleKey);
                  setShowPopup(false);
                }}
                style={{
                  backgroundColor: "#F97316",
                  color: "#fff",
                  border: "none",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Customize
              </button>
              <button
                onClick={async () => {
                  try {
                    const ruleObj = rulesMap[selectedRuleKey];
                    if (!ruleObj) {
                      alert("Selected rule not found. Please try again.");
                      return;
                    }

                    await axios.post("/api/users/select-rule", {
                      userId: user._id,
                      ruleId: ruleObj._id,
                      customBreakdown: ruleObj.defaultBreakdown,
                    });

                    alert("Rule selected successfully!");
                    console.log("✅ Rule selected without customization:", ruleObj.name);
                  } catch (err) {
                    console.error(err);
                    alert(Error `selecting rule: ${err.response?.data?.message || err.message}`);
                  }
                  setShowPopup(false);
                }}
                style={{
                  backgroundColor: "#10B981",
                  color: "#fff",
                  border: "none",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                No, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rules;
