// middlewares/isAdmin.js
const jwt = require("jsonwebtoken");
const secret = "your_jwt_secret"; // Đảm bảo giống với file authController.js

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "You do not have admin access" });
    }

    req.user = decoded; // Lưu thông tin vào req.user nếu cần dùng tiếp
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
