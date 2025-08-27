import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import { toast } from "sonner"
import axios from "axios";
import { USER_API_ENDPOINT } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/authSlice";
import { Loader2 } from "lucide-react";
function Signup() {
  const [showPassword, setShowPassword] = useState(false);

  const [inputValue, setInputValue] = useState({
    name: "",
    email: "",
    password: ""
  })

  const Navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth)
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInputValue({ ...inputValue, [e.target.name]: e.target.value })
  }
  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      dispatch(setLoading(true))
      const res = await axios(`${USER_API_ENDPOINT}/register`, {
        method: "POST",
        data: inputValue
      })
      console.log(res)
      console.log(res.status)
      console.log(res.data)

      const { email, name, password } = inputValue;

      if(!name){
        console.log("Name is required");
        toast.error("Name is required");
        return; // stop execution
      }
      if(!password){
        console.log("Password is required");
        toast.error("Password is required");
        return; // stop execution
      }
      if(password.length < 6){
        console.log("Password must be at least 6 characters");
        toast.error("Password must be at least 6 characters");
        return; // stop execution
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log("Please enter a valid email");
        toast.error("Please enter a valid email");
        return; // stop execution
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

  return (
    <AuthCard
      title="Signup"
      googleText="Sign up with Google"
      footerText="Already have an account?"
      footerLink="Login"
      footerHref="/login"
    >
      <form className="space-y-4" onSubmit={submitHandler}>
        <input
          type="text"
          value={inputValue.name}
          name="name"
          onChange={changeEventHandler}
          placeholder="Name"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="email"
          placeholder="Email"
          name="email"
          value={inputValue.email}
          onChange={changeEventHandler}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            name="password"
            value={inputValue.password}
            onChange={changeEventHandler}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center mt-2">
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
        </div>

        {
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold shadow-md flex items-center justify-center"
            disabled={loading} // disables button while loading
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Signup"
            )}
          </button>

        }


      </form>
    </AuthCard>
  );
}

export default Signup;
