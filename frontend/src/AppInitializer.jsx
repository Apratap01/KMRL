import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, setLoading } from "./redux/authSlice";
import { getUser } from "../utils/getUser";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        dispatch(setLoading(true));
        const user = await getUser(); // this should hit /me with cookies
        if (user) {
          dispatch(setUser(user));
        } else {
          dispatch(setUser(null));
        }
      } catch (err) {
        console.error("Failed to restore user:", err);
        dispatch(setUser(null));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUser();
  }, [dispatch]);

  return children;
}
