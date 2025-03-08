const express = require("express");
const cors = require("cors");
const app = express();

// Routes Import
var invoicesRouter = require('../routes/invoices');
var fileUploadRouter = require('../routes/file-upload');
var productsRouter = require('../routes/products');
var customersRouter = require('../routes/customers');


const corsOptions = {
  origin: ["https://swipe-invoice-management-frontend.vercel.app/", "http://localhost:3000"],
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));

app.get("/", (req, res) => res.send("Swipe Backend"));
app.use('/invoices', invoicesRouter);
app.post('/file-upload', fileUploadRouter);
app.use('/products', productsRouter);
app.use('/customers', customersRouter);

app.listen(4000, () => console.log("Server ready on port 4000."));

module.exports = app;
