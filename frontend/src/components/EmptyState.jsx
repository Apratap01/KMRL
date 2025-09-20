import React from "react";

const EmptyState = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
      <svg
        className="w-16 h-16 mb-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17v-2h6v2m-7 4h8a2 2 0 002-2v-6a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h2z"
        />
      </svg>
      <p className="text-lg font-medium">{message || "No documents found"}</p>
    </div>
  );
};

export default EmptyState;
