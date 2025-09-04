import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Languages,
  XCircle,
  Calendar,
  File,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Tag
} from "lucide-react";

import { SUMMARY_API_ENDPOINT , DOCS_API_ENDPOINT} from "../../utils/constants.js";


/* ========= HELPERS ========= */
const gradients = [
  "from-indigo-500 to-purple-500",
  "from-blue-500 to-cyan-500",
  "from-rose-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
];
const pickGradient = (seed) => gradients[seed % gradients.length];

const mapMimeToType = (mime) => {
  if (!mime) return "FILE";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("word") || mime.includes("doc")) return "DOCX";
  if (mime.includes("image")) return "IMAGE";
  if (mime.includes("ppt")) return "PPT";
  if (mime.includes("excel") || mime.includes("sheet")) return "XLSX";
  return mime.toUpperCase();
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

/* ========= LANGUAGES ========= */
const languages = [
  { code: "English", name: "English", flag: "🇬🇧" },
  { code: "Hindi", name: "Hindi", flag: "🇮🇳" },
  { code: "Kannada", name: "Kannada", flag: "🇮🇳" },
  { code: "Bengali", name: "Bengali", flag: "🇮🇳" },
  { code: "Telugu", name: "Telugu", flag: "🇮🇳" },
  { code: "Malayalam", name: "Malayalam", flag: "🇮🇳" },
  { code: "Tamil", name: "Tamil", flag: "🇮🇳" },
];

/* ========= COMPONENT ========= */
const Summary = () => {
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState(null);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [summaryData, setSummaryData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileDocsList, setShowMobileDocsList] = useState(false);
  const [expandedSections, setExpandedSections] = useState(Array(7).fill(true));

  const toggleSection = (index) => {
    setExpandedSections((prev) =>
      prev.map((v, i) => (i === index ? !v : v))
    );
  };

  const getUrgencyColor = (level) => {
  switch (level?.toLowerCase()) {
    case "high": return "bg-red-600";
    case "medium": return "bg-yellow-500";
    default: return "bg-green-500";
  }
};

  /* ====== Load Docs on Mount ====== */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const loadDocs = async () => {
      setDocsLoading(true);
      setDocsError(null);
      try {
        const { data } = await axios.get(`${DOCS_API_ENDPOINT}/get-all-docs`, {
        withCredentials: true,
      });

        const list = (data?.result || []).map((d, idx) => ({
          id: d.id,
          title: d.title,
          type: mapMimeToType(d.file_type),
          date: formatDate(d.uploaded_at),
          avatar: (d.title?.[0] || "D").toUpperCase(),
          gradient: pickGradient(d.id ?? idx),
          raw: d,
        }));
        setDocs(list);
      } catch (e) {
        setDocsError(
          e?.response?.data?.message ||
            e?.message ||
            "Failed to load documents. Please login again."
        );
      } finally {
        setDocsLoading(false);
      }
    };
    loadDocs();
  }, []);

  /* ====== API: Get Summary ====== */
const fetchSummary = async (docId, languageCode) => {
  const { data } = await axios.post(`${SUMMARY_API_ENDPOINT}/${docId}`, {
    language: languageCode,
  }, {
    withCredentials: true,
  });
  return data;
};


  const handleDocumentSelect = async (doc) => {
    setSelectedDoc(doc);
    setError(null);
    setIsLoading(true);
    setShowMobileDocsList(false);
    try {
      const summary = await fetchSummary(doc.id, selectedLanguage.code);
      setSummaryData(summary);
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          "Failed to load summary. Please try again."
      );
      setSummaryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (lang) => {
    setSelectedLanguage(lang);
    setShowLanguageDropdown(false);
    if (selectedDoc) {
      setIsLoading(true);
      setError(null);
      try {
        const summary = await fetchSummary(selectedDoc.id, lang.code);
        setSummaryData(summary);
      } catch (e) {
        setError(
          e?.response?.data?.error ||
            e?.message ||
            "Failed to load summary for the selected language."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  /* ====== UI Pieces ====== */
  const DocumentsList = ({ className = "" }) => (
    <div
      className={`bg-gradient-to-r from-pink-100 via-pink-50 to-blue-100 backdrop-blur-xl rounded-2xl border border-gray-200/20 shadow-lg ${className} flex flex-col`}
    >
      <div className="p-6 pb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800">Your Documents</h2>
        <p className="text-sm text-gray-600">
          Select a document to view its summary
        </p>
      </div>
      <div className="flex-1 min-h-0 px-6 pb-6">
        {docsLoading ? (
          <div className="space-y-2 h-full overflow-y-auto pr-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 rounded-xl bg-white/60" />
            ))}
          </div>
        ) : docsError ? (
          <div className="text-center py-8">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-700">{docsError}</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No documents uploaded yet
            </p>
          </div>
        ) : (
          <div className="space-y-2 h-full overflow-y-auto pr-2  scrollbar-hide">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className={`p-4 rounded-xl cursor-pointer transition-all transition-colors duration-300 flex-shrink-0 border-2 ${
                  selectedDoc?.id === doc.id
                    ? "bg-gradient-to-r from-purple-100 to-indigo-100 border-indigo-400/50"
                    : "bg-gradient-to-r from-white to-indigo-50 border-transparent hover:from-indigo-50 hover:to-purple-50"
                } ${showLanguageDropdown ? "ring-1 ring-blue-400 shadow-md" : ""}`}
                onClick={() => handleDocumentSelect(doc)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${doc.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                  >
                    {doc.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-700">
                      <File className="w-3 h-3" />
                      <span>{doc.type}</span>
                      <span>•</span>
                      <Calendar className="w-3 h-3" />
                      <span>{doc.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const SummaryViewer = () => (
    <div className="h-full flex flex-col">
      <div className="h-full overflow-y-auto bg-gradient-to-r from-pink-100 via-pink-50 to-blue-100 rounded-xl border border-gray-200/40 shadow-md scrollbar-hide">
        <div className="p-6 flex flex-col">
          {selectedDoc ? (
            <>
              {/* HEADER */}
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
                      {selectedDoc.title}
                    </h1>
                    <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
                      {/* First Row: File Type + Upload Date */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <File className="w-4 h-4" />
                          <span>{selectedDoc.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Uploaded {selectedDoc.date}</span>
                        </div>
                      </div>

                      {/* Second Row: Category */}
                      {summaryData?.category && (
                        <div className="flex items-center gap-1 text-gray-600 font-medium text-sm">
                          <Tag className="w-4 h-4" />
                          <span>{summaryData.category}</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* LANGUAGE DROPDOWN */}
                  <div className="relative">
                    <button
                      className="flex items-center gap-2 px-4  py-2 shadow-lg hover:bg-gray-100 transition bg-white/20 hover:bg-white/30 rounded-lg transition-colors border border-gray-200/20"
                      onClick={() =>
                        setShowLanguageDropdown(!showLanguageDropdown)
                      }
                    >
                      <Languages className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {selectedLanguage.flag} {selectedLanguage.name}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {showLanguageDropdown && (
                      <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[170px] z-10">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            className={`w-full px-4 py-2 text-left flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 ${
                              selectedLanguage.code === lang.code ? "bg-gray-100 font-semibold" : ""
                            }`}
                            onClick={() => handleLanguageChange(lang)}
                          >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT */}
              <div className="flex-1 space-y-6">
                {error ? (
                  <div className="text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-700 dark:text-red-400 mb-4">
                      {error}
                    </p>
                    <button
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      onClick={() => handleDocumentSelect(selectedDoc)}
                    >
                      Try Again
                    </button>
                  </div>
                ) : isLoading || !summaryData ? (
                  <div className="space-y-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div
                          className={`h-4 bg-gray-300/50 dark:bg-gray-600/50 rounded ${
                            i === 3 || i === 7 ? "w-3/4" : "w-full"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full space-y-6 -mt-4">
                    {/* 1. Document Summary */}
                    <Card className="shadow-md border border-gray-200 bg-white hover:shadow-lg transition w-full">
                      <CardContent className="p-0">
                        <div
                          className="flex items-center justify-between cursor-pointer p-4"
                          onClick={() => toggleSection(0)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedSections[0] ? (
                              <ChevronDown className="h-5 w-5 text-blue-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-blue-600" />
                            )}
                            <h2 className="text-lg font-semibold text-gray-900">
                              Document Summary
                            </h2>
                          </div>
                        </div>
                        {expandedSections[0] && (
                          <div className="border-t border-gray-200">
                            <div className="p-6 text-gray-700 leading-relaxed">
                              {summaryData.description}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* 2. Key Information */}
                    <Card className="shadow-md border border-gray-200 bg-white hover:shadow-lg transition w-full">
                      <CardContent className="p-0">
                        <div
                          className="flex items-center justify-between cursor-pointer p-4"
                          onClick={() => toggleSection(1)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedSections[1] ? (
                              <ChevronDown className="h-5 w-5 text-green-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-green-600" />
                            )}
                            <h2 className="text-lg font-semibold text-gray-900">
                              Key Information
                            </h2>
                          </div>
                        </div>
                        {expandedSections[1] && (
                          <div className="border-t border-gray-200">
                            <ul className="p-6 space-y-2 text-gray-700">
                              {summaryData.important_timeline?.map((info, i) => (
                                <li key={i}>• {info}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* 3. Risks (with Category & Urgency) */}
                    <Card className="shadow-md border border-gray-200 bg-white hover:shadow-lg transition w-full">
                      <CardContent className="p-0">
                        <div
                          className="flex items-center justify-between cursor-pointer p-4"
                          onClick={() => toggleSection(2)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedSections[2] ? (
                              <ChevronDown className="h-5 w-5 text-red-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-red-600" />
                            )}
                            <h2 className="text-lg font-semibold text-gray-900">
                              Risks & Document Info
                            </h2>
                          </div>
                        </div>
                        {expandedSections[2] && (
                          <div className="border-t border-gray-200 p-6 space-y-4 text-gray-700">
                            {/* Risks */}
                            <ul className="space-y-2">
                              {summaryData.risk_factors?.map((risk, i) => (
                                <li key={i}>⚠️ {risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    {/* Urgency Card*/ }
                    <Card className="mb-6 shadow-md border border-gray-200 bg-white hover:shadow-lg transition">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between cursor-pointer p-4" onClick={() => toggleSection(3)}>
                          <div className="flex items-center gap-3">
                            {expandedSections[3] ? <ChevronDown className="h-5 w-5 text-blue-600"/> : <ChevronRight className="h-5 w-5 text-blue-600"/>}
                            <h2 className="text-lg font-semibold text-gray-900">Urgency of Risk ⚠</h2>
                          </div>
                        </div>
                        {expandedSections[3] && (
                          <div className="border-t border-gray-200">
                            <div className="p-6">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="text-2xl font-bold text-red-600">{summaryData.urgency_percentage}%</div>
                                <div className="flex-1">
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full ${getUrgencyColor(summaryData.urgency_level)}`}
                                        style={{ width: `${summaryData.urgency_percentage}%` }}
                                      ></div>
            
                                  </div>
                                </div>
                                <span className="text-red-600 font-semibold">{summaryData.urgency_level} Priority</span>
                              </div>
                              
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    {/* 4. Next Steps */}
                    <Card className="shadow-md border border-gray-200 bg-white hover:shadow-lg transition w-full">
                      <CardContent className="p-0">
                        <div
                          className="flex items-center justify-between cursor-pointer p-4"
                          onClick={() => toggleSection(4)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedSections[4] ? (
                              <ChevronDown className="h-5 w-5 text-purple-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-purple-600" />
                            )}
                            <h2 className="text-lg font-semibold text-gray-900">
                              Next Steps
                            </h2>
                          </div>
                        </div>
                        {expandedSections[4] && (
                          <div className="border-t border-gray-200">
                            <ul className="p-6 space-y-2 text-gray-700">
                              {summaryData.next_steps?.map((step, i) => (
                                <li key={i}>➡️ {step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* 5. Recommendations */}
                    <Card className="shadow-md border border-gray-200 bg-white hover:shadow-lg transition w-full">
                      <CardContent className="p-0">
                        <div
                          className="flex items-center justify-between cursor-pointer p-4"
                          onClick={() => toggleSection(5)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedSections[5] ? (
                              <ChevronDown className="h-5 w-5 text-indigo-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-indigo-600" />
                            )}
                            <h2 className="text-lg font-semibold text-gray-900">
                              Recommendations
                            </h2>
                          </div>
                        </div>
                        {expandedSections[5] && (
                          <div className="border-t border-gray-200">
                            <ul className="p-6 space-y-2 text-gray-700">
                              {summaryData.main_takeaway?.map((rec, i) => (
                                <li key={i}>✅ {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[550px] overflow-hidden">
              <div className="text-center space-y-6">
                <FileText className="w-24 h-24 text-gray-400 mx-auto" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Select a Document
                </h2>
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  <span className="hidden sm:inline">
                    Choose a document from the left panel to view its summary
                  </span>
                  <span className="inline sm:hidden">
                    Choose a document from the top bar to view its summary
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#03070e] to-[#050448] dark:from-gray-900 mt-20 dark:via-gray-800 dark:to-indigo-900">
      {isMobile ? (
        <div className="p-4 space-y-4">
          {/* Mobile Documents Selector */}
          <div className="relative">
            <button
              className="w-full p-4 bg-gradient-to-r from-pink-100 via-pink-50 to-blue-100 rounded-xl border border-gray-200/30 shadow-sm flex items-center justify-between hover:shadow-md transition"
              onClick={() => setShowMobileDocsList(!showMobileDocsList)}
            >
              <div className="flex items-center gap-3">
                {selectedDoc ? (
                  <>
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-r ${selectedDoc.gradient} flex items-center justify-center text-white font-bold`}
                    >
                      {selectedDoc.avatar}
                    </div>
                    <span className="font-medium text-gray-800">{selectedDoc.title}</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-6 h-6 text-gray-600" />
                    <span className="font-medium text-gray-600">Select a document</span>
                  </>
                )}
              </div>
              <ChevronDown className="w-5 h-5 text-gray-600" />
            </button>

            {showMobileDocsList && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg z-10 max-h-80 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                      onClick={() => handleDocumentSelect(doc)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r ${doc.gradient} flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {doc.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{doc.title}</p>
                          <p className="text-xs text-gray-600">{doc.type} • {doc.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {docs.length === 0 && (
                    <p className="text-sm text-gray-600 text-center py-2">
                      No documents
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>


          {/* Mobile Summary Viewer */}
          <div className="flex-1">
            <SummaryViewer />
          </div>
        </div>
      ) : (
        <div className="flex h-screen p-6 gap-6">
          <div className="w-1/4 min-w-[320px]">
            <DocumentsList className="h-full" />
          </div>
          <div className="flex-1">
            <SummaryViewer />
          </div>
        </div>
      )}

      {(showLanguageDropdown || showMobileDocsList) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowLanguageDropdown(false);
            setShowMobileDocsList(false);
          }}
        />
      )}
    </div>
  );
};

export default Summary;
