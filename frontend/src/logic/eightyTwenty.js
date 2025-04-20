import React, { useState, useEffect } from "react";
import axios from "axios";

const priorityLabels = ["Needs", "Savings"];

const EightyTwenty = ({
  showPopup,
  onClose,
  userId,
  income,
  customBreakdown,
  onCategoryAdded,
  refreshTrigger,
  setRefreshTrigger,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [priority, setPriority] = useState("1");
  const [amount, setAmount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [adjustValues, setAdjustValues] = useState({});
  const [categoryLimit, setCategoryLimit] = useState(0);


  const fetchCategories = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/categories`);
      console.log("Fetched categories:", res.data.categories);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      console.log("useEffect triggered with userId or refreshTrigger");
      fetchCategories();
    }
  }, [userId, refreshTrigger]);

  const percentages = customBreakdown?.percentages || [80, 20];
  const priorityData = percentages.map((percent, index) => ({
    priority: index + 1,
    label: priorityLabels[index],
    amount: Math.round((income * percent) / 100),
  }));


  const toggleRefresh = () => {
    console.log("Toggling refresh trigger");
    setRefreshTrigger((prev) => !prev);
  };

  const handleCreate = async () => {
    if (!categoryName || !priority) return;
  
    try {
      // Step 1: Fetch latest categories again to avoid stale state
      const res = await axios.get(`/api/users/${userId}/categories`);
      const latestCategories = res.data.categories || [];
  
      // Step 2: Do limit check against latest data
      const totalLimitForPriority = latestCategories
      .filter((cat) => String(cat.priority) === String(priority))
        .reduce((sum, cat) => sum + (cat.limit || 0), 0);
  
      const budgetLimit = priorityData.find(
        (p) => String(p.priority) === priority
      )?.amount || 0;
  
      const newTotalLimit = totalLimitForPriority + categoryLimit;
  
      if (newTotalLimit > budgetLimit) {
        alert(
          `⚠️ You can't add this category. The total limit (₹${newTotalLimit}) exceeds your allocated budget for ${priorityLabels[priority - 1]} (₹${budgetLimit}).`
        );
        return;
      }
  
      // ✅ Step 3: POST only if budget is valid
      await axios.post(`/api/users/${userId}/categories`, {
        name: categoryName,
        priority,
        amount: 0,
        limit: categoryLimit,
      });
  
      setCategoryName("");
      setAmount(0);
      onClose();
      onCategoryAdded();
  
      if (typeof setRefreshTrigger === "function") {
        setRefreshTrigger((prev) => !prev);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        alert(err.response.data.message);
      } else {
        console.error("Error adding category:", err);
      }
    }
  };
  

  const handleAmountChange = async (catId, newAmount) => {
    try {
      const res = await axios.put(`/api/users/${userId}/categories/${catId}`, {
        amount: newAmount,
      });
  
      // Update state so UI refreshes immediately
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === catId ? { ...cat, amount: newAmount } : cat
        )
      );
    } catch (error) {
      console.error("Failed to update amount:", error.response?.data || error);
    }
  };

  
  const handleUpdateAmount = async (catId, newAmount) => {
    try {
      console.log(`handleUpdateAmount() -> Updating category ID: ${catId}`);
      console.log(`New amount to update: ${newAmount}`);
      await axios.put(`/api/users/${userId}/categories/${catId}`, {
        amount: newAmount,
      });
      console.log("Update successful!");
      onCategoryAdded();
      toggleRefresh();
      window.location.reload();

    } catch (err) {
      console.error("Error updating amount:", err);
    }
  };

  const deleteCategory = async (catId) => {
    try {
      console.log("Deleting category with ID:", catId);
      await axios.delete(`/api/users/${userId}/categories/${catId}`);
      onCategoryAdded();
      toggleRefresh();
      window.location.reload();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  return (
    <>
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "2rem",
              borderRadius: "1rem",
              width: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ color: "#4F46E5", fontSize: "1.5rem", fontWeight: "bold" }}>
              Add New Category (80/20 Rule)
            </h2>

            <div style={{ marginTop: "1.5rem" }}>
              <label style={{ fontWeight: "600" }}>Category Name</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #D1D5DB",
                  marginTop: "0.5rem",
                }}
              />
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label style={{ fontWeight: "600" }}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #D1D5DB",
                  marginTop: "0.5rem",
                }}
              >
                <option value="1">Needs (80%)</option>
                <option value="2" disabled>Savings - Savings can't be spent. (20%)</option>
              </select>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label style={{ fontWeight: "600" }}>Limit</label>
              <input
                type="number"
                value={categoryLimit}
                onChange={(e) => setCategoryLimit(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #D1D5DB",
                  marginTop: "0.5rem",
                }}
              />
            </div>

            <button
              onClick={handleCreate}
              style={{
                backgroundColor: "#10B981",
                color: "#ffffff",
                padding: "0.6rem 1rem",
                borderRadius: "0.5rem",
                marginTop: "1.5rem",
                fontWeight: "600",
                fontSize: "1rem",
              }}
            >
              Create Category
            </button>

            <button
              onClick={onClose}
              style={{
                marginTop: "1rem",
                backgroundColor: "#6B7280",
                color: "#ffffff",
                padding: "0.6rem 1rem",
                borderRadius: "0.5rem",
                fontWeight: "600",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <h3 style={{ marginTop: "2rem", fontWeight: "600", fontSize: "1.2rem" }}>
        Your Categories
      </h3>

      {categories.map((cat) => (
        <div
          key={cat._id}
          style={{
            border: "1px solid #E5E7EB",
            borderRadius: "1rem",
            padding: "1rem",
            marginTop: "1rem",
            backgroundColor: "#F9FAFB",
          }}
        >
          <div style={{ fontWeight: "700", fontSize: "1.1rem", color: "#1F2937" }}>
            {cat.name}
          </div>
          <div style={{ marginTop: "0.3rem" }}>
          <strong>Amount:</strong> ₹{cat.amount} / ₹{cat.limit || 0}


          </div>
          <div style={{ marginTop: "0.3rem" }}>
            <strong>Priority:</strong> {priorityLabels[Number(cat.priority) - 1] || "N/A"}
          </div>

          <div style={{ marginTop: "0.8rem" }}>
            <label style={{ fontWeight: "600" }}>Adjust Amount</label>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={adjustValues[cat._id] ?? cat.amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) {
                    setAdjustValues((prev) => ({
                      ...prev,
                      [cat._id]: Number(val),
                    }));
                  }
                }}
                style={{
                  width: "100px",
                  padding: "0.4rem",
                  borderRadius: "0.4rem",
                  border: "1px solid #D1D5DB",
                }}
              />
              <button
  onClick={() => {
    handleAmountChange(cat._id, cat.amount + 1)
    const value = adjustValues[cat._id];
    if (isNaN(value)) return alert("Enter a valid number");

    const newAmount = cat.amount + Number(value);
    if (newAmount > cat.limit) {
      alert(
        "This adjustment would go above your category limit.\n\n" +
        "Consider increasing the limit or adjusting a smaller amount."
      );
      return;
    }

    handleUpdateAmount(cat._id, newAmount);
    window.location.reload();

  }}
  style={{
    backgroundColor: "#10B981",
    color: "#fff",
    borderRadius: "0.4rem",
    padding: "0.4rem 0.8rem",
    fontWeight: "600",
  }}
>
  +
</button>


<button
  onClick={() => {
    handleAmountChange(cat._id, cat.amount - 1)
    const value = adjustValues[cat._id];
    if (isNaN(value)) return alert("Enter a valid number");
    const newAmount = Math.max(cat.amount - Number(value), 0);
    handleUpdateAmount(cat._id, newAmount);
    window.location.reload();

  }}
  style={{
    backgroundColor: "#EF4444",
    color: "#fff",
    borderRadius: "0.4rem",
    padding: "0.4rem 0.8rem",
    fontWeight: "600",
  }}
>
  -
</button>

              
              <button
                onClick={() => 
                  {deleteCategory(cat._id)
                  window.location.reload();
                }}
                style={{
                  backgroundColor: "#F97316",
                  color: "#fff",
                  borderRadius: "0.4rem",
                  padding: "0.4rem 0.8rem",
                  fontWeight: "600",
                  marginLeft: "auto",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
      <div style={{ height: "5rem" }}></div>
    </>
  );
};

export const EightyTwentySummary = ({ income, customBreakdown, userID, refreshTrigger }) => {
  const percentages = [...(customBreakdown?.percentages || [80, 20])].sort((a, b) => b - a);
  const priorityData = percentages.map((percent, index) => ({
    priority: index + 1,
    label: priorityLabels[index],
    amount: Math.round((income * percent) / 100),
  }));

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!userID) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/users/${userID}/categories`);
        console.log("Fetched categories for summary:", res.data.categories);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Error fetching categories for summary:", err);
      }
    };
    fetch();
  }, [userID, refreshTrigger]);

  useEffect(() => {
    const needsTotal = priorityData.find(p => p.priority === 1)?.amount || 0;
  
    const totalLimit = categories
      .filter(cat => cat.priority === "1")
      .reduce((sum, cat) => sum + (cat.limit || 0), 0);
  
    if (totalLimit > needsTotal) {
      alert(
        `⚠️ Warning: The total limit for your 'Needs' categories (₹${totalLimit}) exceeds your 80% budget allocation (₹${needsTotal}).\n\nPlease reduce some limits.`
      );
    }
  }, [categories, customBreakdown, income]);
  

  const getUsedAmount = (priority) =>
    categories
      .filter((cat) => cat.priority === String(priority))
      .reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#ffffff",
        padding: "1rem 2rem",
        borderTop: "2px solid #E5E7EB",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
        zIndex: 20,
      }}
    >
      <h4 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Budget Summary</h4>
      {priorityData.map((item) => {
  const used = getUsedAmount(item.priority);
  const remaining = item.amount - used;

  const totalLimit = categories
    .filter((cat) => cat.priority === String(item.priority))
    .reduce((sum, cat) => sum + (cat.limit || 0), 0);

  // Alert if limit exceeds total
  if (item.priority === 1 && totalLimit > item.amount) {
    alert(
      `⚠️ Warning: Total limit for 'Needs' categories (₹${totalLimit}) exceeds your 80% budget (₹${item.amount})`
    );
  }

  return (
    <div key={item.priority} style={{ marginBottom: "0.5rem" }}>
      <strong>{item.label}</strong>: ₹{item.amount} total – ₹{remaining} left
    </div>
  );
})}
    </div>
  );
};

export default EightyTwenty;

