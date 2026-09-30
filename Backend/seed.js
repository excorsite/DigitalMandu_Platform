/**
 * Seed script for local MongoDB (digitalmandu)
 * Usage:
 *   npm run seed          # seed if empty
 *   npm run seed -- --reset  # drop and reseed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/userModel');
const Product = require('./models/productModel');
const Order = require('./models/orderModel');

const MONGO_URI = process.env.MONGO_URI || process.env.Mongo_URI || 'mongodb://127.0.0.1:27017/digitalmandu';
const RESET = process.argv.includes('--reset');

const products = [
  { productName: 'Chicken Momo', productDescription: 'Steamed chicken momo with achar', productStock: 100, productPrice: 350, productStatus: 'public', productImage: 'https://images.unsplash.com/photo-1534422298391-e4f640380802?w=600' },
  { productName: 'Veg Chowmein', productDescription: 'Stir-fried noodles with veggies', productStock: 80, productPrice: 250, productStatus: 'public', productImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600' },
  { productName: 'Chicken Biryani', productDescription: 'Aromatic basmati rice with chicken', productStock: 60, productPrice: 550, productStatus: 'public', productImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600' },
  { productName: 'Margherita Pizza', productDescription: 'Classic cheese & tomato pizza 12 inch', productStock: 40, productPrice: 750, productStatus: 'public', productImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600' },
  { productName: 'Veg Burger', productDescription: 'Crispy patty burger with fries', productStock: 50, productPrice: 300, productStatus: 'public', productImage: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=600' },
  { productName: 'Cold Coffee', productDescription: 'Creamy cold coffee 350ml', productStock: 120, productPrice: 180, productStatus: 'public', productImage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600' },
  { productName: 'Chicken Curry Set', productDescription: 'Chicken curry with rice and salad', productStock: 30, productPrice: 480, productStatus: 'public', productImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600' },
  { productName: 'Paneer Tikka', productDescription: 'Grilled paneer with mint chutney', productStock: 45, productPrice: 420, productStatus: 'public', productImage: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600' },
];

async function hash(p) { return bcrypt.hash(p, 10); }

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to ${MONGO_URI}`);

  if (RESET) {
    await mongoose.connection.dropDatabase();
    console.log('Database dropped (--reset)');
  }

  // Users
  const existingAdmin = await User.findOne({ email: 'admin@digitalmandu.local' });
  if (!existingAdmin) {
    await User.create([
      { name: 'Admin', phone: '9800000001', email: 'admin@digitalmandu.local', password: await hash('Admin@123'), role: 'admin', isOtpVerified: true },
      { name: 'Seller One', phone: '9800000002', email: 'seller@digitalmandu.local', password: await hash('Seller@123'), role: 'customer', isOtpVerified: true },
      { name: 'Test Customer', phone: '9800000003', email: 'customer@digitalmandu.local', password: await hash('Customer@123'), role: 'customer', isOtpVerified: true },
    ]);
    console.log('Users seeded (admin / seller / customer)');
  } else {
    console.log('Users already exist - skipping');
  }

  // Products
  const productCount = await Product.countDocuments();
  let createdProducts = [];
  if (productCount === 0) {
    createdProducts = await Product.insertMany(products);
    console.log(`Products seeded: ${createdProducts.length}`);
  } else {
    createdProducts = await Product.find().limit(2);
    console.log(`Products already exist (${productCount}) - skipping`);
  }

  // Demo order for customer
  const customer = await User.findOne({ email: 'customer@digitalmandu.local' });
  const orderCount = await Order.countDocuments();
  if (customer && createdProducts.length >= 2 && orderCount === 0) {
    await Order.create({
      user: customer._id,
      items: [
        { quantity: 2, product: createdProducts[0]._id },
        { quantity: 1, product: createdProducts[1]._id },
      ],
      totalAmount: createdProducts[0].productPrice * 2 + createdProducts[1].productPrice,
      shippingAddress: 'Kathmandu, Nepal',
      orderStatus: 'pending',
      paymentDetails: { method: 'COD', status: 'pending' },
    });
    console.log('Demo order seeded');
  }

  console.log('Seed complete');
  console.log('  admin@digitalmandu.local / Admin@123');
  console.log('  customer@digitalmandu.local / Customer@123');
  await mongoose.disconnect();
}

seed().catch(async (e) => {
  console.error('Seed failed', e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
