import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi"; // npm install react-icons
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_ENDPOINT } from "../../../utils/constants";
import { setUser } from "../../redux/authSlice";
import {toast} from "sonner"
export default function Navbar() {
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch()
  const {user} = useSelector(state => state.auth)
  const navigate = useNavigate()

  const logOutHandler = async () => {
    try {
      const res = await axios.post(`${USER_API_ENDPOINT}/logout`, {},
        {
        withCredentials: true
      })
      console.log(res)
     
      if(res.status == 200){
        dispatch(setUser(null));
        navigate('/')
        toast.success(res.data.message);
      }
    } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
    }
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-gradient-to-r from-[#03070e] to-[#050448]/80 px-6 md:px-10 py-4 flex justify-between items-center shadow-md">
      {/* Logo */}
      <div className="text-white font-bold text-xl cursor-pointer">
        <Link to="/">Logo</Link>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex space-x-8">
        <Link to="/" className="text-white hover:text-gray-300">Home</Link>
        <Link to="/resources" className="text-white hover:text-gray-300">Resources</Link>
      </div>

      

      {/* Desktop Buttons */}
      {
        user ? <div className="hidden md:flex space-x-4"> <Link onClick={logOutHandler} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90">LogOut</Link></div> :
        <div className="hidden md:flex space-x-4">
        <Link to="/login" className="px-4 py-2 rounded-lg border border-gray-400 text-white hover:bg-gray-800/70">Login</Link>
        <Link to="/signup" className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90">Signup</Link>  
      </div>  
      }
     

      {/* Mobile Menu Button */}
      <button className="md:hidden text-white text-2xl" onClick={() => setOpen(!open)}>
        {open ? <HiX /> : <HiMenu />}
      </button>

      {/* Mobile Dropdown */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-[#141414]/95 flex flex-col items-center space-y-4 py-6 md:hidden">
          <Link to="/" className="text-white" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/resources" className="text-white" onClick={() => setOpen(false)}>Resources</Link>
          <Link to="/login" className="text-white" onClick={() => setOpen(false)}>Login</Link>
          <Link to="/signup" className="text-white" onClick={() => setOpen(false)}>Signup</Link>
        </div>
      )}
    </nav>
  );
}
