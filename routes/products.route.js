const express = require("express");
const router = express.Router();
const { Products, Users } = require("../models");
const { Op } = require("sequelize");

const authMiddleware = require("../middlewares/auth-middleware.js");
// /api/products
// 상품 목록 조회 API
router.get("/products", async (req, res) => {
  try {
    const products = await Products.findAll({
      include: [
        {
          model: Users,
          attributes: ["name", "id", "email"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json({ data: products });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, errorMessage: "값을 찾을 수 없습니다." });
  }
});

// 담임매니져님이 Restful한 방식으로 바꾸라고함
// 전체조회는 products로, 상세조회, 등록, 변경, 삭제는 product로 작성

// 상품 등록 API
router.post("/product", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const { id } = res.locals.user;
    if (title === undefined || content === undefined) {
      return res.status(400).json({
        success: false,
        errorMessage: "데이터 형식이 올바르지 않습니다."
      });
    }
    await Products.create({ title, content, author: id });
    res.send("판매 상품을 등록하였습니다.");
  } catch (err) {
    console.log(err);
  }
});

// /api/product/:id
// 상품 상세 조회 API
router.get("/product/", async (req, res) => {
  try {
    res.status(400).json({
      success: false,
      errorMessage: "데이터 형식이 올바르지 않습니다."
    });
  } catch (err) {
    res.status(400).json({ success: false, errorMessage: "값을 찾을 수 없습니다." });
  }
});

router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Products.findOne({
      attributes: ["productId", "author", "title", "content", "status", "createdAt", "updatedAt"],
      include: [
        {
          model: Users,
          attributes: ["name", "id", "email"]
        }
      ],
      where: {
        productId: productId
      }
    }); // productId로 뒤져서 나오는 객체를 반환
    if (!product) {
      // productId로 뒤져서 나온 데이터가 false면 truthy되어 호출
      return res.status(404).json({
        success: false,
        errorMessage: "상품 조회에 실패하였습니다."
      });
    } else res.json({ data: product }); // 아니면 그냥 data호출
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
router.put("/product/:productId", authMiddleware, async (req, res) => {
  try {
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

    if (product.author !== id) {
      return res.status(404).json({
        success: false,
        errorMessage: "상품 수정 권한이 없습니다."
      });
    }

    await Products.update(
      { title, content, status },
      {
        where: {
          productId: productId
        }
      } // title과 content 컬럼을 수정합니다.
    );
    res.json({ message: "상품 정보를 수정하였습니다." });
  } catch (err) {
    console.log(err);
  }
});

// 상품 삭제 API
// productId값이 없으면 그냥 /product/페이지니까 바로 메시지 반환
router.delete("/product/", authMiddleware, async (req, res) => {
  return res.status(400).json({
    success: false,
    errorMessage: "데이터 형식이 올바르지 않습니다."
  });
});

router.delete("/product/:productId", authMiddleware, async (req, res) => {
  try {
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

    if (product.author !== id) {
      return res.status(404).json({
        success: false,
        errorMessage: "상품 삭제 권한이 없습니다."
      });
    }

    await Products.destroy({
      where: {
        productId: productId
      }
    });
    res.json({ message: "상품을 삭제하였습니다." });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
