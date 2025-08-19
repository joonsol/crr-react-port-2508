const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());


app.use(express.json());
app.use(cookieParser());
// CORS
app.use(cors({
  origin: process.env.FRONT_ORIGIN, // http://localhost:5173
  credentials: true,
}));


// 라우트 마운트 (현재 user.js를 인증 라우트로 사용)
const authRoutes = require("./routes/user");

// 보호 라우트 예시 (원하면 나중에 실제 라우터로 교체)
const requireAuth = require("./middlewares/auth");
app.use("/api/auth", authRoutes);

app.get("/", (req,res) => {
    res.send("Hello, world");
})

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("연결성공")
}).catch((error)=> console.log("실패",error))

app.listen(PORT, () => {
    console.log("Server is running");
})