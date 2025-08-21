// Express 모듈 불러오기
const express = require("express");

// Express의 Router 기능 사용 (라우터 분리용)
const router = express.Router();

// 비밀번호 해시화를 위한 bcrypt 불러오기
const bcrypt = require("bcrypt");
const axios = require("axios");
const jwt = require("jsonwebtoken")
// Mongoose 사용자 모델 불러오기
const User = require("../models/User");
const requireAuth = require('../middlewares/auth');

// POST /signup : 회원가입 처리 라우트
router.post("/signup", async (req, res) => {
  try {
    // 클라이언트에서 전달된 username과 password 추출
    const { username, password } = req.body;

    // 동일한 username이 이미 존재하는지 확인
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      // 이미 존재하면 400 에러 반환
      return res.status(400).json({ message: "이미 존재하는 사용자입니다." });
    }

    // 비밀번호를 bcrypt로 해시 처리 (보안 강화)
    const hashedPassword = await bcrypt.hash(password, 10); // 10: salt rounds

    // 새로운 사용자 인스턴스 생성
    const user = new User({
      username,                  // 사용자 이름
      password: hashedPassword, // 해시된 비밀번호 저장
    });

    // DB에 사용자 저장
    await user.save();

    // 성공 응답 반환
    res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    // 서버 오류 발생 시 500 에러 응답
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
    console.log(error); // 콘솔에 에러 로그 출력
  }
});


router.post("/login", async (req, res) => {
  try {
    // 1) 요청 바디에서 아이디·비밀번호 추출
    const { username, password } = req.body;

    // 2) 사용자 조회 (비밀번호 필드까지 함께 가져오기 위해 select("+password"))
    const user = await User.findOne({ username }).select("+password");
    if (!user) return res.status(401).json({ message: "사용자 없음" });
    if (!user.isActive) return res.status(401).json({ message: "비활성 계정" });
    if (user.isLoggedIn) return res.status(401).json({ message: "이미 다른 기기에서 접속 중" });

    // 3) 비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // 실패 시: 횟수 +1, 마지막 시도 시간 기록
      user.failedLoginAttempts += 1;
      user.lastLoginAttempt = new Date();

      // 5회 이상 실패 → 계정 잠금 후 저장 & 오류 리턴
      if (user.failedLoginAttempts >= 5) {
        user.isActive = false;
        await user.save();
        return res
          .status(401)
          .json({ message: "비밀번호 5회 이상 오류, 계정이 잠겼습니다." });
      }

      // 5회 미만 → 상태 저장 후 즉시 오류 리턴
      await user.save();
      return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
    }

    // 4) 로그인 성공 → 실패 카운터 초기화
    user.failedLoginAttempts = 0;
    user.lastLoginAttempt = new Date();
    user.isLoggedIn = true;

    // 5) 클라이언트 IP 주소 저장 (선택사항)
    try {
      const { data } = await axios.get("https://api.ipify.org?format=json");
      if (data?.ip) user.ipAddress = data.ip;
    } catch (ipErr) {
      console.error("IP 주소 조회 실패:", ipErr.message);
    }

    await user.save(); // 변경 사항 저장

    // 6) JWT 발급 (24시간 유효)
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 7) httpOnly 쿠키에 JWT 저장 (배포 환경에서는 secure: true 권장)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24h
    });

    // 8) 클라이언트에 보낼 데이터(비밀번호 제외)
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return res.status(200).json({ message: "로그인 성공", user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    // 1. 쿠키에서 토큰 추출
    const token = req.cookies.token;

    // 2. 토큰이 없으면 이미 로그아웃된 상태로 간주
    if (!token) {
      return res.status(400).json({ message: "이미 로그아웃된 상태입니다." });
    }

    try {
      // 3. 토큰 디코딩 (유효성 검증 포함)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. 토큰 안에 포함된 userId로 사용자 조회
      const user = await User.findById(decoded.userId);

      // 5. 사용자가 존재하면 로그인 상태 해제 후 저장
      if (user) {
        user.isLoggedIn = false;
        await user.save();
      }
    } catch (error) {
      // (주의) 토큰이 만료되었거나 변조된 경우
      console.log("토큰 검증 오류:", error.message);
    }

    // 6. 응답 전에 쿠키에서 토큰 제거
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,      // 프로덕션 환경에서는 true로 변경
      sameSite: "strict"
    });

    // 7. 클라이언트에 로그아웃 완료 메시지 반환
    res.json({ message: "로그아웃되었습니다." });

  } catch (error) {
    // 서버 내부 오류 처리
    console.log("로그아웃 중 서버 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});



router.delete("/delete/:userId", async (req, res) => {
  try {
    // 1. 요청 URL의 파라미터에서 userId 추출하여 사용자 삭제 시도
    const user = await User.findByIdAndDelete(req.params.userId);

    // 2. 사용자가 존재하지 않으면 404 Not Found 응답
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 3. 삭제가 성공적으로 완료된 경우 성공 메시지 반환
    res.json({ message: "사용자가 성공적으로 삭제되었습니다." });

  } catch (error) {
    // 4. 서버 에러 발생 시 500 응답 에러 객체 포함
    res.status(500).json({ message: "서버 오류 발생", error });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "사용자 없음" });
    if (!user.isActive) return res.status(401).json({ message: "비활성 계정" });
    if (!user.isLoggedIn) return res.status(401).json({ message: "로그인 필요" });
    res.json({ user });
  } catch {
    res.status(500).json({ message: "서버 오류" });
  }
});

// 이 라우터를 외부에서 사용할 수 있도록 내보내기
module.exports = router;