import React, { useState } from "react";
import AuthCard from "../components/AuthCard";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthCard
      title="Login"
      googleText="Sign in with Google"
      footerText="Don’t have an account?"
      footerLink="Signup"
      footerHref="/signup"
    >
      <form className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center mt-2">
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
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold shadow-md"
        >
          Login
        </button>
      </form>
    </AuthCard>
  );
}

export default Login;
