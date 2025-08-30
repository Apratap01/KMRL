import { motion } from "framer-motion";
import { FaCloudUploadAlt, FaRobot, FaComments, FaBell } from "react-icons/fa";

export default function HowItWorks() {
  const steps = [
    {
      icon: <FaCloudUploadAlt size={40} className="text-blue-400" />,
      title: "1. Upload Your Documents",
      description:
        "Easily upload contracts, agreements, or notices in PDF or DOCX format. All your documents are stored securely in one place with bank-grade encryption.",
    },
    {
      icon: <FaRobot size={40} className="text-green-400" />,
      title: "2. AI Summarizes Key Points",
      description:
        "Our AI quickly scans your documents, highlights the most important clauses, and generates concise summaries — saving you hours of manual reading.",
    },
    {
      icon: <FaComments size={40} className="text-pink-400" />,
      title: "3. Chat With Your Documents",
      description:
        "Ask natural questions like 'What is the payment deadline?' or 'Who are the parties involved?' — get instant, accurate answers directly from your documents.",
    },
    {
      icon: <FaBell size={40} className="text-yellow-400" />,
      title: "4. Get Smart Alerts",
      description:
        "Never miss deadlines again! Receive automatic reminders for renewals, due dates, and important obligations — delivered via dashboard notifications or email.",
    },
  ];

  return (
    <section className="w-full bg-gradient-to-r from-[#03070e] to-[#050448] py-[10%] px-6 flex flex-col items-center px-4">
      {/* Section Heading */}
      <motion.h2
        className="text-white text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-wider text-center mb-12"
        initial={{ opacity: 0, y: "20%" }}
        whileInView={{ opacity: 1, y: "0%" }}
        transition={{ duration: 0.6 }}
      >
        [ HOW IT WORKS ]
      </motion.h2>

      {/* Steps Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl">
        {steps.map((step, index) => (
          <motion.div
              key={index}
              className="bg-gradient-to-br from-[#1a1f3c]/80 to-[#0a0e2e]/80 
                          backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center 
                          text-center shadow-lg border border-white/10 
                          hover:scale-105 transition-transform duration-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
            <div className="mb-4">{step.icon}</div>
            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
            <p className="text-gray-300 text-sm">{step.description}</p>
            </motion.div>
        ))}
      </div>
    </section>
  );
}
