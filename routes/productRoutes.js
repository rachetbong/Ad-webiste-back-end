import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { addProduct, getAllProducts, updateProduct, deleteProduct } from "../controllers/productController.js";

const router = express.Router();

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const parser = multer({ storage });

// Add Product with image
router.post("/add", parser.single("image"), addProduct);
router.get("/all", getAllProducts);
router.put("/:id", parser.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
