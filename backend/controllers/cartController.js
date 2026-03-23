const Cart = require('../models/Cart');
const Menu = require('../models/Menu');

exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id, status: "pending" });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ message: "Cart cleared", items: [] });
  } catch (err) {
    console.error("Clear Cart Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    // Parallelize validating product & fetching cart
    const [product, cartResult] = await Promise.all([
      Menu.findById(productId),
      Cart.findOne({ userId: req.user.id, status: "pending" })
    ]);

    if (!product) {
      return res.status(404).json({ message: "Product not found. Please refresh the menu." });
    }

    // SECURITY FIX: Always use server-side price from DB, never trust client
    const serverPrice = product.productPrice;

    let cart = cartResult;

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // Product exists in the cart, update the quantity
      cart.items[itemIndex].quantity += quantity;
      // Also refresh the price from DB in case it changed
      cart.items[itemIndex].price = serverPrice;
    } else {
      // Product does not exist in cart, add new item with server-side price
      cart.items.push({ productId, price: serverPrice, quantity });
    }

    await cart.save();

    // Populate the cart before returning
    await cart.populate('items.productId');
    res.status(200).json(cart);
  } catch (err) {
    console.error("Add Cart Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateItemQuantity = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.user.id, status: "pending" });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      }
      await cart.save();
      await cart.populate('items.productId');
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (err) {
    console.error("Update Cart Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.user.id, status: "pending" });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    await cart.save();
    await cart.populate('items.productId');
    res.status(200).json(cart);
  } catch (err) {
    console.error("Remove Cart Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id, status: "pending" })
      .populate('items.productId');

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    // Filter out items where the product no longer exists or population failed
    const validItems = cart.items.filter(item => {
      if (!item.productId || !item.productId.productName) {
        return false;
      }
      return true;
    });

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save(); // Clean up the cart
    }

    res.json(cart);
  } catch (err) {
    console.error("Get Cart Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id, status: "pending" });
    if (!cart) return res.status(404).json({ message: "Cart empty" });

    cart.status = "checkedout";
    await cart.save();

    res.json({ message: "Checkout successful" });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.mergeCart = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) return res.status(200).json({ message: "No items to merge" });

    let cart = await Cart.findOne({ userId: req.user.id, status: "pending" });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // SECURITY FIX: Look up real prices from DB for all merged items
    const productIds = items.map(item => item.productId);
    const products = await Menu.find({ _id: { $in: productIds } });
    const priceMap = {};
    products.forEach(p => { priceMap[p._id.toString()] = p.productPrice; });

    // Iterate through guest items and add/update them in user cart
    items.forEach(guestItem => {
      const serverPrice = priceMap[guestItem.productId];
      if (!serverPrice) return; // Skip items that don't exist in DB

      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === guestItem.productId
      );

      if (existingItemIndex > -1) {
        // Update quantity if exists
        cart.items[existingItemIndex].quantity += guestItem.quantity;
        cart.items[existingItemIndex].price = serverPrice;
      } else {
        // Add new item with server-side price
        cart.items.push({
          productId: guestItem.productId,
          price: serverPrice,
          quantity: guestItem.quantity
        });
      }
    });

    await cart.save();
    res.status(200).json({ message: "Cart merged", cart });
  } catch (err) {
    console.error("Merge Cart Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
