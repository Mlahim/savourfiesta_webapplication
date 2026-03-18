const Menu = require('../models/Menu');

// GET ALL MENU
exports.getAllMenu = async (req, res) => {
  try {
    const menu = await Menu.find();
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ONE ITEM
exports.getOneItem = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD ITEM
exports.addItems = async (req, res) => {
  try {
    const {
      productName,
      productCategory,
      productSubCategory,
      productPrice,
      productDescription,
      available
    } = req.body;

    let productUrl = "";
    if (req.file) {
      productUrl = req.file.path; // Cloudinary URL
    }

    const newItem = new Menu({
      productName,
      productCategory,
      productSubCategory,
      productPrice,
      productDescription,
      productUrl,
      available
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ITEM
exports.updateItem = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.productUrl = req.file.path; // Cloudinary URL
    }

    const item = await Menu.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ITEM
exports.deleteItem = async (req, res) => {
  try {
    const item = await Menu.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE AVAILABILITY (Admin)
exports.toggleAvailability = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.available = !item.available;
    await item.save();

    res.status(200).json({
      message: `${item.productName} is now ${item.available ? 'available' : 'out of stock'}`,
      item
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PRICE / DISCOUNT (Admin)
exports.updatePrice = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const { productPrice, originalPrice, discountedPrice, removeDiscount } = req.body;

    if (removeDiscount) {
      // Remove discount — keep current productPrice, clear discount fields
      item.originalPrice = null;
      item.discountedPrice = null;
      if (productPrice) item.productPrice = productPrice;
      await item.save();
      return res.status(200).json({ message: `Discount removed for ${item.productName}`, item });
    }

    if (discountedPrice && originalPrice) {
      // Apply discount
      item.originalPrice = originalPrice;
      item.discountedPrice = discountedPrice;
      item.productPrice = discountedPrice; // actual charge = discounted price
    } else if (productPrice) {
      // Simple price update (no discount)
      item.productPrice = productPrice;
      item.originalPrice = null;
      item.discountedPrice = null;
    }

    await item.save();
    res.status(200).json({ message: `Price updated for ${item.productName}`, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
