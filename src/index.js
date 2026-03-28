// import express from "express"
// import dotenv from "dotenv"
// import {connectDB} from "./library/db.js"
// import cookieParser from "cookie-parser";
// import cors from "cors";

// import path from "path";

// import authRoutes from "./routes/auth.route.js";
// import messageRoutes from "./routes/message.route.js";
// import { app , server } from "./library/socket.js"

// dotenv.config()


// const PORT = process.env.PORT;
// const __dirname = path.resolve();

// app.use(express.json({ limit: "10mb" })); 
// app.use(cookieParser());
// app.use(cors({
//     origin:"http://localhost:5173" ,
//     credentials: true,
// })
// );

// app.use("/api/auth" , authRoutes);
// app.use("/api/messages" , messageRoutes);

// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
//     app.get("*", (req, res) => {
//       res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//     });
//   }

// server.listen(PORT , ()=>{
//     console.log(`server is running on port:${PORT}`);
//     connectDB()
// })  








import dotenv from "dotenv";
dotenv.config(); // ✅ MUST be first

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./library/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./library/socket.js";

// ✅ Safe PORT (never trust env blindly)
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

// ✅ Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Production setup
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "../frontend", "dist", "index.html")
    );
  });
}

// ✅ Start server + DB
server.listen(PORT, async () => {
  console.log(`Server is running on port: ${PORT}`);

  try {
    await connectDB();
  } catch (error) {
    console.error("DB connection failed:", error.message);
  }
});