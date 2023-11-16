// 초기세팅
const express = require("express"); // express
const router = express.Router(); // Router
const { Products, Users } = require("../models"); // 구조분해할당(각 models)
const authMiddleware = require("../middlewares/auth-middleware.js"); // 미들웨어

// 상품 등록(생성) API
router.post("/product", authMiddleware, async (req, res) => {
  try {
    // 구조분해할당
    const { title, content } = req.body;
    const { id } = res.locals.user;

    // 입력이 올바르지 않을 시
    if (title === undefined || content === undefined) {
      return res.status(400).json({
        success: false,
        errorMessage: "데이터 형식이 올바르지 않습니다."
      });
    }

    // 유효성검사 통과시 상품등록
    await Products.create({ title, content, author: id });
    res.status(200).json({ success: true, Message: "판매 상품을 등록하였습니다." });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

// 상품 전체목록 조회 API
// 담임매니져님이 Restful한 방식으로 바꾸라고함
// 전체조회는 products로, 상세조회, 등록, 변경, 삭제는 product로 작성
router.get("/products", async (req, res) => {
  try {
    // 상품 다 찾기(인증필요없음)
    const products = await Products.findAll({
      include: [
        {
          model: Users,
          attributes: ["name", "id", "email"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.status(200).json({ data: products });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

// 상품 상세 조회 API
// 담임매니져님이 Restful한 방식으로 바꾸라고함
// 전체조회는 products로, 상세조회, 등록, 변경, 삭제는 product로 작성
// productId값이 없으면 그냥 /product/페이지니까 바로 메시지 반환
router.get("/product/", async (req, res) => {
  try {
    res.status(400).json({
      success: false,
      errorMessage: "올바르지 않은 경로입니다."
    });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

router.get("/product/:productId", async (req, res) => {
  try {
    // 구조분해할당
    const { productId } = req.params;
    // 상품 찾기(인증필요없음)
    const product = await Products.findOne({
      include: [
        {
          model: Users,
          attributes: ["name", "id", "email"]
        }
      ],
      where: {
        productId: productId // productId로 뒤져서 나오는 객체를 반환
      }
    });

    // 상품이 조회되지 않을 시
    if (!product) {
      return res.status(404).json({
        success: false,
        errorMessage: "상품 조회에 실패하였습니다."
      });
    }

    // 아니면 그냥 data호출
    res.status(200).json({ data: product });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

// 상품 수정 API
// productId값이 없으면 그냥 /product/페이지니까 바로 메시지 반환
router.put("/product/", authMiddleware, async (req, res) => {
  try {
    return res.status(400).json({
      success: false,
      errorMessage: "올바르지 않은 경로입니다."
    });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

// body값이 없는거만 잘 찾으면됨
router.put("/product/:productId", authMiddleware, async (req, res) => {
  try {
    // 구조분해할당당
    const { productId } = req.params;
    const { id } = res.locals.user;
    const { title, content, status } = req.body;

    // 일단 상품 조회
    const product = await Products.findOne({
      where: {
        productId: productId
      }
    });

    // status 검렬
    if (!(status && (status === "FOR_SALE" || status === "SOLD_OUT"))) {
      // 상태는 "FOR_SALE"이나 "SOLD_OUT" 둘중 하나만 할 수 있으니까
      return res.status(400).json({
        success: false,
        errorMessage: "데이터 형식이 올바르지 않습니다."
      });
    }

    // 상품이 없을 경우
    if (!product) {
      // productId로 뒤져서 나온 데이터가 false면 truthy되어 호출
      return res.status(404).json({
        success: false,
        errorMessage: "상품 조회에 실패하였습니다."
      });
    }

    // 로그인한 id값이 수정대상 상품 작성자와 다를 경우
    if (product.author !== id) {
      return res.status(403).json({
        success: false,
        errorMessage: "상품 수정 권한이 없습니다."
      });
    }

    // 유효성검사 통과시 상품 수정
    await Products.update(
      { title, content, status },
      {
        where: {
          productId: productId
        }
      } // title과 content 컬럼을 수정합니다.
    );
    res.status(204).json({ message: "상품 정보를 수정하였습니다." });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

// 상품 삭제 API
// productId값이 없으면 그냥 /product/페이지니까 바로 메시지 반환
router.delete("/product/", authMiddleware, async (req, res) => {
  try {
    return res.status(400).json({
      success: false,
      errorMessage: "데이터 형식이 올바르지 않습니다."
    });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

router.delete("/product/:productId", authMiddleware, async (req, res) => {
  try {
    // 구조분해할당
    const { productId } = req.params;
    const { id } = res.locals.user;

    // 일단 상품 조회
    const product = await Products.findOne({
      where: {
        productId: productId
      }
    });

    // 상품이 없을 경우
    if (!product) {
      // productId로 뒤져서 나온 데이터가 false면 truthy되어 호출
      return res.status(404).json({
        success: false,
        errorMessage: "상품 조회에 실패하였습니다."
      });
    }

    // 로그인한 id값이 삭제대상 상품 작성자와 다를 경우
    if (product.author !== id) {
      return res.status(403).json({
        success: false,
        errorMessage: "상품 삭제 권한이 없습니다."
      });
    }

    // 유효성 검사 통과시 상품삭제
    await Products.destroy({
      where: {
        productId: productId
      }
    });
    res.status(204).json({ message: "상품을 삭제하였습니다." });
  } catch (err) {
    res.status(500).json({ success: false, Message: "예기치 못한 오류가 발생하였습니다." });
    console.log(err);
  }
});

module.exports = router;
