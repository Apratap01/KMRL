import axios from "axios";
import {USER_API_ENDPOINT} from "./constants.js"

export const getUser = async () => {
  try {
    const res = await axios.get(`${USER_API_ENDPOINT}/fetch-user-data`, {
      withCredentials: true, 
    });
    console.log(res);
    return res.data;
    
  } catch (err) {
    console.error("Error fetching user:", err.response?.data || err.message);
    return null;
  }
};
