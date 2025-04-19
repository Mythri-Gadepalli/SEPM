// File: src/pages/Rules.js

import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Rules = () => {
  const { user } = useContext(AuthContext);
  const [openRule, setOpenRule] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRuleKey, setSelectedRuleKey] = useState(null);
  const [rulesMap, setRulesMap] = useState({});
  const [showCustomizePopup, setShowCustomizePopup] = useState(false);
  const [customInputs, setCustomInputs] = useState([]);
  const [customRuleId, setCustomRuleId] = useState(null);

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
      console.info("ℹ️ Attempted to customize non-customizable rule:", rule.name);
      return;
    }

    const defaultBreakdown = rule.defaultBreakdown || {};
    const inputs = Object.keys(defaultBreakdown).map((category) => ({
      category,
      percentage: defaultBreakdown[category]
    }));

    setCustomInputs(inputs);
    setCustomRuleId(rule._id);
    setShowCustomizePopup(true);
    console.log("🛠 Opened customization popup for:", rule.name);
  };

  const handleInputChange = (index, value) => {
    const updatedInputs = [...customInputs];
    updatedInputs[index].percentage = value;
    setCustomInputs(updatedInputs);
  };

  const handleSaveCustomization = async () => {
    const total = customInputs.reduce((acc, item) => acc + Number(item.percentage), 0);
    if (total !== 100) {
      alert("Percentages must add up to 100.");
      console.warn("❌ Percentages do not add to 100:", customInputs);
      return;
    }

    const payload = {
      userId: user._id,
      ruleId: customRuleId,
      customBreakdown: {
        percentages: customInputs.map(i => Number(i.percentage)),
        categories: customInputs.map(i => i.category),
      },
    };

    try {
      await axios.post("/api/users/select-rule", payload);
      alert("Customized rule saved successfully!");
      setShowCustomizePopup(false);
      console.log("✅ Custom rule saved:", payload);
    } catch (error) {
      alert("Failed to save customized rule.");
      console.error("❌ Error saving customized rule:", error);
    }
  };

  const rules = [/* Same static rules array as before, unchanged */];

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

      {/* Choose Rule Popup */}
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
                    alert(`Error selecting rule: ${err.response?.data?.message || err.message}`);
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

      {/* Customize Rule Popup */}
      {showCustomizePopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 999,
        }}>
          <div style={{
            backgroundColor: "#fff", padding: "2rem", borderRadius: "12px",
            maxWidth: "500px", width: "90%", textAlign: "center",
          }}>
            <h2 style={{ color: "#4F46E5", marginBottom: "1rem" }}>Customize Your Rule</h2>
            {customInputs.map((input, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "bold" }}>
                  {input.category} (%):
                </label>
                <input
                  type="number"
                  value={input.percentage}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  style={{
                    width: "100%", padding: "0.5rem", borderRadius: "6px",
                    border: "1px solid #ccc", fontSize: "1rem",
                  }}
                />
              </div>
            ))}
            <button
              onClick={handleSaveCustomization}
              style={{
                backgroundColor: "#10B981",
                color: "#fff",
                border: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                marginRight: "1rem"
              }}
            >
              Save Customization
            </button>
            <button
              onClick={() => setShowCustomizePopup(false)}
              style={{
                backgroundColor: "#F97316",
                color: "#fff",
                border: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rules;
