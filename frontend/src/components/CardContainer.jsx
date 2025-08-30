import React from "react";
import { motion } from "framer-motion";

function CardContainer() {
  const functionalities = [
    {
      title: "Chat with Documents",
      description:
        "No more manual scanning! Simply upload PDFs, Word files, or text documents, and our AI will let you chat with them directly. Ask natural questions like 'What are the key deadlines?' or 'Summarize this contract,' and get instant, reliable answers.",
      icon: "📄",
    },
    {
      title: "Smart Search",
      description:
        "Traditional search shows keywords, we deliver meaning. Our AI-powered semantic search understands context, so you don’t just find where a word appears—you find exactly the information you’re looking for, across multiple documents at once.",
      icon: "🔍",
    },
    {
      title: "Knowledge Extraction",
      description:
        "Turn cluttered text into clarity. Extract summaries, insights, key points, and action items instantly. Whether it’s a 200-page legal agreement or research papers, our AI distills the essence, saving you time and boosting productivity.",
      icon: "✨",
    },
    {
      title: "Collaboration",
      description:
        "Work smarter together. Securely share documents, AI-driven summaries, and insights with your team. Real-time collaboration ensures everyone stays aligned—perfect for legal teams, startups, or enterprises handling critical documents.",
      icon: "🤝",
    },
  ];

  return (
    <section className="w-full py-20 bg-gradient-to-r from-[#03070e] to-[#050448] px-4">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-white text-center mb-16 tracking-wide"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Our Functionalities
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {functionalities.map((item, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-[#1a1f3c]/80 to-[#0a0e2e]/80 
                         backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center 
                         text-center shadow-lg border border-white/10 
                         hover:scale-105 transition-transform duration-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {item.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CardContainer;
