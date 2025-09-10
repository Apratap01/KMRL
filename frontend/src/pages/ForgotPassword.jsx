import React, { useState } from "react";
import AuthCard from "../components/AuthCard.jsx";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      // 🔗 Call your backend API (adjust base URL if needed)
      const res = await axios.post(`${import.meta.env.VITE_USER_API_ENDPOINT}/forgot-password`, { email });
      setMessage(res.data.message || "Password reset link sent! Check your email.");
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Failed to send reset link.");
      } else {
        setError("Server not reachable. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot Password"
      footerText="Remembered your password?"
      footerLink="Login"
      footerHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <label htmlFor="email" className="text-sm text-gray-300">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-white/20 border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Feedback */}
        {message && <p className="text-green-400 text-sm">{message}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </AuthCard>
  );
}

export default ForgotPassword;
