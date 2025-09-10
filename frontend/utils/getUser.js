import axios from "axios";

export const getUser = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_USER_API_ENDPOINT}/fetch-user-data`, {
      withCredentials: true, 
    });
    console.log(res);
    return res.data;
    
  } catch (err) {
    console.error("Error fetching user:", err.response?.data || err.message);
    return null;
  }
};
