// Import necessary modules
const express = require("express");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
// Create an express server object
let server = express();
let Product = require("./models/products.model");



let User = require("./models/user.model");
let cookieParser = require("cookie-parser");
server.use(cookieParser());

let session = require("express-session");
server.use(session({ secret: "my session secret" }));
let siteMiddleware = require("./middlewares/site-middleware");
let authMiddleware = require("./middlewares/auth-middleware");
server.use(siteMiddleware);
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

// add as many routes as you want
server.get("/about-me", authMiddleware, (req, res) => {
  return res.render("about-me");
});

server.get("/logout", async (req, res) => {
  req.session.user = null; // Clear the session user
  res.clearCookie("cart"); // Clear the cart cookie
  return res.redirect("/login");
});
server.get("/login", async (req, res) => {
  return res.render("auth/login");
});
/*server.post("/login", async (req, res) => {
  let data = req.body;
  let user = await User.findOne({ email: data.email });
  if (!user) return res.redirect("/register");
  isValid = user.password == data.password;
  if (!isValid) return res.redirect("/login");
  req.session.user = user;
  return res.redirect("/");
});*/

server.post("/login", async (req, res) => {
  let data = req.body;
  let user = await User.findOne({ email: data.email });
  
  if (!user) return res.redirect("/register");

  const isValid = user.password == data.password;
  if (!isValid) return res.redirect("/login");

  req.session.user = user; // Save user in session
  res.clearCookie("cart"); // Clear the cart cookie on login
  return res.redirect("/");
});
server.get("/register", async (req, res) => {
  return res.render("auth/register");
});
server.post("/register", async (req, res) => {
  let data = req.body;
  let user = await User.findOne({ email: data.email });
  if (user) return res.redirect("/register");
  user = new User(data);
  await user.save();
  return res.redirect("/login");
});
server.get("/cart", async (req, res) => {
  let cart = req.cookies.cart;
  cart = cart ? cart : [];
  let products = await Product.find({ _id: { $in: cart } });
  return res.render("cart", { products });
});
server.get("/add-to-cart/:id",authMiddleware, (req, res) => {
  let cart = req.cookies.cart;
  cart = cart ? cart : [];
  cart.push(req.params.id);
  res.cookie("cart", cart);
  return res.redirect("/");
});

server.get("/homepage", async (req, res) => {
  let products = await Product.find();
  return res.render("homepage", { products });
});

// Delete product from the cart using cookies
server.post('/delete-from-cart/:id', (req, res) => {
  let cart = req.cookies.cart;
  if (!cart) return res.redirect("/cart"); // If cart is empty, redirect to cart page

  // Remove the product ID from the cart array
  cart = cart.filter(item => item != req.params.id); // Filter out the product from the cart

  // Save the updated cart back to the cookie
  res.cookie('cart', cart);
  return res.redirect('/cart'); // Redirect to the cart page after deletion
});

// Route: Display Checkout Page
server.get('/checkout', async (req, res) => {
  let cart = req.cookies.cart || []; // Retrieve cart from cookies
  let products = await Product.find({ _id: { $in: cart } }); // Fetch products in the cart
  res.render('checkout', { products }); // Render checkout page
});

// Route: Finalize Checkout
server.post('/finalize-checkout', (req, res) => {
  const { name, email } = req.body; // Retrieve customer details from the form
  console.log('Order placed by:', name, email); // Log customer details
  res.send(`
      <h1>Thank you for your purchase, ${name}!</h1>
      <p>Your order has been successfully placed.</p>
  `);
});

/*server.post('/place-order', (req, res) => {
  // Handle order logic here (e.g., save to database)
  console.log('Order placed:', req.body);

  // Respond with success
  return res.status(200).send('Order placed successfully');
});*/

// POST request for placing the order
server.post('/place-order', async (req, res) => {
  let cart = req.cookies.cart || []; // Get the cart from cookies
  let products = await Product.find({ _id: { $in: cart } }); // Fetch products in the cart

  // Check if products are fetched correctly
  console.log(products);  // Add this to debug and see if products data is being fetched

  // Calculate the total bill
  let totalBill = 0;
  products.forEach(product => {
      totalBill += product.price; // Assuming you don't have quantities
  });

  // Assuming customer details come from the request body
  const customer = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      zip: req.body.zip,
  };

  // Render the order confirmation page with the products and totalBill
  res.render('order-confirmation', {
      products: products,
      totalBill: totalBill,
      customer: customer, // Pass customer details
  });
});

server.get("/", async (req, res) => {
  // Extract min and max price from the query string (if available)
  let { minPrice, maxPrice } = req.query;

  // Set default values for minPrice and maxPrice if they are not provided
  minPrice = minPrice ? parseFloat(minPrice) : 0;
  maxPrice = maxPrice ? parseFloat(maxPrice) : Number.MAX_SAFE_INTEGER;

  // Query the database to get products that fall within the specified price range
  let products = await Product.find({
    price: { $gte: minPrice, $lte: maxPrice }
  });

  // Render the homepage with filtered products
  return res.render("homepage", { products, minPrice, maxPrice });
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


let adminMiddleware = require("./middlewares/admin-middleware");
server.use("/bootstrap", authMiddleware, adminMiddleware, adminProductsRouter);

// MongoDB connection
let connectionString = "mongodb://localhost:27017/farsab";
mongoose
  .connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Server: " + connectionString))
  .catch((error) => console.log(error.message));

// Start the server at port 5000
server.listen(5003, () => {
  console.log(`Server started at localhost:5000`);
});
