const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
require("dotenv").config();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const jsonWebToken = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

const secret = process.env.SECRET;

// Mongoose schema
const secretsSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

secretsSchema.plugin(encrypt, {
  secret: secret,
  encryptedFields: ["password"]
});

const Item = mongoose.model("secrets", secretsSchema);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("MongoDB Connected");
})
.catch((err) => {
  console.error("MongoDB Connection Error:", err.message);
});

// Routes
app.get("/", (req, res) => {
  res.render("home", { error: null });
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});

app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

function isValidPassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return passwordRegex.test(password);
}

// Registration
app.post("/register", (req, res) => {
  const { name, userName: email, password } = req.body;

  if (!isValidPassword(password)) {
    return res.render("register", {
      error: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
    });
  }

  const newUser = new Item({ name, email, password });

  newUser.save()
    .then(() => {
      res.render("login", { error: null });
      console.log("Registration successful");
    })
    .catch((err) => {
      console.log("Registration failed:", err.message);
      res.render("register", {
        error: "Email already exists or registration failed"
      });
    });
});

// Login
app.post("/login", (req, res) => {
  const { userName: email, password } = req.body;

  Item.findOne({ email })
    .then((foundUser) => {
      if (foundUser) {
        if (foundUser.password === password) {
          const token = jsonWebToken.sign(
            { userId: foundUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 3600000
          });
          res.render("secrets");
          console.log("Login successful");
        } else {
          console.log("Incorrect password");
          res.render("login", { error: "Incorrect password" });
        }
      } else {
        console.log("User not found");
        res.render("login", { error: "User not found" });
      }
    })
    .catch((err) => {
      console.log("Login error:", err.message);
      res.render("login", { error: "Login failed. Please try again later." });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server Started on port", PORT);
});
