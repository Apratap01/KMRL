import jwt from "jsonwebtoken";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id},
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } // short-lived
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id},
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } // long-lived
  );
};

const fetchUserData = (req,res)=>{
    try {
        const userDetails = req.user
        res.status(200).json({"message":"User Fetched Successfully",data:userDetails})
    } 
    catch (error) {
        console.log(error.message)
        res.status(500).json({"message":"Internal Server error fetching user details"})
    }
}

export{
  generateAccessToken,
  generateRefreshToken,
  fetchUserData
}