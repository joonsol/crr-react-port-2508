const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONT_ORIGIN, // http://localhost:5173
  credentials: true,
}));


app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded());
app.use(cors({
  origin: process.env.FRONT_ORIGIN,
  credentials: true,
}));



// 라우트 마운트 (현재 user.js를 인증 라우트로 사용)
const authRoutes = require("./routes/user");
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