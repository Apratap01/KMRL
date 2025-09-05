import React, { useState, useRef } from 'react';
import { Upload, Sparkles, MessageCircle, FileText, Bot, Eye, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {  useDispatch , useSelector } from 'react-redux'; 
import { toast } from "sonner";
import { DOCS_API_ENDPOINT } from "../../utils/constants.js";
import {setRecentDoc} from "../redux/authSlice.js"

const LegalDocDashboard = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const [file_id, setFile_id] = useState(null);

  // get user from Redux store
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch()

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("docs", file);

    try {
      setUploading(true);
      setMessage("");

      const res = await axios.post(
        `${DOCS_API_ENDPOINT}/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(res);
      const uploadedDoc = res?.data?.doc;
      setFile_id(uploadedDoc.id);
      dispatch(setRecentDoc(uploadedDoc.id));
      setMessage("✅ File uploaded successfully!");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#03070e] to-[#050448] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Decorative Illustrations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 text-6xl">⚖️</div>
        <div className="absolute bottom-10 left-10 text-4xl">📋</div>
        <div className="absolute top-1/3 left-20 text-3xl">📄</div>
        <div className="absolute bottom-1/3 right-32 text-5xl">🏛️</div>
      </div>

      {/* Content with gap from navbar */}
      <div className="relative z-10 container mx-auto px-6 py-16 mt-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Manage Your Legal
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Documents Smarter
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Upload, summarize, and chat with your documents in one place. <br />
            Transform the way you handle legal documentation.
          </p>

          <div className="flex items-center justify-center gap-2 text-cyan-400 mt-6">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">Powered by Advanced AI</span>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Upload Document */}
        <div className="max-w-7xl mx-auto mb-12">
          <div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 
              hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] 
              hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer"
            onClick={() => fileInputRef.current.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              name="docs"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex items-center gap-6 mb-6">
              <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/25">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Upload Document</h3>
            </div>

            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20"
                  : "border-slate-600 hover:border-cyan-500 hover:bg-cyan-500/5"
              }`}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-white font-semibold">
                  {uploading ? "Uploading..." : "Drop your files here or click to browse"}
                </p>
                <p className="text-slate-400 text-sm">PDF, DOC, DOCX up to 50MB</p>
                {message && <p className="text-sm text-cyan-300">{message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Chat with Document */}
          <Link to="/chatbot">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 
              hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] 
              hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer h-full flex flex-col">
              <div className="flex items-center gap-6 mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/25">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Chat with Document</h3>
              </div>
              <div className="bg-black/20 rounded-2xl p-6 space-y-4 flex-1">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-purple-500/20 rounded-2xl rounded-tl-sm p-4 max-w-xs">
                    <p className="text-white text-sm">
                      Hi! I've analyzed your contract. What would you like to know?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Summarize Document */}
          <Link to="/summary">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 
              hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] 
              hover:shadow-2xl hover:shadow-teal-500/10 cursor-pointer h-full flex flex-col">
              <div className="flex items-center gap-6 mb-6">
                <div className="p-4 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg shadow-teal-500/25">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Summarize Document</h3>
              </div>
              <div className="bg-black/20 rounded-2xl p-6 space-y-3 flex-1">
                <p className="text-slate-300 text-sm">
                  <span className="text-white font-semibold">Contract Duration:</span> 24 months with automatic renewal clause
                </p>
                <p className="text-slate-300 text-sm">
                  <span className="text-white font-semibold">Payment Terms:</span> Net 30 days, 2% early payment discount
                </p>
                <p className="text-slate-300 text-sm">
                  <span className="text-yellow-400 font-semibold">Action Required:</span> Signature deadline in 5 days
                </p>
              </div>
            </div>
          </Link>

          {/* View All Documents */}
          <Link to= "/documents">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 
              hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] 
              hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer h-full flex flex-col">
              <div className="flex items-center gap-6 mb-6">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-2xl shadow-lg shadow-indigo-500/25">
                  <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">View All Documents</h3>
              </div>
              <div className="bg-black/20 rounded-2xl p-6 flex-1">
                <p className="text-slate-300 text-sm">
                  Browse, filter, and manage all your uploaded legal documents in one place.
                </p>
                <div className="mt-4 flex items-center gap-2 text-indigo-400 font-medium">
                  <Eye className="w-4 h-4" />
                  <span>Go to Documents</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LegalDocDashboard;
