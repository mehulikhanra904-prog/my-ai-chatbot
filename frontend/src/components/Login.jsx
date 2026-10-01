import { useState } from "react";
import { getApiUrl } from "../config";

function Login({ onLogin, switchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        getApiUrl("/api/auth/login"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      onLogin(data.user);

    } catch (error) {
      console.error(error);
      alert("Cannot connect to server");
    }
  };

  return (
    <div className="auth-container">
      <div className="ai-logo">
          🤖
      </div>
      <h1>Welcome Back 👋</h1>
      <form onSubmit={handleSubmit}>

              <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required />

              <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />

              <button type="submit">
                  Login
              </button>

          </form><p>
              Don't have an account?
              <button
                  type="button"
                  onClick={switchToSignup}
              >
                  Sign Up
              </button>
          </p>
    </div>
  );
}

export default Login;