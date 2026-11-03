
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: ''
    },
    productName: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    addressLine: { type: String, required: true },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: items => items.length > 0,
        message: 'An order must contain at least one item.'
      }
    },

    deliveryAddress: {
      type: addressSchema,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ['cod', 'card', 'upi'],
      required: true
    },

    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: [
        'Order Placed',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled'
      ],
      default: 'Order Placed'
    },

    orderDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
