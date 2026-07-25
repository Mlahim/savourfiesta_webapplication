const Menu = require('../models/Menu');
const { cloudinary, deleteCloudinaryImage } = require('../config/cloudinary');

// GET ALL MENU
exports.getAllMenu = async (req, res) => {
  try {
    const menu = await Menu.find().sort({ sortOrder: 1, createdAt: 1 });
    // Use no-cache so the browser always revalidates after mutations (edit/delete/add)
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
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

    const maxItem = await Menu.findOne().sort({ sortOrder: -1 });
    const nextSortOrder = maxItem ? (maxItem.sortOrder || 0) + 1 : 0;

    const newItem = new Menu({
      productName,
      productCategory,
      productSubCategory,
      productPrice,
      productDescription,
      productUrl,
      available,
      sortOrder: nextSortOrder
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
    const item = await Menu.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Explicitly pick and update each field from the form data
    if (req.body.productName !== undefined) item.productName = req.body.productName;
    if (req.body.productCategory !== undefined) item.productCategory = req.body.productCategory;
    if (req.body.productSubCategory !== undefined) item.productSubCategory = req.body.productSubCategory;
    if (req.body.productDescription !== undefined) item.productDescription = req.body.productDescription;
    if (req.body.productPrice !== undefined && req.body.productPrice !== '') {
      item.productPrice = Number(req.body.productPrice);
    }

    // Update image if a new one was uploaded
    if (req.file) {
      if (item.productUrl) {
        await deleteCloudinaryImage(item.productUrl);
      }
      item.productUrl = req.file.path; // Cloudinary URL
    }

    await item.save();
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
    if (item.productUrl) {
      await deleteCloudinaryImage(item.productUrl);
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

// REORDER ITEMS (Admin - drag and drop)
exports.reorderItems = async (req, res) => {
  try {
    const { orderedItems } = req.body; // [{ id: '...', sortOrder: 0 }, { id: '...', sortOrder: 1 }, ...]
    if (!Array.isArray(orderedItems) || orderedItems.length === 0) {
      return res.status(400).json({ message: 'No items to reorder' });
    }

    const bulkOps = orderedItems.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sortOrder: item.sortOrder } }
      }
    }));

    await Menu.bulkWrite(bulkOps);
    const updatedMenu = await Menu.find().sort({ sortOrder: 1, createdAt: 1 });
    res.status(200).json({ message: 'Menu order updated', items: updatedMenu });
  } catch (error) {
    console.error('Reorder Error:', error);
    res.status(500).json({ message: 'Failed to reorder items' });
  }
};
