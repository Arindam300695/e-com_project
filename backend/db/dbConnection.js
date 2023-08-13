const mongoose = require("mongoose");

// Replace 'your-database-url' with the actual MongoDB connection URL
const dbURI = process.env.db_url;

module.exports = async () => {
    await mongoose.connect(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
};

// Graceful exit on process termination || when user will press ctrl + c in the terminal
process.on("SIGINT", async () => {
    try {
        await mongoose.connection.close();
        console.log("Disconnected from MongoDB");
        process.exit(0); // Exit the process with a success status
    } catch (error) {
        console.error("Error while disconnecting from MongoDB:", error);
        process.exit(1);
    }
});
