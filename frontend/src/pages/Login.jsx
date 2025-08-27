import React, { useState } from "react";
import AuthCard from "../components/AuthCard.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/authSlice.js";
import { USER_API_ENDPOINT } from "../../utils/constants.js";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
      const res = await axios.post(`${USER_API_ENDPOINT}/login`, form,{
        withCredentials:true,
      }
      );
      console.log(res);
      console.log(res.status);
      console.log(res.data);
      console.log(typeof res.data.user.is_valid);
      if(!(res.data.user.is_valid)){
        navigate("/verifyemail")
        toast.message("Please Verify Your email");
      }

      // Example navigation after login
      else if (res.status === 200) {
        toast.success("Login Successfull")
        navigate("/"); 
      }
    } catch (error) {
       toast.error("Credentials are wrong")

    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <AuthCard
      title="Login"
      googleText="Sign in with Google"
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
