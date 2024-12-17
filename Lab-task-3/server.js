// Import necessary modules
const express = require("express");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");

// Create an express server object
let server = express();

let cookieParser = require("cookie-parser");
server.use(cookieParser());

let session = require("express-session");
server.use(session({ secret: "my session secret" }));

// Set up EJS as the view engine
server.set("view engine", "ejs");


// Use express layouts for the views
server.use(expressLayouts);

// Expose the public folder for static files
server.use(express.static("Public"));
server.use(express.static("uploads"));
// Add support for URL-encoded data from request bodies
server.use(express.urlencoded({ extended: true }));

// Routes for main portfolio and bootstrap pages
server.get("/portfolio", (req, res) => {
  return res.render("index");
});

server.get("/", (req, res) => {
  return res.render("bootstrap");
});

// Import and use the admin products controller
let adminProductsRouter = require("./routes/admin/products.controller");
server.use(adminProductsRouter);

// Import and use the admin categories controller
let adminCategoriesRouter = require("./routes/admin/categories.controller");
server.use(adminCategoriesRouter);

// add as many routes as you want
server.get("/about-me", (req, res) => {
  return res.render("about-me");
});
server.get("/", async (req, res) => {
  let Product = require("./models/product.model");
  let products = await Product.find();
  return res.render("homepage", { products });
});

// Admin route for creating products (although it's already in products.controller.js, ensure it's not redundant)
server.get("/admin/products/create", (req, res) => {
  res.render("admin/productform", { 
    layout: "adminlayout",
    pageTitle: "Create New Product" 
  });
});

server.get("/admin/categories/create", (req, res) => {
  res.render("admin/category-form", { 
    layout: "adminlayout",
    pageTitle: "Create New Product" 
  });
});

// MongoDB connection
let connectionString = "mongodb://localhost:27017/farsab";
mongoose
  .connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Server: " + connectionString))
  .catch((error) => console.log(error.message));

// Start the server at port 5000
server.listen(5000, () => {
  console.log(`Server started at localhost:5000`);
});
