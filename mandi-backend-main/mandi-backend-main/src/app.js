const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth.route");
const profileRouter = require("./routes/profile.route");
const categoriesRouter = require("./routes/category.route");
const productRouter = require("./routes/product.routes");
const cartRouter = require("./routes/cart.routes");
const addressRouter = require("./routes/address.route");
const orderRouter = require("./routes/order.route");
const paymentRouter = require("./routes/payment.route");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const globalErrorHandler = require("./middlewares/error.middleware");

const app = express();


app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use((req, res, next) => {
  const ct = req.headers["content-type"] ?? "";
  if (ct.startsWith("multipart/form-data")) return next();
  return express.json({ limit: "10kb" })(req, res, next);
});
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not found",
  });
});

// Global error handler
app.use(globalErrorHandler);

// app.get("/", (req, res) => {
//   res.send("hello world");
// });

module.exports = app;
