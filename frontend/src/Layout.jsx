import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Header/Navbar";
import Footer from "./components/Footer/Footer";

function Layout() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Normalize pathname to lower case to avoid mismatch
  const isChatbotPage = location.pathname.toLowerCase() === "/chatbot";

  // Hide footer only on chatbot page & mobile
  const hideFooter = isChatbotPage;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-[#03070e] to-[#050448]">
      <Navbar />
      <main className={`flex-1 ${hideFooter ? "pb-0" : "pb-16"}`}>
        {/* pb-16 ensures main content doesn't overlap footer when visible */}
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default Layout;