// File: src/pages/Home.js

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [selectedRuleName, setSelectedRuleName] = useState(null);
  const [customBreakdown, setCustomBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("DEBUG: Home useEffect triggered. user:", user);

    if (!user || !user._id) {
      console.warn("DEBUG: No user or user._id found.");
      setLoading(false);
      return;
    }

    const fetchSelectedRule = async () => {
      try {
        console.log(`DEBUG: Fetching selected rule for user id: ${user._id}`);
        const res = await axios.get(`/api/users/${user._id}/selected-rule`);
        console.log("DEBUG: Response from selected rule endpoint:", res.data);
        const rule = res.data.rule;

        if (rule) {
          console.log("DEBUG: Found rule:", rule);
          setSelectedRuleName(rule.name);

          // Check for custom breakdown
          if (res.data.user?.customRuleBreakdown) {
            setCustomBreakdown(res.data.user.customRuleBreakdown);
          } else {
            setCustomBreakdown(null);
          }
        } else {
          console.warn("DEBUG: No rule found in the response data.");
        }
      } catch (err) {
        console.error("DEBUG: Error fetching selected rule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedRule();
  }, [user]);

  return (
    <div
      style={{
        backgroundColor: "#F9FAFB",
        minHeight: "100vh",
        paddingBottom: "6rem",
        color: "#1F2937",
      }}
    >
      <Navbar />
  
      <div style={{ padding: "2rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#4F46E5",
            marginBottom: "0.5rem",
          }}
        >
          Welcome to SpendWise
        </h1>
  
        {loading ? (
          <p>Loading your budgeting rule...</p>
        ) : selectedRuleName ? (
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              color: "#10B981",
              marginBottom: "1rem",
            }}
          >
            Rule Selected: {selectedRuleName}
            {customBreakdown?.percentages?.length > 0 && (
              <> ({customBreakdown.percentages.join("/")})</>
            )}
          </h2>
        ) : (
          <p style={{ color: "#6B7280", fontSize: "1.1rem" }}>
            <strong>You haven't selected a budgeting rule yet.</strong> <br />
            Go to the <strong>Rules</strong> page to choose one.
          </p>
        )}
  
        {/* Add Category Button */}
        <button
          style={{
            backgroundColor: "#4F46E5",
            color: "#ffffff",
            padding: "0.6rem 1.2rem",
            borderRadius: "0.5rem",
            fontWeight: "600",
            fontSize: "1rem",
            marginTop: "2rem",
          }}
        >
          + Add Category
        </button>
  
        {/* Recommendations Button */}
        <div style={{ marginTop: "2.5rem" }}>
          <button
            style={{
              backgroundColor: "#F97316",
              color: "#ffffff",
              padding: "0.6rem 1.5rem",
              borderRadius: "2rem",
              fontWeight: "600",
              fontSize: "1rem",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            📊 Get Recommendations
          </button>
        </div>
      </div>
  
      {/* Fixed Bottom Panel */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#E5E7EB",
          padding: "1rem",
          textAlign: "center",
          boxShadow: "0 -2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ color: "#6B7280", fontSize: "0.95rem" }}>
          {/* You can add summary data or quick stats here later */}
          Bottom Panel Placeholder
        </p>
      </div>
    </div>
  );
}  
export default Home;
