import mongoose from 'mongoose';


// =========================================================
// PRODUCT SCHEMA
// =========================================================

const ProductSchema = new mongoose.Schema(
  {

    // =======================================================
    // BRAND
    // =======================================================

    brand: {
      type: String,
      required: true,
      trim: true
    },


    // =======================================================
    // PRODUCT NAME
    // =======================================================

    productName: {
      type: String,
      required: true,
      trim: true
    },


    // =======================================================
    // CATEGORY
    // =======================================================

    category: {
      type: String,
      required: true,
      trim: true
    },


    // =======================================================
    // ORIGINAL PRICE
    // =======================================================

    price: {
      type: Number,
      required: true,
      min: 0
    },


    // =======================================================
    // DISCOUNT %
    // =======================================================

    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0
    },


    // =======================================================
    // DISCOUNTED / FINAL PRICE
    // =======================================================

    discountedPrice: {
      type: Number,
      required: true,
      min: 0
    },


    // =======================================================
    // STOCK
    // =======================================================

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },


    // =======================================================
    // STATUS
    // =======================================================

    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },


    // =======================================================
    // MAIN IMAGE
    // =======================================================

    image: {
      type: String,
      required: true,
      trim: true
    },


    // =======================================================
    // SUB IMAGES
    // MAXIMUM 5
    // =======================================================

    subImages: {
      type: [String],
      default: [],

      validate: {

        validator: function (images) {

          return images.length <= 5;

        },

        message:
          'Maximum 5 sub images are allowed.'

      }

    },


    // =======================================================
    // DESCRIPTION
    // =======================================================

    description: {
      type: String,
      required: true,
      trim: true
    }

  },

  {
    timestamps: true
  }

);


// =========================================================
// AUTOMATIC DISCOUNTED PRICE
// =========================================================
//
// Example:
// price = 2500
// discount = 20
//
// discountedPrice = 2000
//
// =========================================================

// ProductSchema.pre(
//   'validate',
//   function (next) {

//     const price =
//       Number(this.price) || 0;

//     const discount =
//       Number(this.discount) || 0;


//     const calculatedPrice =
//       price -
//       ((price * discount) / 100);


//     this.discountedPrice =
//       Math.round(
//         calculatedPrice * 100
//       ) / 100;


//     next();

//   }
// );

ProductSchema.pre('validate', function () {
  const price = Number(this.price) || 0;
  const discount = Number(this.discount) || 0;

  this.discountedPrice = Math.round(
    (price - (price * discount) / 100) * 100
  ) / 100;
});


// =========================================================
// MODEL
// =========================================================

const Product =
  mongoose.model(
    'Product',
    ProductSchema
  );


export default Product;