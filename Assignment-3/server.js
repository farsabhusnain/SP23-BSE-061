// Require Express which is light weight framework of node for web servers
const express = require("express");


// make an express server object by calling express function
let server = express();
// setup ejs as view engine
server.set("view engine", "ejs");
// add middleware for layouts


//expose public folder for publically accessible static files
server.use(express.static("Public"));
// add support for fetching data from request body


// add as many routes as you want
server.get("/portfolio", (req, res) => {
  return res.render("index");
});


server.get("/Bootstrap", (req, res) => {
  return res.render("bootstrap");
});




// fire up the server software at port
server.listen(5000, () => {
  console.log(`Server Started at localhost:5000`);
});