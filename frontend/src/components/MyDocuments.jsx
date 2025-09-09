import React, { useState, useEffect } from 'react';
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
  File,
  Eye,
  Calendar,
  FolderOpen,
  Upload,
  MoreVertical,
  MessageSquare,
  FileBarChart,
} from 'lucide-react';
import axios from 'axios';
import { DOCS_API_ENDPOINT } from "../../utils/constants";

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
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg">
        <Upload className="w-5 h-5 mr-3" />
        Upload Your First Document
      </Button>
    </motion.div>
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
const DocumentCard = ({ document, index, onPreview, onChat, onSummary }) => {
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
            {/* PDF Icon instead of small type icon */}
            <img
              src="/pdf-icon.png" // <-- place your red PDF icon in public/ folder
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


  const navigate = useNavigate();


  // Fetch documents from backend
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        console.log("all-doc");
        const response = await axios.get(`${DOCS_API_ENDPOINT}/get-all-docs`, {
          withCredentials: true
        });
        console.log("response :", response);
        if (response.status == 200) {
          setDocuments(response.data.result || []);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Preview handler
  const handlePreview = async (documentId) => {
    try {
      console.log("preview");
      const response = await axios.get(`${DOCS_API_ENDPOINT}/${documentId}/preview`, {
        withCredentials: true
      });
      console.log("preview response : ", response);
      if (response.status !== 200) throw new Error("Failed to get preview link");

      if (response.data.url) {
        window.open(response.data.url, "_blank");
      } else {
        alert("Preview link not found");
      }
    } catch (err) {
      console.error("Error previewing document:", err);
      alert("Failed to preview document.");
    }
  };

 // Chat handler
  const handleChat = (documentId) => {
    navigate("/ChatBot", {
    state: { docId: documentId }, // ✅ pass docId to ChatBot page
  });
  };


  const handleSummary = (documentId) => {
    navigate("/Summary", {
      state: { docId: documentId }, // ✅ pass docId to Summary page
    });
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
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-bold text-center text-gray-800 mb-4">
            My Documents
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full"></div>
          <p className="text-center text-gray-600 mt-4 text-lg">
            Organize, preview, and interact with your files
          </p>
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
            ) : documents.length === 0 ? (
              <EmptyState />
            ) : (
              documents.map((document, index) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  index={index}
                  onPreview={handlePreview}
                  onChat={handleChat}
                  onSummary={handleSummary}
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
