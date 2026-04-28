const Menu = require('../models/Menu');

// GET ALL MENU
exports.getAllMenu = async (req, res) => {
  try {
    const menu = await Menu.find();
    // Allow browsers/CDNs to cache menu data for 5 minutes
    // stale-while-revalidate allows serving stale data while fetching fresh in background
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    res.status(200).json(menu);
  } catch (error) {
    console.error("Get Menu Error:", error);
    res.status(500).json({ message: "Failed to load menu" });
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
    console.error("Get Item Error:", error);
    res.status(500).json({ message: "Failed to load item" });
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
    console.error("Add Item Error:", error);
    res.status(500).json({ message: "Failed to add item" });
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
    console.error("Update Item Error:", error);
    res.status(500).json({ message: "Failed to update item" });
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
    console.error("Delete Item Error:", error);
    res.status(500).json({ message: "Failed to delete item" });
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
    console.error("Toggle Availability Error:", error);
    res.status(500).json({ message: "Failed to toggle availability" });
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
    console.error("Update Price Error:", error);
    res.status(500).json({ message: "Failed to update price" });
  }
};
