// AppInitializer.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/authSlice";
import axios from "axios";
import { USER_API_ENDPOINT } from "../utils/constants";
import { getUser } from "../utils/getUser";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (user) {
        dispatch(setUser(user));
      }
    };
    fetchUser();
  }, [dispatch]);
  return children; // render rest of app after trying fetch
}
