require("dotenv").config()
const express = require("express");
const mongoose =require("mongoose")
const app = express();
const PORT = 3000;
const cors=require("cors")
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded())
app.use(cors({
    origin: process.env.FRONT_ORIGIN,
    credentials: true,
}));


mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("연결성공")
}).catch((error)=> console.log("실패",error))


const userRoutes =require("./routes/user")
app.use("/api/auth",userRoutes)




app.listen(PORT, () => {
    console.log("Server is running");
})


app.get("/", (req,res) => {
    res.send("Hello, world");
})