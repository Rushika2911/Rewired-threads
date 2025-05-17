//Requiring important stuff
const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const User = require("./Models/User");
const fs = require("fs");
const Cart = require('./Models/Cart');

const port = process.env.port || 3000;

//Set ejs as templating engine and set the paths or directories
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public/css")));
app.use(express.static(path.join(__dirname, "/public/js")));
app.use(express.static(path.join(__dirname, "/public/img")));

//data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Initialise session
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

//Starting server
app.listen(port, (req, res) => {
  console.log(`App is listening at : http://localhost:${port}/api/login`);
});

//function to check if user loggedin or not
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next(); // User is logged in
  } else {
    return res.redirect("/api/login"); // Redirect to login
  }
}

//login route
app.get("/api/login", (req, res) => {
  let error;
  res.render("login.ejs", { error });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      password: password,
    });

    if (user) {
      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.firstName + " " + user.lastName,
      };
      res.redirect("/api/home");
    } else {
      res.render("login.ejs", { error: "Invalid login credentials." });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).render("login.ejs", {
      error: "An internal server error occurred. Please try again later.",
    });
  }
});

//forgotpass route
app.get("/api/forgotpass", (req, res) => {
  res.render("forgotpass.ejs", { error: null, success: null });
});

app.post("/api/forgotpass", async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  try {
    // Basic validation
    if (!email || !password || !confirmPassword) {
      return res.render("forgotpass.ejs", {
        error: "All fields are required",
        success: null
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.render("forgotpass.ejs", {
        error: "Passwords do not match",
        success: null
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.render("forgotpass.ejs", {
        error: "No account found with this email",
        success: null
      });
    }

    // Update password
    user.password = password;
    await user.save();

    // Redirect to login with success message
    res.redirect("/api/login");

  } catch (error) {
    console.error('Password reset error:', error);
    res.render("forgotpass.ejs", {
      error: "An error occurred while resetting your password. Please try again.",
      success: null
    });
  }
});

//logout route
app.get("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destruction error:", err);
      // Handle error, perhaps by rendering an error page or sending a 500 status
      return res.status(500).send("Could not log out, please try again.");
    }
    res.redirect("/api/login");
  });
});

//Signup route
app.get("/api/signup", (req, res) => {
  res.render("signup", { error: null, success: null });
});

app.post("/api/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.render("signup", {
        error: "User already exists.",
        success: null,
      });
    }

    const lastUser = await User.findOne().sort({ id: -1 });
    const newId = lastUser ? lastUser.id + 1 : 1;

    const newUser = new User({
      id: newId,
      firstName,
      lastName,
      email,
      password,
    });
    await newUser.save();
    res.redirect("/api/login");
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).render("signup", {
      error:
        "An internal server error occurred during signup. Please try again.",
      success: null,
    });
  }
});

//Home route
app.get("/api/home", isAuthenticated, async (req, res) => {
    res.render("home.ejs");
});

//Shop route
app.get("/api/shop", isAuthenticated, async (req, res) => {
    res.render("shop.ejs");
});

//Shop Men route
app.get("/api/shopMen", isAuthenticated, async (req, res) => {
    res.render("shopMen.ejs");
});

//about route
app.get("/api/about", (req, res) => {
    res.render("about.ejs");
});

//contact route
app.get("/api/contact-us", (req, res) => {
    res.render("contactUs.ejs");
});

// Cart routes
app.get("/api/cart", isAuthenticated, async (req, res) => {
  try {
      const cart = await Cart.findOne({ userId: req.session.user.id });
      if (!cart) {
          return res.render("cart.ejs", { 
              cart: { items: [], totalAmount: 0, discount: 0 },
              error: null 
          });
      }
      res.render("cart.ejs", { cart, error: null });
  } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).render("cart.ejs", { 
          error: "Failed to load cart",
          cart: { items: [], totalAmount: 0, discount: 0 }
      });
  }
});

// Add to cart
app.post("/api/cart/add", isAuthenticated, async (req, res) => {
  try {
      const { productId, name, price, quantity, image, color, size } = req.body;
      let cart = await Cart.findOne({ userId: req.session.user.id });

      if (!cart) {
          cart = new Cart({
              userId: req.session.user.id,
              items: []
          });
      }

      // Check if item already exists
      const existingItem = cart.items.find(item => 
          item.productId === parseInt(productId) && 
          item.color === color && 
          item.size === size
      );

      if (existingItem) {
          existingItem.quantity += parseInt(quantity);
      } else {
          cart.items.push({
              productId,
              name,
              price,
              quantity,
              image,
              color,
              size
          });
      }

      cart.calculateTotal();
      await cart.save();
      res.json({ success: true, cart });
  } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ 
          success: false, 
          error: "Failed to add item to cart" 
      });
  }
});

// Update cart item quantity
app.put("/api/cart/update", isAuthenticated, async (req, res) => {
  try {
      const { itemId, quantity } = req.body;
      const cart = await Cart.findOne({ userId: req.session.user.id });

      if (!cart) {
          return res.status(404).json({ 
              success: false, 
              error: "Cart not found" 
          });
      }

      const item = cart.items.id(itemId);
      if (!item) {
          return res.status(404).json({ 
              success: false, 
              error: "Item not found" 
          });
      }

      item.quantity = parseInt(quantity);
      cart.calculateTotal();
      await cart.save();

      res.json({ success: true, cart });
  } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ 
          success: false, 
          error: "Failed to update cart" 
      });
  }
});

// Remove item from cart
app.delete("/api/cart/remove", isAuthenticated, async (req, res) => {
  try {
      const { itemId } = req.body;
      const cart = await Cart.findOne({ userId: req.session.user.id });

      if (!cart) {
          return res.status(404).json({ 
              success: false, 
              error: "Cart not found" 
          });
      }

      cart.items = cart.items.filter(item => item._id.toString() !== itemId);
      cart.calculateTotal();
      await cart.save();

      res.json({ success: true, cart });
  } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({ 
          success: false, 
          error: "Failed to remove item from cart" 
      });
  }
});

// Clear cart
app.delete("/api/cart/clear", isAuthenticated, async (req, res) => {
  try {
      const cart = await Cart.findOne({ userId: req.session.user.id });
      if (cart) {
          cart.items = [];
          cart.totalAmount = 0;
          cart.discount = 0;
          await cart.save();
      }
      res.json({ success: true });
  } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ 
          success: false, 
          error: "Failed to clear cart" 
      });
  }
});

// Apply coupon
app.post("/api/cart/coupon", isAuthenticated, async (req, res) => {
  try {
      const { code } = req.body;
      const cart = await Cart.findOne({ userId: req.session.user.id });

      if (!cart) {
          return res.status(404).json({ 
              success: false, 
              error: "Cart not found" 
          });
      }

      // Simple coupon logic - you might want to create a separate Coupon model
      if (code === 'SAVE100') {
          cart.discount = 100;
          cart.calculateTotal();
          await cart.save();
          res.json({ success: true, discount: cart.discount });
      } else {
          res.status(400).json({ 
              success: false, 
              error: "Invalid coupon code" 
          });
      }
  } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(500).json({ 
          success: false, 
          error: "Failed to apply coupon" 
      });
  }
});

//Misc route - This acts as a catch-all for undefined routes
app.use((req, res, next) => {
  // For any route not matched, send a 404
  res
    .status(404)
    .render("login.ejs", { error: "Page not found. Redirecting to login." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled application error:", err.stack);
  res.status(500).send("Something broke!");
});