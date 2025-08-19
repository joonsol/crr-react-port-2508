// middlewares/auth.js
const jwt = require("jsonwebtoken");

/**
 * 보호 라우트에서 사용:
 * - HttpOnly 쿠키에 담긴 token을 검증하여 req.user에 디코드 결과 저장
 * - 없거나 무효면 401 반환
 */
module.exports = function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "로그인 필요" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, username, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: "토큰 유효하지 않음" });
  }
};
