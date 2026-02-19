const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const bookRoutes = require("./routes/bookRoutes");
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// serve cover images from server/public/covers
app.use("/covers", express.static(path.join(__dirname, "public/covers")));

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// api routes
app.use("/api/books", bookRoutes);

const PORT = process.env.PORT || 4000;

console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);

// connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
