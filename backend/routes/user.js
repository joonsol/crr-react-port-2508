// routes/authRoutes.js

const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const requireAuth = require("../middlewares/auth");

// POST /signup : 회원가입
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "이미 존재하는 사용자입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// POST /login : 로그인 (동시 로그인 허용)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select("+password");
    if (!user) return res.status(401).json({ message: "사용자 없음" });
    if (!user.isActive) return res.status(401).json({ message: "비활성 계정" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      user.lastLoginAttempt = new Date();

      if (user.failedLoginAttempts >= 5) {
        user.isActive = false;
        await user.save();
        return res
          .status(401)
          .json({ message: "비밀번호 5회 이상 오류, 계정이 잠겼습니다." });
      }

      await user.save();
      return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
    }

    // 로그인 성공 처리 (isLoggedIn 사용 제거)
    user.failedLoginAttempts = 0;
    user.lastLoginAttempt = new Date();

    // 선택: 클라이언트 외부 IP 저장 시도 (실패해도 무시)
    try {
      const { data } = await axios.get("https://api.ipify.org?format=json");
      if (data?.ip) user.ipAddress = data.ip;
    } catch (ipErr) {
      console.error("IP 주소 조회 실패:", ipErr.message);
    }

    await user.save();

    // JWT 발급 (24시간)
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // HttpOnly 쿠키로 전송
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.status(200).json({ message: "로그인 성공", user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// POST /logout : 현재 브라우저(쿠키)의 토큰만 무효화(서버 상태 변경 없음)
router.post("/logout", async (req, res) => {
  try {
    // 쿠키에 토큰이 없어도 에러로 보지 않고 정리
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    // 참고: 동시 로그인 허용 구조에서는 서버측 isLoggedIn을 건드리지 않습니다.
    return res.json({ message: "로그아웃되었습니다." });
  } catch (error) {
    console.log("로그아웃 중 서버 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// DELETE /delete/:userId : 사용자 삭제
router.delete("/delete/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    res.json({ message: "사용자가 성공적으로 삭제되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "서버 오류 발생", error });
  }
});

// GET /me : 내 정보
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "사용자 없음" });
    if (!user.isActive) return res.status(401).json({ message: "비활성 계정" });
    // 동시 로그인 허용: isLoggedIn 검사 제거
    return res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "서버 오류" });
  }
});

module.exports = router;
