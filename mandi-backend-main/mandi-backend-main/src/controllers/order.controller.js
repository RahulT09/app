const mongoose = require("mongoose");

const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Address = require("../models/adress.model");
const Product = require("../models/product.model");

async function createOrder(req, res) {
  const session = await mongoose.startSession();
  try {
    let createdOrder;

    await session.withTransaction(async () => {
      // 1. Get logged-in user's cart
      const cart = await Cart.findOne({
        user: req.user._id,
      }).session(session);

      if (!cart || cart.items.length === 0) {
        throw new Error("CART_EMPTY");
      }

      // 2. Get address and verify ownership
      const { addressId } = req.body;

      if (!addressId) {
        throw new Error("ADDRESS_ID_REQUIRED");
      }
      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        throw new Error("INVALID_ADDRESS_ID");
      }

      const address = await Address.findOne({
        _id: addressId,
        user: req.user._id,
      }).session(session);

      if (!address) {
        throw new Error("ADDRESS_NOT_FOUND");
      }

      const orderItems = [];
      let totalAmount = 0;

      // 3. Validate every cart item
      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.product).session(
          session,
        );

        // Product exists?
        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        // Product active?
        if (!product.isActive) {
          throw new Error(`PRODUCT_INACTIVE:${product.name}`);
        }

        // Enough stock?
        if (product.stock < cartItem.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
        }

        // 4. Calculate price from database
        const price = product.price;
        const subtotal = price * cartItem.quantity;

        totalAmount += subtotal;

        // 5. Product snapshot
        orderItems.push({
          product: product._id,
          name: product.name,
          price,
          quantity: cartItem.quantity,
          subtotal,
        });
      }

      // 6. Address snapshot
      const shippingAddress = {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      };

      // 7. Create order
      const orders = await Order.create(
        [
          {
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            totalAmount,

            status: "PENDING",
            paymentStatus: "PENDING",
          },
        ],
        { session },
      );

      createdOrder = orders[0];

      // 8. Deduct stock
      for (const cartItem of cart.items) {
        const result = await Product.updateOne(
          {
            _id: cartItem.product,
            isActive: true,
            stock: { $gte: cartItem.quantity },
          },
          {
            $inc: {
              stock: -cartItem.quantity,
            },
          },
          { session },
        );

        // This protects against stock changing
        // between our initial check and deduction.
        if (result.modifiedCount !== 1) {
          throw new Error("STOCK_CHANGED");
        }
      }

      // 9. Clear cart
      cart.items = [];

      await cart.save({ session });
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: createdOrder,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    if (error.message === "CART_EMPTY") {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (error.message === "ADDRESS_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (error.message === "ADDRESS_ID_REQUIRED") {
      return res.status(400).json({
        success: false,
        message: "Address ID is required",
      });
    }
    if (error.message === "INVALID_ADDRESS_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }
    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "One of the products no longer exists",
      });
    }

    if (error.message.startsWith("PRODUCT_INACTIVE:")) {
      const productName = error.message.split(":")[1];

      return res.status(400).json({
        success: false,
        message: `${productName} is no longer available`,
      });
    }

    if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
      const productName = error.message.split(":")[1];

      return res.status(400).json({
        success: false,
        message: `Not enough stock for ${productName}`,
      });
    }

    if (error.message === "STOCK_CHANGED") {
      return res.status(409).json({
        success: false,
        message: "Stock changed. Please try again",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Could not create order",
    });
  } finally {
    await session.endSession();
  }
}

//get logged in users orders (with optional pagination)
async function getMyOrders(req, res) {
  try {
    // Pagination (opt-in: only applies when ?page or ?limit is provided)
    const usePagination =
      req.query.page !== undefined || req.query.limit !== undefined;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = usePagination
      ? Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
      : 0;
    const skip = usePagination ? (page - 1) * limit : 0;

    // Build filter
    const filter = { user: req.user._id };

    // Optional status filter
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (req.query.status && validStatuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    // Execute query
    let query = Order.find(filter).sort({ createdAt: -1 });

    if (usePagination) {
      query = query.skip(skip).limit(limit);
    }

    const [orders, totalOrders] = await Promise.all([
      query,
      Order.countDocuments(filter),
    ]);

    const response = {
      success: true,
      count: orders.length,
      data: orders,
    };

    // Only include pagination metadata when pagination is used
    if (usePagination) {
      const totalPages = Math.ceil(totalOrders / limit);
      response.pagination = {
        page,
        limit,
        totalOrders,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch orders",
    });
  }
}

//get single order
async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch order",
    });
  }
}

//cancel order
async function cancelOrder(req, res) {
  const session = await mongoose.startSession();
  try {
    let cancelledOrder;

    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      }).session(session);

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      // Only pending orders can be cancelled
      if (order.status !== "PENDING") {
        throw new Error("ORDER_CANNOT_CANCEL");
      }

      // Release stock
      for (const item of order.items) {
        const result = await Product.updateOne(
          {
            _id: item.product,
          },
          {
            $inc: {
              stock: item.quantity,
            },
          },
          {
            session,
          },
        );

        if (result.modifiedCount !== 1) {
          throw new Error("PRODUCT_NOT_FOUND");
        }
      }

      order.status = "CANCELLED";
      // Payment has not happened yet
      order.paymentStatus = "PENDING";

      await order.save({ session });

      cancelledOrder = order;
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: cancelledOrder,
    });
  } catch (error) {
    console.error("CANCEL ORDER ERROR:", error);

    if (error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (error.message === "ORDER_CANNOT_CANCEL") {
      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled",
      });
    }

    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(500).json({
        success: false,
        message: "Could not restore product stock",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Could not cancel order",
    });
  } finally {
    await session.endSession();
  }
}

//admin: get all orders (with pagination + optional status filter)
async function getAllOrdersAdmin(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (req.query.status && validStatuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const [orders, totalOrders] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch orders",
    });
  }
}

//admin: update order status (fulfillment lifecycle, not payment)
async function updateOrderStatusAdmin(req, res) {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const allowedStatuses = ["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    // Orders can't move backward or change once in a terminal state
    const terminalStates = ["DELIVERED", "CANCELLED"];

    let updatedOrder;

    await session.withTransaction(async () => {
      const order = await Order.findById(id).session(session);

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (terminalStates.includes(order.status)) {
        throw new Error("ORDER_TERMINAL");
      }

      // Admin cancelling an order releases reserved stock,
      // same as a customer-initiated cancellation.
      if (status === "CANCELLED") {
        for (const item of order.items) {
          const result = await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session },
          );

          if (result.modifiedCount !== 1) {
            throw new Error("PRODUCT_NOT_FOUND");
          }
        }
      }

      order.status = status;
      await order.save({ session });

      updatedOrder = order;
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    if (error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (error.message === "ORDER_TERMINAL") {
      return res.status(400).json({
        success: false,
        message: "This order has already reached a final state",
      });
    }

    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(500).json({
        success: false,
        message: "Could not restore product stock",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Could not update order status",
    });
  } finally {
    await session.endSession();
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
};
