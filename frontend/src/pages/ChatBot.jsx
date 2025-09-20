import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  ChevronDown, 
  Calendar, 
  Layers, 
  Folder, 
  Send,
  User,
  Bot
} from 'lucide-react';
import axios from 'axios';
import { useLocation} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { marked } from "marked";

// Convert markdown message into HTML string




const gradients = [
  "from-indigo-500 to-purple-500",
  "from-blue-500 to-cyan-500",
  "from-rose-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
];
const pickGradient = (seed) => gradients[seed % gradients.length];

const mapMimeToType = (mime) => {
  if (!mime) return "Unknown";
  if (mime.includes("pdf")) return "PDF Document";
  if (mime.includes("word")) return "Word Document";
  if (mime.includes("excel")) return "Excel Spreadsheet";
  if (mime.includes("text")) return "Text File";
  return "Other";
};

const AILegalChatbot = () => {

  const {SelectedDoc} = useSelector((state) => state.auth);
  const location = useLocation();
  const docId = location.state?.docId || SelectedDoc;

  const [documents, setDocuments] = useState([]); 
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [chunkId,setChunkId] = useState(null);
  const [isDocLoading, setIsDocLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_DOCS_API_ENDPOINT}/get-dept-docs`, {
          withCredentials: true,
        });

        const list = (data?.result || []).map((d, idx) => ({
          id: d.id,
          title: d.title,
          type: mapMimeToType(d.file_type),
          date: d.uploaded_at,
          avatar: (d.title?.[0] || "D").toUpperCase(),
          gradient: pickGradient(d.id ?? idx),
          raw: d,
        }));
        setDocuments(list);

        if (docId) {
        const match = list.find((doc) => doc.id === docId);
        if (match) {
          handleDocumentSelect(match);
        }
      }

      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    fetchDocuments();
  }, []);

  const getInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };
  
  const renderMessage =  (message) => {
  if (!message) return "";
  return marked.parse(message); // returns HTML string
}
  const handleDocumentSelect = async (document) => {
    setSelectedDocument(document);
    setIsDropdownOpen(false);
    setMessages([]);
    setIsDocLoading(true);

    try {
        const res = await axios.post(`${import.meta.env.VITE_CHAT_API_ENDPOINT}/chunk/${document.id}`);
        console.log("Chunk API response:", res.data);
        setChunkId(res.data.data); // conversationId
      } catch (error) {
        console.error("Error fetching conversation ID:", error);
      }
    finally {
      setIsDocLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedDocument) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_CHAT_API_ENDPOINT}/${chunkId}/${selectedDocument.id}`,
        { query: inputValue },
        { headers: { "Content-Type": "application/json" } }
      );

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: res.data.queryResult,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "Sorry, something went wrong while analyzing the document.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action) => {
    if (!selectedDocument) return;
    
    const actionText = action === 'explain'
      ? `Please explain the key terms in ${selectedDocument.title}`
      : `Please provide a comprehensive summary of ${selectedDocument.title}`;
    
    setInputValue(actionText);
    inputRef.current?.focus();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 pt-20">
      {/* Left Panel */}
      <div className="relative w-full lg:w-[30%] bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col overflow-visible scrollbar-hide">

        <div className={`p-4 sm:p-6 lg:p-8 flex-1 ${!selectedDocument ? 'overflow-visible' : 'overflow-y-auto'}`}>
          {/* Dropdown */}
          <div className="relative mb-6 ">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-4 flex items-center justify-between hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 ease-in-out shadow-lg"
            >
              <div className="flex items-center space-x-3">
                {selectedDocument ? (
                  <>
                    <div className={`w-10 h-10 bg-gradient-to-r ${selectedDocument.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                      {getInitial(selectedDocument.title)}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold truncate max-w-48">
                        {selectedDocument.title}
                      </div>
                      <div className="text-purple-100 text-sm">
                        {selectedDocument.type} • 5 pages
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Select a document</span>
                  </>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto scrollbar-hide">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleDocumentSelect(doc)}
                    className="w-full p-4 flex items-center space-x-3 hover:bg-gray-100 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-r ${doc.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                      {getInitial(doc.title)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900 truncate">
                        {doc.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {doc.type} • Added {formatDate(doc.date)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Document Details */}
          {selectedDocument && (
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Document Details</h3>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-sm">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">{selectedDocument.type}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Layers className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-medium text-gray-900">5</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Folder className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-900">{selectedDocument.type}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Added:</span>
                  <span className="font-medium text-gray-900">{formatDate(selectedDocument.date)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleQuickAction('explain')}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl py-3 px-4 font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 ease-in-out shadow-md"
                >
                  Explain Key Terms
                </button>
                <button
                  onClick={() => handleQuickAction('summarize')}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl py-3 px-4 font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 ease-in-out shadow-md"
                >
                  Summarize Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="w-full lg:w-[70%] flex flex-col bg-white relative z-0  ">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-hide">
          {!selectedDocument ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Ready to analyze your documents
                </h3>
                <p className="text-gray-500 max-w-md">
                  Please select a document from the left panel to get started with AI-powered legal analysis.
                </p>
              </div>
            </div>
          ) : isDocLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600">Preparing document analysis...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to help with {selectedDocument.title}
                  </h3>
                  <p className="text-gray-500">
                    Ask me anything about this document. I can explain terms, summarize content, or answer specific questions.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[85%] sm:max-w-[70%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600' 
                        : 'bg-gray-200'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className={`rounded-xl p-4 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                      <div
                          className="text-sm leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: renderMessage(message.content) }}
                        />

                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-[70%]">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 rounded-xl rounded-tl-sm p-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 bg-white p-4 sm:p-6 lg:p-8">
          <div className="relative">
            <input
              
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your legal document..."
              disabled={!selectedDocument || isLoading || !chunkId}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-6 pr-16 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !selectedDocument || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg p-3 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Press Enter to send • This AI provides general information and should not replace professional legal advice
          </p>
        </div>
      </div>
    </div>
  );
};

export default AILegalChatbot;
