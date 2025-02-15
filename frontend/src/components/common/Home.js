import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";

function Home() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [signUpData, setSignUpData] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    mobile: "",
    role: "Citizen",
  });
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/signup", signUpData);
      alert("User created successfully");
      navigate("/citizen");
    } catch (err) {
      console.error("Error during signup:", err);
      alert("Error creating user");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/login", loginData);
      const { token, role } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      console.log("Login successful:", role);
      // Redirect based on role
      if (role === "Admin") {
        navigate("/admin");
      } else if (role === "Rescuer") {
        navigate("/rescuer");
      } else {
        navigate("/citizen");
      }
    } catch (err) {
      console.error("Login error:", err.response ? err.response.data : err);
      alert(
        err.response && err.response.data
          ? err.response.data.message
          : "Invalid credentials"
      );
    }
  };

  return (
    <div className="home-container">
      <h1 className="title">Crisis Management Center</h1>
      <div className="form-toggle">
        <button
          onClick={() => setIsSignUp(true)}
          className={isSignUp ? "active" : ""}
        >
          Sign Up
        </button>
        <button
          onClick={() => setIsSignUp(false)}
          className={!isSignUp ? "active" : ""}
        >
          Log In
        </button>
      </div>
      {isSignUp ? (
        <form onSubmit={handleSignUpSubmit} className="auth-form">
          <h2>Sign Up</h2>
          <input
            type="text"
            placeholder="Username"
            value={signUpData.username}
            onChange={(e) =>
              setSignUpData({ ...signUpData, username: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={signUpData.password}
            onChange={(e) =>
              setSignUpData({ ...signUpData, password: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={signUpData.name}
            onChange={(e) =>
              setSignUpData({ ...signUpData, name: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Surname"
            value={signUpData.surname}
            onChange={(e) =>
              setSignUpData({ ...signUpData, surname: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Mobile Number"
            value={signUpData.mobile}
            onChange={(e) =>
              setSignUpData({ ...signUpData, mobile: e.target.value })
            }
            required
          />
          <button type="submit">Sign Up</button>
        </form>
      ) : (
        <form onSubmit={handleLoginSubmit} className="auth-form">
          <h2>Log In</h2>
          <input
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            required
          />
          <button type="submit">Log In</button>
        </form>
      )}
    </div>
  );
}

export default Home;
