import React from "react";
import Navbar from "./components/Header/Navbar";
import Footer from "./components/Footer/Footer";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-[#141414] to-[#050448]">
      <Navbar />
      <main className="flex-1">
        <Outlet /> {/* This is where Login, Signup, Home etc. will render */}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;

