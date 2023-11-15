const express = require("express");
const { Users } = require("../models");
const router = express.Router();

// 회원가입 API
router.post("/signup", async (req, res) => {
  const { email, name, password, passwordConfirm } = req.body;
  // StatusCode: 400 - 이메일 정보가 없는 경우
  if (!email) {
    res.status(400).json({
      errorMessage: "이메일 입력이 필요합니다."
    });
    return;
  }

  // StatusCode: 400 - 이메일 정보가 형식에 맞지 않는경우
  // validationFailed 완성해야함
  // User.validationFailed(user => {

  // })

  // StatusCode: 409 - 중복 된 이메일인 경우
  const existsUsers = await Users.findOne({ where: { email } });
  if (existsUsers) {
    // NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않습니다.
    res.status(400).json({
      errorMessage: "이메일이 이미 사용중입니다."
    });
    return;
  }

  // StatusCode: 400 - 비밀번호가 6자 미만임
  if (password.length < 6) {
    res.status(400).json({
      errorMessage: "패스워드는 6자 이상이어야 합니다."
    });
    return;
  }

  // StatusCode: 400 - 비밀번호가 비밀번호확인과 불일치
  if (password !== passwordConfirm) {
    res.status(400).json({
      errorMessage: "비밀번호가 비밀번호확인과 불일치합니다."
    });
    return;
  }

  const user = await Users.create({ email, name, password });

  res.status(200).json({
    success: true,
    Message: "회원가입에 성공했습니다."
  });
});

// 로그인 API
// 일단 쿠키로 해놓고 나중에 토큰으로 변경
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
  } else if (user.password !== password) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  const token = jwt.sign(
    {
      userId: user.userId
    },
    "customized_secret_key"
  );
  res.cookie("authorization", `Bearer ${token}`);
  return res.status(200).json({ message: "로그인 성공" });
});

// 사용자 정보 조회 API
router.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  const user = await Users.findOne({
    attributes: ["userId", "email", "createdAt", "updatedAt"],
    include: [
      {
        model: UserInfos, // 1:1 관계를 맺고있는 UserInfos 테이블을 조회합니다.
        attributes: ["name", "age", "gender", "profileImage"]
      }
    ],
    where: { userId }
  });

  return res.status(200).json({ data: user });
});

module.exports = router;
