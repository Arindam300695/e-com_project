const express = require("express");
require("dotenv").config();
const connect = require("./db/dbConnection");
const cors = require("cors");
const errorHandler = require("./middleware/customErrorHandler");
const CustomError = require("./utils/customErrorClass");
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const app = express();

// using express middlewares
app.use(
    express.json({
        inflate: true, // Allow automatic decompression of compressed data
        limit: "100mb",
        type: "application/json",
    })
);
app.use(
    express.urlencoded({
        extended: true,
        limit: "100mb",
        parameterLimit: 10000,
        type: ["application/x-www-form-urlencoded", "multipart/form-data"], // Parse both URL-encoded and multipart form data
    })
);
app.use(
    cors({
        origin: true, // to allow all the origins
        credentials: true, // to send credentials (like cookies or HTTP authentication) along with the requests,
    })
);

// listening to the server and starting the server
app.listen(process.env.port, async () => {
    try {
        // db connection
        await connect();
        console.log(`server is listening on port ${process.env.port}`);
    } catch (error) {
        console.log(error.message);
    }
});

// using the routes
// product route
app.use("/api/product", productRoute);
// user route
app.use("/api/user", userRoute);

// if user is trying to access any route which is not mentioned or not has been created
app.use("*", (req, res, next) => {
    const url = req.originalUrl;
    console.log("url : ", url);
    const err = new CustomError(`Cannot find the requested ${url}`, 404);
    next(err);
});

// Apply the custom error handling middleware at the end to handle the errors occured globally all over the app
app.use(errorHandler);
