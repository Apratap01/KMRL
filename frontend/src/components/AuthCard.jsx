import React from "react";
import { Link } from "react-router-dom";

function AuthCard({ title, children, footerText, footerLink, footerHref }) {
  return (
    <div className="bg-gradient-to-r from-[#03070e] to-[#050448] flex justify-center items-center px-6 py-12 w-full  min-h-screen">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg max-w-md w-full text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>

        {/* Form content injected from Login/Signup */}
        {children}


        {/* Google button renders here */}
        <div id="googleLoginBtn" className="mt-6 w-full"></div>



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
