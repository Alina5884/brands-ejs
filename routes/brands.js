const express = require("express");
const router = express.Router();
const brandsController = require("../controllers/brands");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", brandsController.list);
router.post("/", brandsController.add);
router.get("/new", brandsController.new);
router.get("/edit/:id", brandsController.edit);
router.post("/update/:id", brandsController.update);
router.post("/delete/:id", brandsController.delete);

module.exports = router;