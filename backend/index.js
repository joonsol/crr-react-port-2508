require("dotenv").config()
const express = require("express");
const mongoose =require("mongoose")
const app = express();
const PORT = 3000;
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.json())
app.use(express.urlencoded())
const userRoutes =require("./routes/user")





app.use("/api/auth",userRoutes)

app.get("/", (req,res) => {
    res.send("Hello, world");
})

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("연결성공")
}).catch((error)=> console.log("실패",error))

app.listen(PORT, () => {
    console.log("Server is running");
})