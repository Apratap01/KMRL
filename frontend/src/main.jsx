import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import store from "./redux/store";
import { Provider } from "react-redux";
import "./index.css"; // Tailwind/global styles
import { Toaster } from "sonner";
import VerifyEmail from "./components/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import AppInitializer from "./AppInitializer";
import LegalDocDashboard from "./components/LegalDocDashboard";
import MyDocuments from "./components/MyDocuments";
import Summary from "./pages/Summary";
import AILegalChatbot from "./pages/ChatBot";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProfileRoleSelection from "./pages/ProfileRoleSelection";



// Define routes
const router = createBrowserRouter([
  {
    path: "/", // root path
    element: <Layout />, // layout wraps all pages
    children: [
      {
        index: true, // default page at "/"
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />
      },{
        path: "reset-password",
        element: <ResetPassword />
      },
      {
        path: "reset-password/:token",   // 🔥 handles links from email
        element: <ResetPassword />
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "resend-verification",
        element: <VerifyEmail />
      },
      {
        path: "LegalDocDashboard",
        element: <ProtectedRoute><LegalDocDashboard /></ProtectedRoute>
      },
      {
        path: "documents",
        element: <ProtectedRoute><MyDocuments /></ProtectedRoute>
      },
      {
        path: "Summary",
        element: <ProtectedRoute><Summary /></ProtectedRoute>
      },
      {
        path: "Chatbot",
        element: <ProtectedRoute><AILegalChatbot /></ProtectedRoute>
      },
      {
        path:"Complete-Profile",
        element: <ProfileRoleSelection/>
      }

    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppInitializer>
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </AppInitializer>
    </Provider>
  </React.StrictMode>
);