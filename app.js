const express = require("express");

const db = require("./models/index.js");

// 시퀄라이즈 연결 확인
try {
  db.sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

const app = express();
const port = 3000;
const productsRouter = require("./routes/products.route.js"); // 미들웨어 세팅
const userRouter = require("./routes/user.route.js"); // 미들웨어 세팅
const connect = require("./schemas"); // 몽고DB 스키마 연결
connect();

app.use(express.json()); // json미들웨어 세팅
app.use("/api", [productsRouter]); // productsRouter 미들웨어
app.use("/auth", [userRouter]); // userRouter 미들웨어

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
