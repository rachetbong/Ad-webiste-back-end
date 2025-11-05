import Product from "../models/Product.js";

// ✅ Create product
export const addProduct = async (req, res) => {
  try {
    console.log("Received body:", req.body);       // Check text fields
    console.log("Received file:", req.file);   

    const { name, description, rating, ratedCount, addedBy, now, income } = req.body;

    if (!name || !addedBy) {
      return res.status(400).json({ message: "Name and addedBy are required" });
    }

    // ✅ Use Cloudinary URL if uploaded, else default to empty string
    const imageUrl = req.file?.path || "";

    const product = new Product({
      name,
      description,
      imageUrl,          // <- always defined
      rating: rating || 0,
      ratedCount: ratedCount || 0,
      addedBy,
      createdAt: now || new Date(),
      income
    });

    await product.save();
    res.status(201).json({ message: "✅ Product added successfully", product });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "❌ Error adding product", error: err.message });
  }
};


// ✅ Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching products", error: err.message });
  }
};

// ✅ Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating product:", id);
    console.log("Received body:", req.body);
    console.log("Received file:", req.file);

    // Prepare updates object
    const updates = { ...req.body };

    // If new image uploaded, use its URL
    if (req.file) {
      console.log("new picture updated")
      updates.imageUrl = req.file.path;  // Cloudinary URL
    }

    const updated = await Product.findByIdAndUpdate(id, updates, { new: true });

    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "✅ Product updated successfully", product: updated });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "❌ Error updating product", error: err.message });
  }
};


// ✅ Delete product
export const deleteProduct = async (req, res) => {
  console.log("delete runned")
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "✅ Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error deleting product", error: err.message });
  }
};
