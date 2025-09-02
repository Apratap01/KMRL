import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import store from "./redux/store";
import {Provider} from "react-redux";
import "./index.css"; // Tailwind/global styles
import { Toaster } from "sonner";
import VerifyEmail from "./components/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import { USER_API_ENDPOINT } from "../utils/constants";
import AppInitializer from "./AppInitializer";
import LegalDocDashboard from "./components/LegalDocDashboard";
import MyDocuments from "./components/MyDocuments";



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
        path: "signup",
        element: <Signup/>,
      },
      {
        path:"resend-verification",
        element:<VerifyEmail/>
      },
      {
        path:"LegalDocDashboard",
        element:<ProtectedRoute><LegalDocDashboard/></ProtectedRoute>
      },
      {
        path:"documents",
        element:<ProtectedRoute><MyDocuments/></ProtectedRoute>
      }
      
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store = {store}>
      <AppInitializer>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
      </AppInitializer>
    </Provider>
  </React.StrictMode>
);