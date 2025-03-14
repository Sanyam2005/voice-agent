// src/components/Navbar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaMicrophone, FaChartBar, FaCog, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <FaMicrophone className="logo-icon" />
          <span className="logo-text">Voice Agent</span>
        </div>

        {/* Mobile menu button */}
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Desktop Navigation */}
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <FaMicrophone className="nav-icon" />
              <span>Assistant</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <FaChartBar className="nav-icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <FaCog className="nav-icon" />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <ul className="mobile-nav-menu">
          <li className="mobile-nav-item">
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaMicrophone className="mobile-nav-icon" />
              <span>Assistant</span>
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaChartBar className="mobile-nav-icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li className="mobile-nav-item">
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaCog className="mobile-nav-icon" />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;