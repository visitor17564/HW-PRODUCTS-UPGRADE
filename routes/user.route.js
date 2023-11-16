const express = require("express");
const { Users } = require("../models");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware.js");

// validator
var validator = require("validator");

// 비밀번호 hash 라이브러리, 함수선언
const bcrypt = require("bcrypt");
const saltRounds = 10;

// 비밀번호 확인, 함수선언
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
    const { email, name, password, passwordConfirm } = req.body;
    // StatusCode: 400 - 이메일 정보가 없는 경우
    if (!email) {
      res.status(400).json({
        errorMessage: "이메일 입력이 필요합니다."
      });
      return;
    }

    // StatusCode: 400 - 이메일 정보가 형식에 맞지 않는경우
    const validateEmail = validator.isEmail(email);
    if (!validateEmail) {
      res.status(400).json({
        errorMessage: "이메일이 형식에 맞지 않습니다."
      });
      return;
    }

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

    // 비밀번호 hash
    (async () => {
      await bcrypt.hash(password, saltRounds, function (err, hash) {
        Users.create({ email, name, password: hash });
      });
    })();

    res.status(200).json({
      success: true,
      Message: "회원가입에 성공했습니다."
    });
  } catch (err) {
    console.log(err);
  }
});

// 로그인 API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일이 일치하는 사용자가 없을 때
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
    }

    // 비밀번호가 일치하지 않을 때
    // 비밀번호 hash 확인 함수선언
    const hash = user.password;
    const isValidPass = await comparePassword(password, hash);
    if (!isValidPass) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const token = jwt.sign(
      {
        id: user.id
      },
      "product_upgrade_secret_key",
      { expiresIn: "1s" }
    );
    res.cookie("authorization", `Bearer ${token}`);
    return res.status(200).json({ message: "로그인 성공" });
  } catch (err) {
    console.log(err);
  }
});

// 사용자 정보 조회 API
router.get("/my_page", authMiddleware, async (req, res) => {
  try {
    const { id } = res.locals.user;
    const user = await Users.findOne({
      attributes: ["id", "email", "createdAt", "updatedAt"],
      where: {
        id: id
      }
    });
    return res.status(200).json({ data: user });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
