import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar"; // ✅ Import Navbar

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [fullUser, setFullUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user._id) return;

      try {
        const res = await fetch(`/api/users/${user._id}`);
        const data = await res.json();
        setFullUser(data);
      } catch (error) {
        console.error("❌ Failed to fetch user profile:", error);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user || !fullUser) {
    return (
      <>
        <Navbar />
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#F9FAFB",
            minHeight: "100vh",
            color: "#1F2937",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", color: "#4F46E5" }}>Profile</h2>
          <p>Loading user data...</p>
        </div>
      </>
    );
  }

  const infoBoxStyle = {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "1rem",
    marginBottom: "1rem",
  };

  const labelStyle = {
    fontWeight: "bold",
    color: "#4F46E5",
  };

  const valueStyle = {
    color: "#1F2937",
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          padding: "2rem",
          backgroundColor: "#F9FAFB",
          minHeight: "100vh",
          color: "#1F2937",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "1rem",
            color: "#4F46E5",
          }}
        >
          Your Profile
        </h2>

        <div style={infoBoxStyle}>
          <p>
            <span style={labelStyle}>Username:</span>{" "}
            <span style={valueStyle}>{fullUser.username}</span>
          </p>
          <p>
            <span style={labelStyle}>Email:</span>{" "}
            <span style={valueStyle}>{fullUser.email}</span>
          </p>
          <p>
            <span style={labelStyle}>Age:</span>{" "}
            <span style={valueStyle}>{fullUser.age || "Not set"}</span>
          </p>
          <p>
            <span style={labelStyle}>Gender:</span>{" "}
            <span style={valueStyle}>{fullUser.gender || "Not set"}</span>
          </p>
          <p>
            <span style={labelStyle}>Monthly Income:</span>{" "}
            <span style={valueStyle}>{fullUser.monthlyIncome || "Not set"}</span>
          </p>
          <p>
            <span style={labelStyle}>Total Savings:</span>{" "}
            <span style={valueStyle}>{fullUser.totalSavings || "Not set"}</span>
          </p>
        </div>

        <button
          onClick={() => navigate("/edit-profile")}
          style={{
            padding: "0.75rem 1.25rem",
            backgroundColor: "#10B981",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Edit Profile
        </button>
      </div>
    </>
  );
};

export default Profile;
