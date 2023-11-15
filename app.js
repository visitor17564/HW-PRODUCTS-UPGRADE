const express = require("express");
const db = require("./models/index.js");
const app = express();
const cookieParser = require("cookie-parser");
const port = 3000;
// 시퀄라이즈 연결 확인
try {
  db.sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

const productsRouter = require("./routes/products.route.js"); // 라우트 세팅
const userRouter = require("./routes/user.route.js"); // 라우트 세팅

app.use(express.json()); // json미들웨어 세팅
app.use(cookieParser());
app.use("/api", [productsRouter]); // productsRouter 미들웨어
app.use("/auth", [userRouter]); // userRouter 미들웨어

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
