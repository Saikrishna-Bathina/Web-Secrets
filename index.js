const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
require("dotenv").config(); 
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")
const jsonWebToken = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

var app = express();
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(cookieParser());
const secret = process.env.SECRET;



const secretsSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String
});
secretsSchema.plugin(encrypt,{secret : secret , encryptedFields:["password"]});
const Item = mongoose.model("secrets", secretsSchema);



mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log(" MongoDB Connected");
})
.catch((err) => {
    console.error(" MongoDB Connection Error:", err.message);
});

app.get("/",(req,res)=>{
    res.render("home");
});
app.get("/login",(req,res)=>{
    res.render("login");
});
function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
}


app.post("/register", (req, res) => {
    const name = req.body.name
    const email = req.body.userName;
    const password = req.body.password;

    
    if (!isValidPassword(password)) {
        return res.status(400).send("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
    }

    const newUser = new Item({
        name : name,
        email: email,
        password: password
    });

    newUser.save()
    .then(() => {
        res.render("login");
        console.log("Registration successful");
    })
    .catch((err) => {
        console.log("Registration failed:", err.message);
        res.status(500).send("Registration failed");
    });
});


app.post("/login", (req, res) => {
    const email = req.body.userName;
    const password = req.body.password;

    Item.findOne({ email: email })
        .then((foundUser) => {
            if (foundUser) {
                if (foundUser.password === password) {
                    const token = jsonWebToken.sign(
                        {userId : foundUser._id},
                        process.env.JWT_SECRET,
                        {expiresIn : "1h"}
                    );
                    res.cookie("token",token,{
                        httpOnly : true,
                        secure : false,
                        sameSite : "strict",
                        maxAge : 3600000
                    });
                    res.render("secrets");
                    console.log("Login successful");
                } else {
                    console.log("Incorrect password");
                    res.status(401).send("Incorrect password");
                }
            } else {
                console.log("User not found");
                res.status(401).send("User not found");
            }
        })
        .catch((err) => {
            console.log("Login error:", err.message);
            res.status(500).send("Login failed");
        });
});


app.post("/logout",(req,res)=>{
    res.render("home")
})

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/logout", (req, res) => {
    res.redirect("/");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server Started");
});