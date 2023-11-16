// 초기세팅
const express = require("express"); // express
const { Users } = require("../models"); // Users모델 불러오기
const router = express.Router(); // route 가져오기
const jwt = require("jsonwebtoken"); //jwt
const authMiddleware = require("../middlewares/auth-middleware.js"); // 미들웨어연결
const env = require("dotenv"); // dotenv
env.config(); // dotenv
var validator = require("validator"); // validator 여기서는 이메일 유효성검사로 사용
const bcrypt = require("bcrypt"); // bcrypt 비밀번호 hash 라이브러리
const saltRounds = 10; // bcrypt 비밀번호 hash 라이브러리, 확인을 위한 함수선언
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.log(error);
  }
  return false;
};

// 회원가입 API
router.post("/signup", async (req, res) => {
  try {
    // 구조분해할당, 변수선언
    const { email, name, password, passwordConfirm } = req.body;
    // 이메일 정보가 없는 경우
    if (!email) {
      res.status(400).json({
        errorMessage: "이메일 입력이 필요합니다."
      });
      return;
    }

    // 이메일 정보가 형식에 맞지 않는경우
    const validateEmail = validator.isEmail(email);
    if (!validateEmail) {
      res.status(400).json({
        errorMessage: "이메일이 형식에 맞지 않습니다."
      });
      return;
    }

    // 중복 된 이메일인 경우
    const existsUsers = await Users.findOne({ where: { email } });
    if (existsUsers) {
      // NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않습니다.
      res.status(409).json({
        errorMessage: "이메일이 이미 사용중입니다."
      });
      return;
    }

    // 비밀번호가 6자 미만임
    if (password.length < 6) {
      return res.status(400).json({
        errorMessage: "패스워드는 6자 이상이어야 합니다."
      });
    }

    // 비밀번호가 비밀번호확인과 불일치
    if (password !== passwordConfirm) {
      return res.status(400).json({
        errorMessage: "비밀번호가 비밀번호확인과 불일치합니다."
      });
    }

    // 유효성검사 통과 시 비밀번호 hash
    (async () => {
      await bcrypt.hash(password, saltRounds, function (err, hash) {
        Users.create({ email, name, password: hash });
      });
    })();

    // 회원가입 완료시 사용자정보 반환
    res.status(201).json({
      success: true,
      Message: "회원가입에 성공하셨습니다.",
      data: { email: email, name: name }
    });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

// 로그인 API
router.post("/login", async (req, res) => {
  try {
    // 구조분해할당, 변수선언
    const { email, password } = req.body;

    // 이메일이 일치하는 사용자가 없을 때
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
    }

    // 비밀번호가 일치하지 않을 때
    // 비밀번호 hash 및 비교
    const hash = user.password;
    const isValidPass = await comparePassword(password, hash);
    if (!isValidPass) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // token발행 : payload=id, 유효기간 12h
    const token = jwt.sign(
      {
        id: user.id
      },
      process.env.tokenKey,
      { expiresIn: "12h" }
    );

    // 쿠키에담기
    res.cookie("authorization", `Bearer ${token}`);
    return res.status(200).json({ message: "로그인 성공" });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

// 사용자 정보 조회 API
router.get("/my_page", authMiddleware, async (req, res) => {
  try {
    // 토큰에서 id값 가져오기
    const { id } = res.locals.user;

    // id로 뒤지기(비밀번호 제외)
    const user = await Users.findOne({
      attributes: ["id", "email", "createdAt", "updatedAt"],
      where: {
        id: id
      }
    });

    // 사용자정보 보여주기
    return res.status(200).json({ data: user });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

module.exports = router;
