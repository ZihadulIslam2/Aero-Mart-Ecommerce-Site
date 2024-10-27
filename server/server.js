const express = require("express");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");
const productCollection = require("./models/Product");

const SSLCommerzPayment = require("sslcommerz-lts");

// SSLCommerz credentials
const store_id = "webco66fe9a1c6704c";
const store_passwd = "webco66fe9a1c6704c@ssl";
const is_live = false; // true for live, false for sandbox

// MongoDB connection
mongoose
  .connect("mongodb+srv://zihadul708:01882343242@nodetuts.xnfrv.mongodb.net/")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// cors
app.use(
  cors({
    origin: "https://aero-mart.netlify.app",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

app.use("/api/common/feature", commonFeatureRouter);

// SSLCommerz create order route
app.post("/order", async (req, res) => {
  const { id, order } = req.body;
  try {
    const product = await productCollection.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const tran_id = new ObjectId().toString(); // Corrected transaction ID generation

    const data = {
      total_amount: product.price, // Using product price
      currency: "BDT",
      tran_id: tran_id,
      success_url: "http://localhost:5000/success",
      fail_url: "http://localhost:5000/fail",
      cancel_url: "http://localhost:5000/cancel",
      ipn_url: "http://localhost:5000/ipn",
      shipping_method: "Courier",
      product_name: product.name, // Using actual product name
      product_category: "Electronic",
      product_profile: "general",
      cus_name: order.name, // Assuming order contains customer details
      cus_email: order.email || "customer@example.com",
      cus_add1: order.address1 || "Dhaka",
      cus_add2: order.address2 || "Dhaka",
      cus_city: order.city || "Dhaka",
      cus_state: order.state || "Dhaka",
      cus_postcode: order.postcode || "1000",
      cus_country: order.country || "Bangladesh",
      cus_phone: order.phone || "01711111111",
      cus_fax: order.phone || "01711111111",
      ship_name: order.name,
      ship_add1: order.address1 || "Dhaka",
      ship_add2: order.address2 || "Dhaka",
      ship_city: order.city || "Dhaka",
      ship_state: order.state || "Dhaka",
      ship_postcode: order.postcode || 1000,
      ship_country: order.country || "Bangladesh",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    sslcz
      .init(data)
      .then((apiResponse) => {
        console.log("API Response:", apiResponse); // Add this log to see the full response

        if (apiResponse && apiResponse.GatewayPageURL) {
          const GatewayPageURL = apiResponse.GatewayPageURL;
          res.redirect(GatewayPageURL);
          console.log("Redirecting to: ", GatewayPageURL);
        } else {
          console.error("No GatewayPageURL found in response:", apiResponse);
          res.status(400).json({ message: "GatewayPageURL not found" });
        }
      })
      .catch((error) => {
        console.error("SSLCommerz init error:", error);
        res
          .status(500)
          .json({ message: "Payment gateway initialization failed" });
      });
  } catch (error) {
    console.error("Error during order processing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// vercel test __________
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start the server
app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
