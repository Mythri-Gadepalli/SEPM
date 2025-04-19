import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar"; // Adjust path if needed


const EditProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: user?.age || "",
    gender: user?.gender || "",
    monthlyIncome: user?.monthlyIncome || "",
    totalSavings: user?.totalSavings || "",
  });

  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put("/api/users/update-profile", {
        userId: user._id,
        ...formData,
      });
      setUser(res.data.user);
      alert("Profile updated!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      return alert("New passwords do not match");
    }

    try {
      const res = await axios.put("/api/users/change-password", {
        userId: user._id,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      alert(res.data.message);
      setShowPasswordPopup(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <>
      <Navbar /> {/* ✅ Navbar added here */}
    <div
      style={{
        padding: "2rem",
        backgroundColor: "#F9FAFB",
        minHeight: "100vh",
        color: "#1F2937",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#4F46E5" }}>
        Edit Profile
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          style={inputStyle}
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="number"
          name="monthlyIncome"
          placeholder="Monthly Income"
          value={formData.monthlyIncome}
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          type="number"
          name="totalSavings"
          placeholder="Total Savings"
          value={formData.totalSavings}
          onChange={handleChange}
          style={inputStyle}
        />
        <button
          type="submit"
          style={{
            ...buttonStyle,
            backgroundColor: "#10B981",
          }}
        >
          Save Changes
        </button>
      </form>

      <button
        onClick={() => setShowPasswordPopup(true)}
        style={{
          ...buttonStyle,
          backgroundColor: "#F97316",
          marginTop: "1rem",
        }}
      >
        Change Password
      </button>

      {/* Password Popup */}
      {showPasswordPopup && (
        <div style={popupOverlayStyle}>
          <div style={popupStyle}>
            <h3 style={{ marginBottom: "1rem" }}>Change Password</h3>
            <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input
                type="password"
                name="oldPassword"
                placeholder="Old Password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                style={inputStyle}
              />
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                style={inputStyle}
              />
              <input
                type="password"
                name="confirmNewPassword"
                placeholder="Confirm New Password"
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                style={inputStyle}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="submit" style={{ ...buttonStyle, backgroundColor: "#4F46E5" }}>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordPopup(false)}
                  style={{ ...buttonStyle, backgroundColor: "#6B7280" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

const inputStyle = {
  padding: "0.75rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
};

const buttonStyle = {
  padding: "0.75rem",
  border: "none",
  borderRadius: "8px",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const popupOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const popupStyle = {
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "400px",
};

export default EditProfile;
