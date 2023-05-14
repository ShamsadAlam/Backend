/* Node Js Backend without express

const http = require("http");
// console.log(http);
const fs = require("fs");
const home = fs.readFileSync("./index.html",()=>{
    console.log("File Read");
})

// console.log('home ->',home);

const generateRandom = require("./features");
console.log(generateRandom());

const server = http.createServer((req,res)=> {
    if(req.url === "/about") res.end(`<h1>Love is ${generateRandom()}</h1>`);
    else if(req.url === "/") res.end(home);
    else if(req.url === "/contact") res.end("<h1>Contact Page</h1>");
    else{
        res.end("<h1>Page not found</h1>")
    }
});

server.listen(3000,()=>{
    console.log("server is listening on port 3000");
})
*/


const express = require("express")
const app = express();
const path = require("path")
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt  = require("jsonwebtoken");
const bcrypt = require("bcrypt")

mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"Back-End",
}).then(()=> console.log("Database Connected"))
.catch((e)=> console.log(e));

const UserSchema =new mongoose.Schema({
    name:String,
    email:String,
    password:String
});

const User = mongoose.model("user",UserSchema)

// express.static(path.join(path.resolve(),"public"));

// it sets the static path for the index.html to send on the browser as a response. after setting up this path no need to include (__dirname +"index.html").
app.use(express.static(path.join(path.resolve(),"public")));

// it is used for middleware for getting the values filled in the login form(index.ejs)
app.use(express.urlencoded({extended:true}))

app.use(cookieParser());

//setting up view engine
app.set("view engine","ejs");

const isAuthenticated = async(req,res,next) =>{
    const {token} = req.cookies;
    if(token){
        const decoded = jwt.verify(token,"afbifbfibcNCS");
        console.log('decoded',decoded);
        req.user = await User.findById(decoded._id);
        next();
    }
    else res.redirect("/login");
};

app.get("/",isAuthenticated, (req, res) => {
    console.log('req.user:- ',req.user);
  res.render("logout",{name:req.user.name})
});


app.get("/success", (req,res) =>{
    res.render("success");
})

app.get("/add", async(req,res) =>{
//    await message.create({name:"Abhi",email:"sample@gmail.com"});
   res.send("nice");
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/contact",async(req,res) =>{
    // console.log(req.body);
    // const userData = {name: req.body.name, email:req.body.email}
    // console.log(userData);
    
    const {name,email} = req.body;
    await message.create({name,email});
    res.redirect("/success");
})

app.get("/register", (req, res) => {
    console.log('req.user:- ',req.user);
    res.render("register")
});

app.post("/login",async(req,res)=>{
    const {email,password} = req.body;
    let user  = await User.findOne({email})

    if(!user) return res.redirect("/register");
    
    const isMatch = await bcrypt.compare(password,user.password);
    
    if(!isMatch) return res.render("login",{email, message:"Incorrect Password"});

    const token = jwt.sign({_id:user._id},"afbifbfibcNCS")
    console.log('token',token);
    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now()+60*1000)
    })
    res.redirect("/")
})

app.post("/register",async(req,res)=>{
    // console.log(req.body);
    const {name,email,password} = req.body;
    let user = await User.findOne({email});
    if(user)return res.redirect("/login");

    const hashedPassword = await bcrypt.hash(password,10)

    user = await User.create({
        name,
        email,
        password:hashedPassword
    });
    const token = jwt.sign({_id:user._id},"afbifbfibcNCS")
    console.log('token',token);
    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now()+60*1000)
    })
    res.redirect("/")
})

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires: new Date(Date.now())
    })
    res.redirect("/")
})

app.get("/users",(req,res)=>{
    res.json({
        message:"users data fetched successfully.",
        data:users
    })
})

app.listen(3000,()=>{
    console.log("server is running on port 3000");
})