const jwt = require("jsonwebtoken");
const { Users } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.cookies;
    const [tokenType, token] = (authorization ?? "").split(" ");
    if (tokenType !== "Bearer") {
      return res.status(401).json({ message: "토큰 타입이 일치하지 않습니다." });
    }

    const decodedToken = jwt.verify(token, "product_upgrade_secret_key");
    const id = decodedToken.id;
    const user = await Users.findOne({ where: { id } });
    if (!user) {
      res.clearCookie("authorization");
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }
    res.locals.user = user;
    next();
  } catch (error) {
    res.clearCookie("authorization");
    return res.status(401).json({
      message: "비정상적인 요청입니다."
    });
  }
};
