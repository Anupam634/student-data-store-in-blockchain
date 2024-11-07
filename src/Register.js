// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase/firebaseconfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import './Register.css'; // Optional: style the form

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const profile = sessionStorage.getItem("profile");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Register user with Firebase
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Registration successful!");
      setError("");

      // Navigate based on user role
      if (profile === "Institute") {
        navigate("/institute");
      } else {
        navigate("/verifier");
      }
    } catch (err) {
      setError("Registration unsuccessful! " + err.message);
      setSuccess("");
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
      <button onClick={() => navigate("/login")}>
        Already registered? Click here to login!
      </button>
    </div>
  );
}

export default Register;
