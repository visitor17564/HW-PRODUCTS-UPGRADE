// json > js로 파일변경하여 "dotenv" 사용가능하도록 변경
// db추가명령어가 기존 시퀄라이즈 시스템에서 읽을 수 없으므로 경로를 따로 지정해줘야함
// npx sequelize db:create --config config/config.js

require("dotenv").config();

const development = {
  username: process.env.instanceUserId,
  password: process.env.instanceUserPw,
  database: process.env.instanceUserDatabase,
  host: process.env.instanceUserHost,
  dialect: "mysql"
};

module.exports = { development };
