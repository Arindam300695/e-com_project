const asyncErrorHandlerFunction = require("../middleware/asyncErrorHandler");
const Product = require("../model/productModel");
const CustomError = require("../utils/customErrorClass");
const cloudinary = require("cloudinary").v2;
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
});

// creating a new product and saving it into the database
module.exports.addProductController = asyncErrorHandlerFunction(
    async (req, res) => {
        const productData = req.body;
        const { images } = req.body;
        const productImages = [];

        // Upload the image to Cloudinary
        for (let i = 0; i < images.length; i++) {
            const uploadResult = await cloudinary.uploader.upload(images[i], {
                folder: "ecom_project_product_images",
            });
            if (!uploadResult) {
                const err = new CustomError("Image upload failed", 407);
                return next(err);
            }
            if (uploadResult) {
                productImages.push({
                    publicId: uploadResult.public_id,
                    imageUrl: uploadResult.secure_url,
                });
            }
        }

        // Add productImages data to productData
        productData.productImages = productImages;
        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();
        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: savedProduct,
        });
    }
);

// fetching all the products
module.exports.getAllProductController = asyncErrorHandlerFunction(
    async (req, res) => {
        let query = req.query;
        let filtered = JSON.parse(
            JSON.stringify(query).replace(
                /\b(gte|gt|lte|lt|in|nin)\b/g,
                (item) => `$${item}`
            )
        );
        console.log(filtered);
        if (req.query.sort) {
            query.sort = JSON.parse(
                JSON.stringify(query.sort).split(",").join(" ")
            );
        }
        // else if (req.query.limit) {
        // }
        console.log("query string : ", query, "type : ", typeof query);
        console.log(
            "query sort string : ",
            query.sort,
            "type : ",
            typeof query.sort
        );
        console.log(
            "query limit string : ",
            query.limit,
            "type : ",
            typeof query.limit
        );

        const products = await Product.find(filtered)
            .sort(query.sort)
            .select("-__v") // Excluding the __v field using the select method
            .limit(query.limit); // limiting how many data we do want
        return res.status(200).json({ success: true, products });
    }
);

// Update product data using PATCH
// TODO:while updating the product data we also need to take care of the product images section. Like if the user wants to delete the existing product images and want to upload the new images in place of them then for that case the code should be modified. So here's a possibility to update the code later on
module.exports.updateProductController = asyncErrorHandlerFunction(
    async (req, res) => {
        const productId = req.params.id; // Get the product ID from URL parameter
        const newData = req.body; // New data to update
        console.log("productId : ", productId, "newData : ", newData);
        // Check if the provided data is valid
        if (JSON.stringify(newData).length <= 2) {
            const err = new CustomError("no new data found to update", 404);
            throw err;
        }

        // Find the product by ID and update the data
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            newData,
            { new: true } // Return the updated document
        );

        // if no products found with the provided id
        if (!updatedProduct) {
            const err = new CustomError("Product not found", 404);
            throw err;
        }

        res.status(200).json({ success: true, product: updatedProduct });
    }
);

// Delete a product
module.exports.deleteProductController = asyncErrorHandlerFunction(
    async (req, res) => {
        const productId = req.params.id; // Get the product ID from URL parameter

        // Find the product by ID and delete it
        const deletedProduct = await Product.findByIdAndDelete(productId);
        console.log("deletedProduct : ", deletedProduct);
        if (!deletedProduct) {
            const err = new CustomError("Product not found", 404);
            throw err;
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    }
);
