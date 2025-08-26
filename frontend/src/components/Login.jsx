import React, { useState } from "react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex justify-center items-center px-6 py-12">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg max-w-md w-full text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

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

        <div className="mt-6">
          <button className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-xl shadow-md hover:bg-gray-200 transition">
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>
        </div>

        <p className="mt-6 text-center text-gray-300">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:underline">
            Signup
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
