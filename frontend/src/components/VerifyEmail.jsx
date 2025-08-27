// src/components/VerifyEmail.jsx
import { useState } from "react";
import { Mail } from "lucide-react"; 
import { motion } from "framer-motion";

function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    // here you would call your API for sending verification email
    setSent(true);
  };

  return (
    <section className="w-full flex justify-center items-center px-6 py-12 min-h-screen bg-gradient-to-r from-[#03070e] to-[#050448]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-[90%] max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center border border-white/20"
      >
        <div className="flex justify-center mb-4">
          <Mail className="w-12 h-12 text-blue-400" />
        </div>

        <h2 className="text-2xl font-semibold text-white mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-300 text-sm mb-6">
          Enter your email address and we’ll send you a verification link.
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-medium shadow-md"
            >
              Send Verification Link
            </button>
          </form>
        ) : (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-green-400 font-medium"
          >
            ✅ Verification link sent! Check your inbox.
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

export default VerifyEmail;
