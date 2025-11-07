// zonta-site/src/pages/Admin/AdminLogin.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      //  Store token and email, then redirect to Admin dashboard
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminEmail", email);
      navigate("/admin", { replace: true }); // redirect to Admin root
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-zontaGold/10 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-zontaRed mb-6 text-center">
          Admin Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-zontaDark font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-zontaGold rounded-md px-4 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
            />
          </div>

          <div>
            <label className="block text-zontaDark font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-zontaGold rounded-md px-4 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
            />
          </div>

          {error && (
            <p className="text-red-600 bg-red-100 border border-red-200 rounded-md p-2 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zontaGold text-white py-2 rounded-md font-semibold hover:bg-zontaDark transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
}
