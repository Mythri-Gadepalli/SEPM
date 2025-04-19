import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from './context/UserContext';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Rules from "./pages/Rules";
import EditProfile from "./pages/EditProfile"
const userRoutes = require('./userRoutes');
app.use('/api', userRoutes); // This connects the /user route to the /api endpoint

function App() {
  return (
    <Router>
      <UserProvider>  {/* Wrap your routes with the context provider */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
