const jwt = require("jsonwebtoken");
const { Users } = require("../models");

const env = require("dotenv");
env.config();

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.cookies;
    const [tokenType, token] = (authorization ?? "").split(" ");
    const decodedToken = jwt.verify(token, process.env.tokenKey);
    const id = decodedToken.id;
    const user = await Users.findOne({ where: { id } });
    if (!user) {
      res.clearCookie("authorization");
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    if (tokenType !== "Bearer") {
      return res.status(401).json({ message: "토큰 타입이 일치하지 않습니다." });
    }

    res.locals.user = user;
    next();
  } catch (error) {
    res.clearCookie("authorization");
    const { name } = error;
    if (name === "TokenExpiredError") {
      return res.status(401).json({
        message: "토큰이 만료되었습니다 다시 로그인 해주세요"
      });
    } else {
      return res.status(401).json({
        message: "비정상적인 요청입니다."
      });
    }
  }
};
