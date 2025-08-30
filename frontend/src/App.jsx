import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Header/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Card from "./components/Card.jsx";
import CardContainer from "./components/CardContainer.jsx";
import Footer from "./components/Footer/Footer.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import getUser from "../utils/getUser"
import { setUser } from "./redux/authSlice";
function App() {
  
  return (
    <>
    <Navbar/>
    <Signup/>
    <Footer/>
    </>
  );
}

export default App;
