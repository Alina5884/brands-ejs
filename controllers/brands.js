const Brand = require('../models/Brand');

exports.list = async (req, res) => {
  try {
    const brands = await Brand.find({ createdBy: req.user._id });
    res.render('brands', { brands, csrfToken: req.csrfToken() });
  } catch (err) {
    return res.status(500).send('Error retrieving brands');
  }
};

exports.new = (req, res) => {
  res.render('editBrand', { brand: {} });
};

exports.add = async (req, res) => {
  try {
  const editBrand = new Brand({
    name: req.body.name,
    category: req.body.category,
    description: req.body.description,
    logo: req.body.logo,
    website: req.body.website,
    ecoFriendly: req.body.ecoFriendly,
    nonToxic: req.body.nonToxic,
    plasticFree: req.body.plasticFree,
    veganCrueltyFree: req.body.veganCrueltyFree,
    createdBy: req.user._id,
  });

    await editBrand.save();
    req.flash('info', 'Brand added successfully!');
    res.redirect('/brands');
  } catch (err) {
    return res.status(500).send('Error adding brand');
  }
};

exports.edit = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand || brand.createdBy.toString() !== req.user._id.toString()) {
      return res.status(404).send('Brand not found or not authorized');
    }
    
    res.render('editBrand', { brand });
  } catch (err) {
    return res.status(500).send('Error retrieving brand');
  }
};

exports.update = async (req, res) => {
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!updatedBrand) {
      return res.status(500).send('Error updating brand');
    }

    req.flash('info', 'Brand updated successfully!');
    res.redirect('/brands');
  } catch (err) {
    return res.status(500).send('Error updating brand');
  }
};

exports.delete = async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    req.flash('info', 'Brand deleted successfully!');
    res.redirect('/brands');
  } catch (err) {
    return res.status(500).send('Error deleting brand');
  }
};