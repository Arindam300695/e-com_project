const mongoose = require("mongoose");
const CustomError = require("../utils/customErrorClass");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        minlength: [5, "Product name must be at least 5 characters long"],
        maxlength: [300, "Product name cannot exceed 300 characters"],
        unique: [true, "Two different products cannot have the same name"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        minlength: [
            100,
            "Product description must be at least 100 characters long",
        ],
        maxlength: [1500, "Product description cannot exceed 1500 characters"],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [100, "Price cannot be less than 100"],
    },
    category: {
        type: String,
        enum: [
            "Electronics",
            "Clothing",
            "Beauty",
            "Home",
            "Accessories",
            "Other",
        ],
        required: [true, "Product category is required"],
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // Reference to the User model
                required: [
                    true,
                    "User is required, it cannot be undefined or left blank",
                ],
            },
            rating: {
                type: Number,
                required: [true, "Rating is required"],
                min: [1, "Rating must be at least 1"],
                max: [5, "Rating cannot exceed 5"],
            },
            comment: {
                type: String,
                required: [true, "Comment is required"],
                trim: true,
            },
        },
    ],
    inStock: {
        type: Boolean,
        required: [true, "Stock availability is required"],
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity cannot be negative or less than 1"],
    },
    productImages: {
        type: [
            {
                publicId: {
                    type: String,
                    required: [true, "Image should contain a public id"],
                },
                imageUrl: {
                    type: String,
                    required: [true, "Image should contain an image URL"],
                },
            },
        ],
        required: [true, "Product images are required"],
        _id: false,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

// Add a pre-save middleware to check productImages array length
productSchema.pre("save", function (next) {
    if (this.productImages.length === 0) {
        const error = new CustomError(
            "At least one product image is required",
            406
        );
        next(error);
    }
    next();
});

// Create the Product model using the schema
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
