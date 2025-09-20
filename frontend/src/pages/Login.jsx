import React, { useState } from "react";
import AuthCard from "../components/AuthCard.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../redux/authSlice.js";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${import.meta.env.VITE_USER_API_ENDPOINT}/login`, form,{
        withCredentials:true,
      }
      );
      // console.log(res);
      // console.log(res.status);
      // console.log(res.data);
      // console.log(typeof res.data.user.is_valid);
      
      console.log(res.data.user)
      const userId = res.data.user.id;
      if(!(res.data.user.is_valid)){
        navigate("/resend-verification")
        toast.message("Please Verify Your email");
      }
      else if(!(res.data.user.department)){
        navigate("/Complete-Profile",{ state: { userId: userId } });
        toast.message("First Define Your Role")
      }
      // Example navigation after login
      else if (res.status === 200) {
        toast.success("Login Successfull")
        dispatch(setUser(res.data.user))
        navigate("/"); 
      }
    } catch (error) {
       console.log(error)
      toast.error(error?.response?.data?.message || "Something went wrong")

    } finally {
      dispatch(setLoading(false));
    }
  };

  // Google Sign-In
    const handleGoogleResponse = async (response) => {
    try {
      dispatch(setLoading(true));
      const res = await axios.post(
        `${import.meta.env.VITE_USER_API_ENDPOINT}/google`,
        { token: response.credential },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success("Google Login Successfull");
        dispatch(setUser(res.data.user));
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Google login failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
  /* global google */
  const mount = () => {
    const container = document.getElementById("googleLoginBtn");
    if (!container) return;

    // Avoid duplicates if React StrictMode calls effects twice
    container.innerHTML = "";

    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });

    // Render an official white Google button (outline = white)
    google.accounts.id.renderButton(container, {
      theme: "outline",      // white button
      size: "large",
      shape: "pill",
      text: "signin_with",
      logo_alignment: "left",
      width: "100%",         // full width like your Login button
    });

    // Optional: don’t auto-show One Tap
    // google.accounts.id.prompt(() => {}); // keep disabled to only use the button
  };

  if (window.google) {
    mount();
  } else {
    // If the GIS script hasn’t loaded yet, poll briefly
    const id = setInterval(() => {
      if (window.google) {
        clearInterval(id);
        mount();
      }
    }, 100);
    return () => clearInterval(id);
  }
}, []);



  return (
    <AuthCard
      title="Login"
      footerText="Don’t have an account?"
      footerLink="Signup"
      footerHref="/signup"
    >
      <form className="space-y-4" onSubmit={submitHandler}>
        <input
          type="email"
          value={form.email}
          placeholder="Email"
          name="email"
          onChange={changeEventHandler}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    name="password"
    value={form.password}
    onChange={changeEventHandler}
    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  <div className="flex items-center justify-between mt-2">
    {/* Show password toggle */}
    <div className="flex items-center">
      <input
        type="checkbox"
        id="showPassword"
        checked={showPassword}
        onChange={() => setShowPassword(!showPassword)}
        className="mr-2"
      />
      <label htmlFor="showPassword" className="text-gray-300 text-sm">
        Show Password
      </label>
    </div>

    {/* Forgot Password link */}
    <button
      type="button"
      onClick={() => navigate("/forgot-password")}
      className="text-sm text-blue-400 hover:underline"
    >
      Forgot Password?
    </button>
  </div>
</div>


        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold shadow-md flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
      
    </AuthCard>
  );
}

export default Login;
