import React from "react";
import { Link } from "react-router-dom";

function AuthCard({ title, children, googleText, footerText, footerLink, footerHref }) {
  return (
    <div className="flex justify-center items-center px-6 py-12 w-full  min-h-screen">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg max-w-md w-full text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>

        {/* Form content injected from Login/Signup */}
        {children}

        {/* Google button */}
        <div className="mt-6">
          <button className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-xl shadow-md hover:bg-gray-200 transition">
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            {googleText}
          </button>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-gray-300">
          {footerText}{" "}
          <Link to={footerHref} className="text-blue-400 hover:underline">
            {footerLink}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthCard;
