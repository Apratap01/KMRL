import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DocumentCardSkeleton from "./DocumentCardSkeleton";
import EmptyState from "./EmptyState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Calendar,
  FolderOpen,
  MoreVertical,
  MessageSquare,
  FileBarChart,
  ChevronDown,
  Filter,
  Trash,
} from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";

/* ... keep DocumentCardSkeleton, EmptyState, formatDate unchanged ... */
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
// ✅ Modified DocumentCard: disable delete for received docs
const DocumentCard = ({ document, index, onPreview, onChat, onSummary, onDelete, isReceived }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
    >
      <Card className="aspect-square bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-3 space-y-0">
          <div className="flex items-center justify-between">
            <img src="/pdf-icon.png" alt="PDF" className="w-12 h-12" />

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

                {!isReceived && ( // ✅ hide delete if received
                  <DropdownMenuItem
                    onClick={() => onDelete(document.id)}
                    className="cursor-pointer hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash className="w-4 h-4 mr-2 text-red-500" />
                    Delete
                  </DropdownMenuItem>
                )}
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
          <div className="text-xs text-gray-400">
            Click the menu above for actions
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const MyDocuments = () => {
  const [uploadedDocs, setUploadedDocs] = useState([]); // ✅
  const [receivedDocs, setReceivedDocs] = useState([]); // ✅
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("latest");
  const {user} = useSelector(state => state.auth)
  console.log(user);
  const navigate = useNavigate();

  const sortOptions = {
    latest: "Latest First",
    oldest: "Oldest First",
    riskier: "More Riskier First",
  };

  // Format a date string to "DD MMM YYYY" (example: 20 Sep 2025)

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        // ✅ Parallel API calls
        // const [uploadedRes, receivedRes] = await Promise.all([
        //   axios.get(`${import.meta.env.VITE_DOCS_API_ENDPOINT}/get-all-docs`, {
        //     withCredentials: true,
        //   }),
        //   axios.get(`${import.meta.env.VITE_DOCS_API_ENDPOINT}/get-dept-docs`, {
        //     withCredentials: true,
        //   }),
        // ]);
        console.log("1");
        const uploadedRes  = await axios.get(`${import.meta.env.VITE_DOCS_API_ENDPOINT}/get-all-docs`, {
            withCredentials: true,
          })
        
        const receivedRes  = await axios.get(`${import.meta.env.VITE_DOCS_API_ENDPOINT}/get-dept-docs`, {
            withCredentials: true,
          })

        
        if (uploadedRes.status === 200) {
          setUploadedDocs(
            (uploadedRes.data.result || []).map((doc) => ({
              ...doc,
              risk_score: doc.risk_factor ?? Math.floor(Math.random() * 100),
            }))
          );
        }

        if (receivedRes.status === 200) {
          setReceivedDocs(
            (receivedRes.data.result || []).map((doc) => ({
              ...doc,
              risk_score: doc.risk_factor ?? Math.floor(Math.random() * 100),
            }))
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  // ✅ Sorting function (reused for both lists)
  const sortDocuments = (docs) => {
    switch (sortOption) {
      case "oldest":
        return [...docs].sort(
          (a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at)
        );
      case "riskier":
        return [...docs].sort((a, b) => b.risk_score - a.risk_score);
      case "latest":
      default:
        return [...docs].sort(
          (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
    }
  };

  const handlePreview = async (documentId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_DOCS_API_ENDPOINT}/${documentId}/preview`,
        { withCredentials: true }
      );
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
    navigate("/Summary", { state: { docId: documentId, department: user.department || user?.data?.department } });
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_DOCS_API_ENDPOINT}/${documentId}/delete`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        setUploadedDocs((prev) => prev.filter((doc) => doc.id !== documentId));
      }
    } catch {
      alert("Error deleting document");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50 py-20">
      {/* Header ... keep as is ... */}

      <div className="container mx-auto px-6 pb-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 shadow-lg">
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        )}

        {/* ✅ Uploaded Docs Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Uploaded Documents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-12">
          <AnimatePresence mode="wait">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <DocumentCardSkeleton key={index} index={index} />
              ))
            ) : sortDocuments(uploadedDocs).length === 0 ? (
              <EmptyState />
            ) : (
              sortDocuments(uploadedDocs).map((document, index) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  index={index}
                  onPreview={handlePreview}
                  onChat={handleChat}
                  onSummary={handleSummary}
                  onDelete={handleDelete}
                  isReceived={false} // ✅
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ✅ Received Docs Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Received Documents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          <AnimatePresence mode="wait">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <DocumentCardSkeleton key={index} index={index} />
              ))
            ) : sortDocuments(receivedDocs).length === 0 ? (
              <EmptyState />
            ) : (
              sortDocuments(receivedDocs).map((document, index) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  index={index}
                  onPreview={handlePreview}
                  onChat={handleChat}
                  onSummary={handleSummary}
                  isReceived={true} // ✅
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
