const express = require("express");
require("express-async-errors");
require("dotenv").config();
const session = require("express-session");
const flash = require("connect-flash");
const MongoDBStore = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const app = express();
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

app.use(helmet());
app.use(xss());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

const connectDB = require("./db/connect");
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { 
    secure: false,
    httpOnly: true,
    sameSite: "strict",
  },
};
app.use(session(sessionParms));

const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.set("view engine", "ejs");

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(require("body-parser").urlencoded({ extended: true }));

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
});

app.use((req, res, next) => {
  console.log("Request received:", req.method, req.url);
  next();
});

const storeLocals = require("./middleware/storeLocals");
app.use(storeLocals);

const auth = require("./middleware/auth");

const brands = require("./routes/brands");
app.use("/brands", auth, brands);

const secretWordRouter = require("./routes/secretWord");
app.use("/secretWord", auth, secretWordRouter);

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).send("Invalid CSRF Token");
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).send(err.message);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(url);
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};

start();