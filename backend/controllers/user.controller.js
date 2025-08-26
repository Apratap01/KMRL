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

export{
  generateAccessToken,
  generateRefreshToken
}