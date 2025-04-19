// frontend/src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <>
      <style>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #ffffff;
          padding: 10px 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .logo-container {
          flex: 1;
        }

        .logo {
          width: 90px;
          height: auto;
        }

        .nav-links {
          display: flex;
          list-style: none;
          gap: 20px;
        }

        .nav-links li {
          font-size: 16px;
        }

        .nav-links a {
          text-decoration: none;
          color: #4F46E5;
          font-weight: 500;
        }

        .nav-links a:hover {
          color: #10B981;
        }
      `}</style>

      <nav className="navbar">
        <div className="logo-container">
          <Link to="/home">
            <img src="/Logo.png" alt="SpendWise Logo" className="logo" />
          </Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/home">Dashboard</Link></li>
          <li><Link to="/rules">Rules</Link></li>
          <li><Link to="/monthly-comparisons">Monthly Comparisons</Link></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
