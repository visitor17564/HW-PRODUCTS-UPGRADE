const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth-middleware.js");
// /api/products
// 상품 목록 조회 API
router.get("/products", async (req, res) => {
  try {
    const data = await Products.find().sort({ createdAt: -1 });
    res.json({ data });
  } catch (err) {
    res.status(400).json({ success: false, errorMessage: "값을 찾을 수 없습니다." });
  }
});

// 담임매니져님이 Restful한 방식으로 바꾸라고함
// 전체조회는 products로, 상세조회, 등록, 변경, 삭제는 product로 작성

// 상품 등록 API
router.post("/product", authMiddleware, async (req, res) => {
  try {
    const { title, content, author, password } = req.body;
    if (title === undefined || content === undefined || author === undefined || password === undefined) {
      return res.status(400).json({
        success: false,
        errorMessage: "데이터 형식이 올바르지 않습니다."
      });
    }
    await Products.create({ title, content, author, password });
    res.send("판매 상품을 등록하였습니다.");
  } catch (err) {
    console.log(err);
  }
});

// /api/product/:_id
// 상품 상세 조회 API
router.get("/product", async (req, res) => {
  try {
    res.status(400).json({
      success: false,
      errorMessage: "데이터 형식이 올바르지 않습니다."
    });
  } catch (err) {
    res.status(400).json({ success: false, errorMessage: "값을 찾을 수 없습니다." });
  }
});

router.get("/product/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const data = await Products.findById(_id).exec(); // _id으로 뒤져서 나오는 객체를 반환
    if (!data || _id.length !== 24) {
      // _id로 뒤져서 나온 데이터가 false면 truthy되어 호출
      return res.status(404).json({
        success: false,
        errorMessage: "상품 조회에 실패하였습니다."
      });
    } else res.json({ data }); // 아니면 그냥 data호출
  } catch (err) {
    console.log(err);
    // BSONError issue 해결법 찾는중
    console.log("id값은 12바이트의 단일 문자열이거나 16진수 형식의 24개 16진수 문자 문자열이어야 함");
  }
});

// 상품 수정 API
// _id값이 없으면 그냥 /product/페이지니까 바로 메시지 반환
router.put("/product/", authMiddleware, async (req, res) => {
  return res.status(400).json({
    success: false,
    errorMessage: "데이터 형식이 올바르지 않습니다."
  });
});

// body값이 없는거만 잘 찾으면됨
router.put("/product/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const { password } = req.body;
    const { status } = req.body;
    const data = await Products.findById(_id).exec();
    if (!(status && (status === "FOR_SALE" || status === "SOLD_OUT"))) {
      // 상태는 "FOR_SALE"이나 "SOLD_OUT" 둘중 하나만 할 수 있으니까
      return res.status(400).json({
        success: false,
        errorMessage: "데이터 형식이 올바르지 않습니다."
      });
    } else if (password === undefined) {
      // password 필수로 포함해야하니까
      return res.status(400).json({
        success: false,
        errorMessage: "데이터 형식이 올바르지 않습니다."
      });
    } else if (!data || _id.length !== 24) {
      // _id로 뒤져서 나온 데이터가 false면 truthy되어 호출
      return res.status(404).json({
        success: false,
        errorMessage: "상품 조회에 실패하였습니다."
      });
    } else if (password !== data.password) {
      return res.status(401).json({
        success: false,
        errorMessage: "비밀번호 오류 : 상품을 수정할 권한이 존재하지 않습니다."
      });
    }
    await Products.findByIdAndUpdate(_id, req.body, {
      // _id으로 뒤져서 나오는 객체에 req.body값을 업데이트
      new: true //이 값을 설정해야 업데이트 된 객체 반환, 설정안하면 업데이트 전 객체 반환
    }).exec();
    res.json({ message: "상품 정보를 수정하였습니다." });
  } catch (err) {
    console.log(err);
  }
});

// 상품 삭제 API
// _id값이 없으면 그냥 /product/페이지니까 바로 메시지 반환
router.delete("/product/", authMiddleware, async (req, res) => {
  return res.status(400).json({
    success: false,
    errorMessage: "데이터 형식이 올바르지 않습니다."
  });
});

router.delete("/product/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const { password } = req.body;
    const data = await Products.findById(_id).exec();
    if (password === undefined) {
      // password 필수로 포함해야하니까
      return res.status(400).json({
        success: false,
        errorMessage: "데이터 형식이 올바르지 않습니다."
      });
    } else if (!data) {
      return res.status(404).json({ success: false, errorMessage: "상품 조회에 실패하였습니다." });
    } else if (password !== data.password) {
      return res
        .status(401)
        .json({ success: false, errorMessage: "비밀번호 오류 : 상품을 삭제할 권한이 존재하지 않습니다." });
    } else {
      Products.findByIdAndDelete(_id);
      res.status(200).json({ success: "success", Message: "데이터 삭제를 성공하였습니다." });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
