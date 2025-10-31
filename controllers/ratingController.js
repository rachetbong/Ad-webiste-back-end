import Rating from "../models/Rating.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// ✅ Submit Rating (One-time only, no editing allowed)
export const submitRating = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id; // From JWT token

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if user has remaining attempts
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ Check if user already rated this product (NO EDITING)
    const existingRating = await Rating.findOne({ productId, userId });

    if (existingRating) {
      return res.status(400).json({ 
        success: false,
        message: "You have already rated this product. Editing is not allowed." 
      });
    }

    // Check if user has remaining attempts for NEW ratings
    if (user.remaining <= 0) {
      return res.status(403).json({ message: "No remaining attempts" });
    }

    // Create new rating
    const newRating = new Rating({
      productId,
      userId,
      rating,
      comment: comment || ""
    });

    await newRating.save();

    // Decrease user's remaining attempts
    user.remaining -= 1;
    await user.save();

    // Update product's average rating
    await updateProductRating(productId);

    // Add income to admin (product owner)
    const product = await Product.findById(productId);
    if (product && product.income) {
      const admin = await User.findOne({ email: product.addedBy });
      if (admin) {
        admin.balance = (admin.balance || 0) + product.income;
        await admin.save();
      }
    }

    res.status(201).json({ 
      success: true,
      message: "✅ Rating submitted successfully", 
      rating: newRating,
      remaining: user.remaining 
    });
  } catch (err) {
    console.error("Error submitting rating:", err);
    res.status(500).json({ message: "❌ Error submitting rating", error: err.message });
  }
};

// ✅ Helper: Update Product Average Rating
async function updateProductRating(productId) {
  const ratings = await Rating.find({ productId });
  
  if (ratings.length === 0) {
    await Product.findByIdAndUpdate(productId, { 
      rating: 0, 
      ratedCount: 0 
    });
    return;
  }

  const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalRating / ratings.length;

  await Product.findByIdAndUpdate(productId, {
    rating: avgRating,
    ratedCount: ratings.length
  });
}

// ✅ Get All Ratings for a Product
export const getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;

    const ratings = await Rating.find({ productId })
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    console.error("Error fetching ratings:", err);
    res.status(500).json({ message: "❌ Error fetching ratings" });
  }
};

// ✅ Get User's Ratings
export const getUserRatings = async (req, res) => {
  try {
    const userId = req.user.id;

    const ratings = await Rating.find({ userId })
      .populate("productId", "name imageUrl")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    console.error("Error fetching user ratings:", err);
    res.status(500).json({ message: "❌ Error fetching user ratings" });
  }
};

// ✅ Check if User Rated a Product
export const checkUserRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOne({ productId, userId });

    if (rating) {
      return res.json({ rated: true, rating });
    }

    res.json({ rated: false });
  } catch (err) {
    console.error("Error checking rating:", err);
    res.status(500).json({ message: "❌ Error checking rating" });
  }
};

// ✅ Delete Rating (Optional - if you want to allow deletion)
export const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOne({ _id: id, userId });

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    await rating.deleteOne();

    // Update product rating
    await updateProductRating(rating.productId);

    res.json({ message: "✅ Rating deleted successfully" });
  } catch (err) {
    console.error("Error deleting rating:", err);
    res.status(500).json({ message: "❌ Error deleting rating" });
  }
};