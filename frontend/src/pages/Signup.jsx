import { useState } from "react"
import AuthCard from "../components/AuthCard"
import { toast } from "sonner"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setLoading } from "../redux/authSlice"
import { setUser } from "../redux/authSlice"
import { useEffect } from "react"

import { Loader2, Eye, EyeOff, User, Mail, Lock, Shield } from "lucide-react"

function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [inputValue, setInputValue] = useState({
    name: "",
    email: "",
    password: "",
  })

  const Navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const changeEventHandler = (e) => {
    setInputValue({ ...inputValue, [e.target.name]: e.target.value })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      dispatch(setLoading(true))
      const res = await axios(`${import.meta.env.VITE_USER_API_ENDPOINT}/register`, {
        method: "POST",
        data: inputValue,
      })
      console.log(res)
      console.log(res.status)
      console.log(res.data)

      const { email, name, password } = inputValue

      if (!name) {
        console.log("Name is required")
        toast.error("Name is required")
        return
      }
      if (!password) {
        console.log("Password is required")
        toast.error("Password is required")
        return
      }
      if (password.length < 6) {
        console.log("Password must be at least 6 characters")
        toast.error("Password must be at least 6 characters")
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        console.log("Please enter a valid email")
        toast.error("Please enter a valid email")
        return
      }

      if (res.status === 201) {
        Navigate("/login")
        toast.success("Registration Successful! Please verify your email.")
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || "Something went wrong")
    } finally {
      dispatch(setLoading(false))
    }
  }

  console.log(inputValue)

   const handleGoogleResponse = async (response) => {
      try {
        dispatch(setLoading(true));
        const res = await axios.post(
          `${import.meta.env.VITE_USER_API_ENDPOINT}/google`,
          { token: response.credential },
          { withCredentials: true }
        );
  
        if (res.status === 200) {
          toast.success("Google Login Successful");
          dispatch(setUser(res.data.user));
          Navigate("/");
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
        if (window.google) {
          google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // <-- your Google Client ID in .env
            callback: handleGoogleResponse,
          });
    
          google.accounts.id.renderButton(
            document.getElementById("googleLoginBtn"),
            { theme: "outline", size: "large", shape: "pill" } // customize look
          );
        }
      }, []);

  return (
    <AuthCard
      title="Create Account"
      googleText="Sign up with Google"
      footerText="Already have an account?"
      footerLink="Sign In"
      footerHref="/login"
    >
      <div className="mb-3 text-center">
        <p className="text-gray-400 text-sm">Create your account for legal document services</p>
      </div>

      <form className="space-y-3" onSubmit={submitHandler}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <User className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                value={inputValue.name}
                name="name"
                onChange={changeEventHandler}
                placeholder="Enter full name"
                className="w-full pl-8 pr-3 py-2.5 text-sm rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-white/20"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="Enter email address"
                name="email"
                value={inputValue.email}
                onChange={changeEventHandler}
                className="w-full pl-8 pr-3 py-2.5 text-sm rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-white/20"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1">
            Password <span className="text-gray-500">(min. 6 characters)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Lock className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create secure password"
              name="password"
              value={inputValue.password}
              onChange={changeEventHandler}
              className="w-full pl-8 pr-10 py-2.5 text-sm rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-white/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4 py-2">
          

         
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 text-white py-2.5 rounded-md font-semibold shadow-lg hover:shadow-xl flex items-center justify-center text-sm"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Create Secure Account
            </>
          )}
        </button>
      </form>
    </AuthCard>
  )
}

export default Signup
