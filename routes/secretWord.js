const express = require("express");
const router = express.Router();
const csrfProtection = require("csurf");

router.use(csrfProtection());

router.get("/", (req, res) => {
  res.render("secretWord", { 
    secretWord: req.session.secretWord || "secret", 
    csrfToken: req.csrfToken() 
  });
});

router.post("/", (req, res) => {
  console.log("Body of the POST request:", req.body);
  console.log("CSRF Token from body:", req.body._csrf);
  console.log("CSRF Token from session:", req.csrfToken());

  if (req.body.secretWord.toUpperCase()[0] === "P") {
    req.flash("error", "You can't use words that start with P.");
  } else {
    req.session.secretWord = req.body.secretWord;
    req.flash("info", "The secret word was changed.");
  }

  res.redirect("/secretWord");
});

module.exports = router;
