import { useState } from "react";

function Signup({ switchToLogin }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      alert("Account created successfully! 🎉");

      switchToLogin();

    } catch (error) {

      console.error(error);

      alert("Cannot connect to server");
    }
  };

  return (
    <div
    className="auth-container">
   <div className="ai-logo">
          🤖
      </div>
      <h1>Create Account ✨</h1><form onSubmit={handleSubmit}>

              <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required />

              <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required />

              <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />

              <button type="submit">
                  Create Account
              </button>

          </form>
          <p>
              Already have an account?
              <button
                  type="button"
                  onClick={switchToLogin}
              >
                  Login
              </button>
          </p>
    </div>
  );
}

export default Signup;
