import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Calendar,
  FolderOpen,
  Upload,
  MoreVertical,
  MessageSquare,
  FileBarChart,
  ChevronDown,
  Filter,
  Trash,
} from 'lucide-react';
import axios from 'axios';

// Loading skeleton
const DocumentCardSkeleton = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
  >
    <Card className="aspect-square animate-pulse bg-white shadow-lg">
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-5 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded mt-3"></div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </CardContent>
    </Card>
  </motion.div>
);

// Empty state
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
    className="col-span-full flex flex-col items-center justify-center py-20"
  >
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center mb-8 shadow-lg"
    >
      <FolderOpen className="w-16 h-16 text-gray-400" />
    </motion.div>
    <h3 className="text-2xl font-bold text-gray-800 mb-3">No documents uploaded yet</h3>
    <p className="text-gray-500 text-center max-w-md mb-8 text-lg">
      Start building your document library! Upload files and manage them all in one place.
    </p>
  </motion.div>
);

// Date formatter
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Document card
const DocumentCard = ({ document, index, onPreview, onChat, onSummary, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
    >
      <Card className="aspect-square bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-3 space-y-0">
          <div className="flex items-center justify-between">
            {/* PDF Icon */}
            <img
              src="/pdf-icon.png"
              alt="PDF"
              className="w-12 h-12"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl bg-white/95 backdrop-blur-md text-gray-800 shadow-xl border border-gray-200"
              >
                <DropdownMenuItem
                  onClick={() => onPreview(document.id)}
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-600"
                >
                  <Eye className="w-4 h-4 mr-2 text-blue-500" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onChat(document.id)}
                  className="cursor-pointer hover:bg-green-100 hover:text-green-600"
                >
                  <MessageSquare className="w-4 h-4 mr-2 text-green-500" />
                  Chat
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSummary(document.id)}
                  className="cursor-pointer hover:bg-purple-100 hover:text-purple-600"
                >
                  <FileBarChart className="w-4 h-4 mr-2 text-purple-500" />
                  Summary
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(document.id)}
                  className="cursor-pointer hover:bg-red-100 hover:text-red-600"
                >
                  <Trash className="w-4 h-4 mr-2 text-red-500" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="text-lg font-bold text-gray-800 leading-tight line-clamp-2 mt-3">
            {document.title}
          </h3>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(document.uploaded_at)}</span>
          </div>
          <div className="text-xs text-gray-400">Click the menu above for actions</div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main component
const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("latest"); // ✅ filter state

  const navigate = useNavigate();

  // Sort options mapping
  const sortOptions = {
    latest: "Latest First",
    oldest: "Oldest First",
    riskier: "More Riskier First"
  };

  // Fetch documents from backend
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_DOCS_API_ENDPOINT}/get-all-docs`, {
          withCredentials: true
        });
        if (response.status === 200) {
          const docsWithRisk = (response.data.result || []).map(doc => ({
            ...doc,
            risk_score: doc.risk_factor ?? Math.floor(Math.random() * 100), // fallback if not provided
          }));
          console.log(docsWithRisk)
          setDocuments(docsWithRisk);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // ✅ Sorting logic
  const sortedDocuments = useMemo(() => {
    switch (sortOption) {
      case "oldest":
        return [...documents].sort(
          (a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at)
        );
      case "riskier":
        return [...documents].sort(
          (a,b) => a.risk_score - b.risk_score
        )
      case "latest":
      default:
        return [...documents].sort(
          (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
    }
  }, [documents, sortOption]);

  // Handlers
  const handlePreview = async (documentId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_DOCS_API_ENDPOINT}/${documentId}/preview`, {
        withCredentials: true
      });
      if (response.status !== 200) throw new Error("Failed to get preview link");

      if (response.data.url) {
        window.open(response.data.url, "_blank");
      } else {
        alert("Preview link not found");
      }
    } catch {
      alert("Failed to preview document.");
    }
  };

  const handleChat = (documentId) => {
    navigate("/chatbot", { state: { docId: documentId } });
  };

  const handleSummary = (documentId) => {
    navigate("/Summary", { state: { docId: documentId } });
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      console.log("12")
      const response = await axios.post(`${import.meta.env.VITE_DOCS_API_ENDPOINT}/${documentId}/delete`,{} , {
        withCredentials: true
      });
      console.log(response)
      if (response.status === 200) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } else {
        alert("Failed to delete document");
      }
    } catch {
      alert("Error deleting document");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-12 pb-8"
      >
        <div className="container mx-auto px-6 flex flex-col items-center">
          <h1 className="text-5xl font-bold text-center text-gray-800 mb-4">
            My Documents
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full"></div>
          <p className="text-center text-gray-600 mt-4 text-lg">
            Organize, preview, and interact with your files
          </p>

          {/* ✅ Improved Sorting dropdown */}
          <div className="mt-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 hover:bg-white text-gray-700 hover:text-blue-600 font-medium"
                >
                  <Filter className="w-4 h-4 text-blue-500" />
                  <span className="min-w-[120px] text-left">{sortOptions[sortOption]}</span>
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 rounded-xl bg-white/95 backdrop-blur-md shadow-xl border-2 border-gray-100 p-2"
              >
                <DropdownMenuItem 
                  onClick={() => setSortOption("latest")}
                  className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${
                    sortOption === "latest" 
                      ? "bg-blue-100 text-blue-700 font-medium" 
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Latest First
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOption("oldest")}
                  className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${
                    sortOption === "oldest" 
                      ? "bg-blue-100 text-blue-700 font-medium" 
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOption("riskier")}
                  className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${
                    sortOption === "riskier" 
                      ? "bg-blue-100 text-blue-700 font-medium" 
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  More Riskier First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="container mx-auto px-6 pb-12">
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 shadow-lg"
          >
            <p className="text-red-800 font-medium">Error: {error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          <AnimatePresence mode="wait">
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <DocumentCardSkeleton key={index} index={index} />
              ))
            ) : sortedDocuments.length === 0 ? (
              <EmptyState />
            ) : (
              sortedDocuments.map((document, index) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  index={index}
                  onPreview={handlePreview}
                  onChat={handleChat}
                  onSummary={handleSummary}
                  onDelete={handleDelete}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;
