import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthCard from "../components/AuthCard.jsx";
import { toast } from "sonner";

function ResetPassword() {
  const { token } = useParams(); // ✅ grabs token from /reset-password/:token
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_USER_API_ENDPOINT}/change-password/${token}`,
        {
          token, // from URL
          newPassword: password, // new password
        }
      );

      toast.success(res.data.message || "Password reset successful!");
      navigate("/login"); // redirect to login after reset
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset Password"
      footerText="Remembered your password?"
      footerLink="Login"
      footerHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <input
          type={showPassword ? "text" : "password"}
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-white/20 border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Confirm Password */}
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-white/20 border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Show Password Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            className="mr-2"
          />
          <label htmlFor="showPassword" className="text-gray-300 text-sm">
            Show Password
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </AuthCard>
  );
}

export default ResetPassword;
