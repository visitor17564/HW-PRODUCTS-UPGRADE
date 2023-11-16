// 초기 세팅
const jwt = require("jsonwebtoken"); // jwt
const { Users } = require("../models"); // User모델
const env = require("dotenv"); // dotenv
env.config();

module.exports = async (req, res, next) => {
  try {
    // 쿠키에서 토큰 디코드
    const { authorization } = req.cookies;
    const [tokenType, token] = (authorization ?? "").split(" ");
    const decodedToken = jwt.verify(token, process.env.tokenKey);
    const id = decodedToken.id;
    const user = await Users.findOne({ where: { id } });

    // id값으로 조회되는 user가 없을 경우
    if (!user) {
      res.clearCookie("authorization");
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    // 토큰 타입이 일치하지 않을 경우
    if (tokenType !== "Bearer") {
      return res.status(401).json({ message: "토큰 타입이 일치하지 않습니다." });
    }

    // 유효성검사 통과시 locals에 user전송
    res.locals.user = user;
    next();
  } catch (error) {
    res.clearCookie("authorization");
    // 토큰만료 에러핸들링
    const { name } = error;
    if (name === "TokenExpiredError") {
      return res.status(401).json({
        message: "토큰이 만료되었습니다 다시 로그인 해주세요"
      });
    } else {
      // 나머지 알 수 없는 오류
      return res.status(500).json({
        success: false,
        Message: "예기치 못한 오류가 발생하였습니다."
      });
    }
  }
};
