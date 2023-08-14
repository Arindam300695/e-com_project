const {
    addProductController,
    getAllProductController,
    updateProductController,
    deleteProductController,
} = require("../controllers/productController");
const productRoute = require("express").Router();

productRoute.post("/addProduct", addProductController);
productRoute.get("/getAllProducts", getAllProductController);
productRoute
    .route("/:id")
    .patch(updateProductController)
    .delete(deleteProductController);
module.exports = productRoute;
