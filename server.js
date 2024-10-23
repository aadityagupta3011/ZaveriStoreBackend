const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB (optional, remove if not using MongoDB)
mongoose.connect("mongodb://localhost:27017/bluestonesdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define Order schema (optional)
const orderSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  phone: String,
  upiReference: String,
  cartItems: Array,
  totalPrice: Number,
});

const Order = mongoose.model("Order", orderSchema);

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "takmonboostleadform@gmail.com", // The email address sending the emails
    pass: "wkzu adwg ovgq hapb", // App-specific password for the email
  },
});

// Function to send emails
const sendOrderEmails = async (customerEmail, ownerEmail, orderDetails) => {
  // Customer email template
  const customerEmailTemplate = `
    <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #4CAF50; text-align: center;">Thank you for your order, ${
          orderDetails.name
        }!</h1>
        <p style="text-align: center; font-size: 16px; color: #555;">We appreciate your business. Below is a summary of your order:</p>

        <!-- Order Summary Section -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f9f9f9; color: #4CAF50;">
              <th style="padding: 10px 15px; border-bottom: 1px solid #ddd;">Product</th>
              <th style="padding: 10px 15px; border-bottom: 1px solid #ddd;">Price</th>
              <th style="padding: 10px 15px; border-bottom: 1px solid #ddd;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.cartItems
              .map(
                (item) => `
                <tr>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #ddd;">${
                    item.name
                  }</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #ddd;">₹${item.price.toFixed(
                    2
                  )}</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #ddd; text-align: center;">${
                    item.quantity
                  }</td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>

        <!-- Total Section -->
        <div style="text-align: right; margin: 20px 0;">
          <p style="font-size: 18px; font-weight: bold;">Total: ₹${orderDetails.totalPrice.toFixed(
            2
          )}</p>
        </div>

        <!-- UPI Reference Section -->
        <p style="font-size: 16px; color: #333; margin: 20px 0;">UPI Reference / Transaction ID: <strong>${
          orderDetails.upiReference
        }</strong></p>

        <!-- Assistance Section -->
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 16px; color: #777;">For any assistance, WhatsApp us at: <a href="https://wa.me/919999999999" style="color: #4CAF50; text-decoration: none;">+91 9999999999</a></p>
        </div>

        <!-- Footer Section -->
        <div style="text-align: center; margin-top: 30px; background-color: #4CAF50; color: white; padding: 10px 0; border-radius: 5px;">
          <p>BlueStones Store</p>
          <p><a href="https://bluestonesstore.com" style="color: white; text-decoration: none;">www.bluestonesstore.com</a></p>
        </div>
      </div>
    </div>
  `;

  // Owner email template
  const ownerEmailTemplate = `
    <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #FF6347; text-align: center;">New Order Received!</h1>
        <p style="font-size: 16px; color: #555;">A new order has been placed by <strong>${
          orderDetails.name
        }</strong>.</p>
        <p style="font-size: 16px; color: #555;">Here are the details:</p>

        <!-- Order Details Section -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f9f9f9; color: #FF6347;">
              <th style="padding: 10px 15px; border-bottom: 1px solid #ddd;">Product</th>
              <th style="padding: 10px 15px; border-bottom: 1px solid #ddd;">Price</th>
              <th style="padding: 10px 15px; border-bottom: 1px solid #ddd;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.cartItems
              .map(
                (item) => `
                <tr>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #ddd;">${
                    item.name
                  }</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #ddd;">₹${item.price.toFixed(
                    2
                  )}</td>
                  <td style="padding: 10px 15px; border-bottom: 1px solid #ddd; text-align: center;">${
                    item.quantity
                  }</td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>

        <!-- Total Section -->
        <div style="text-align: right; margin: 20px 0;">
          <p style="font-size: 18px; font-weight: bold;">Total: ₹${orderDetails.totalPrice.toFixed(
            2
          )}</p>
        </div>

        <!-- UPI Reference Section -->
        <p style="font-size: 16px; color: #333; margin: 20px 0;">UPI Reference / Transaction ID: <strong>${
          orderDetails.upiReference
        }</strong></p>

        <!-- Customer Contact Section -->
        <p style="font-size: 16px; color: #555;">Customer Contact: <strong>${
          orderDetails.phone
        }</strong></p>

      </div>
    </div>
  `;

  // Send email to the customer
  await transporter.sendMail({
    from: '"BlueStones Store" <takmonboostleadform@gmail.com>', // Sender email address
    to: customerEmail, // Customer's email from form data
    subject: "Order Confirmation - BlueStones Store",
    html: customerEmailTemplate,
  });

  // Send email to the store owner
  await transporter.sendMail({
    from: '"BlueStones Store" <takmonboostleadform@gmail.com>',
    to: ownerEmail, // Static owner's email
    subject: "New Order Received - BlueStones Store",
    html: ownerEmailTemplate,
  });
};

// Route to handle checkout
app.post("/checkout", async (req, res) => {
  const { formData, cartItems, totalPrice } = req.body;

  // Log the received data
  console.log("Customer Details:", formData);
  console.log("Order Details:", cartItems);
  console.log("Total Price:", totalPrice);

  // Create a new order document (if using MongoDB)
  const newOrder = new Order({
    name: formData.name,
    email: formData.email,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zip: formData.zip,
    phone: formData.phone,
    upiReference: formData.upiReference,
    cartItems,
    totalPrice,
  });

  try {
    // Save order to MongoDB (optional)
    await newOrder.save();

    // Send emails to both customer and owner
    await sendOrderEmails(formData.email, "info@zaveristone.in", {
      name: formData.name,
      cartItems,
      totalPrice,
      upiReference: formData.upiReference,
      phone: formData.phone,
    });

    res
      .status(200)
      .json({ message: "Order placed successfully and emails sent!" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});