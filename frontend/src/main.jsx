import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Layout from "./Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import {Provider} from "react-redux";
import store from "./redux/store";

import "./index.css"; // Tailwind/global styles

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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store = {store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
