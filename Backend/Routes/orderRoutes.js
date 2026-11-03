import express from 'express';
import mongoose from 'mongoose';
import Order from '../model/Order.js';

const router = express.Router();

// Allowed order statuses
const allowedStatuses = [
  'Order Placed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled'
];

// Helper: find an order by custom orderId or MongoDB _id
const getOrderFilter = (id) => {
  const filters = [{ orderId: id }];

  if (mongoose.isValidObjectId(id)) {
    filters.push({ _id: id });
  }

  return { $or: filters };
};

// =====================================================
// CREATE ORDER
// POST /order
// =====================================================
router.post('/', async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      paymentMethod,
      subtotal,
      discount,
      shipping,
      tax,
      total
    } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !deliveryAddress ||
      !paymentMethod
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Order details are incomplete.'
      });
    }

    const order = await Order.create({
      orderId:
        'NRU-' +
        Date.now() +
        '-' +
        Math.random().toString(36).slice(2, 6).toUpperCase(),

      items,
      deliveryAddress,
      paymentMethod,
      subtotal,
      discount: discount ?? 0,
      shipping: shipping ?? 0,
      tax: tax ?? 0,
      total,
      status: 'Order Placed'
    });

    return res.status(201).json({
      status: 'success',
      message: 'Order placed successfully!',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to save order.',
      error: error.message
    });
  }
});

// =====================================================
// GET ALL ORDERS — ADMIN DASHBOARD
// GET /order
// =====================================================
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ orderDate: -1 })
      .lean();

    return res.status(200).json({
      status: 'success',
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error('Get all orders error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders.'
    });
  }
});

// =====================================================
// UPDATE ORDER STATUS
// PUT /order/:orderId
// Body: { "status": "Processing" }
// =====================================================
router.put('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid order status.',
        allowedStatuses
      });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      getOrderFilter(orderId),
      { $set: { status } },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found. Status was not updated.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully.',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update order error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to update order status.',
      error: error.message
    });
  }
});

// =====================================================
// DELETE ORDER
// DELETE /order/:orderId
// Supports custom orderId and MongoDB _id
// =====================================================
router.delete('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const deletedOrder = await Order.findOneAndDelete(
      getOrderFilter(orderId)
    );

    if (!deletedOrder) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found. Nothing was deleted.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Order deleted successfully.',
      orderId: deletedOrder.orderId
    });

  } catch (error) {
    console.error('Delete order error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete order.',
      error: error.message
    });
  }
});

// =====================================================
// GET ORDER BY ORDER ID OR MONGODB _id
// GET /order/:orderId
// Keep this route after GET /
// =====================================================
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne(
      getOrderFilter(req.params.orderId)
    );

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found.'
      });
    }

    return res.status(200).json({
      status: 'success',
      order
    });

  } catch (error) {
    console.error('Get order error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order.',
      error: error.message
    });
  }
});

export default router;