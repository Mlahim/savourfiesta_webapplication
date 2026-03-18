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
    res.status(500).json({ message: "Server Error" });
  }
};

exports.addToCart = async (req, res) => {
  console.log("Adding to cart:", req.body);
  const { productId, price, quantity = 1 } = req.body;

  try {
    // Parallelize validating product & fetching cart
    const [product, cartResult] = await Promise.all([
      Menu.findById(productId),
      Cart.findOne({ userId: req.user.id, status: "pending" })
    ]);

    if (!product) {
      console.log("Attempted to add non-existent product:", productId);
      return res.status(404).json({ message: "Product not found. Please refresh the menu." });
    }

    let cart = cartResult;

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // Product exists in the cart, update the quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Product does not exist in cart, add new item
      cart.items.push({ productId, price: price || product.productPrice, quantity });
    }

    await cart.save();

    // Populate the cart before returning to avoid a second redundant API call from the frontend
    await cart.populate('items.productId');
    res.status(200).json(cart);
  } catch (err) {
    console.error("Add Cart Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateItemQuantity = async (req, res) => {
  console.log("Updating quantity:", req.body);
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
      console.log("Item not found for update:", productId);
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (err) {
    console.error("Update Cart Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.removeFromCart = async (req, res) => {
  console.log("Removing item:", req.body);
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
        console.log("Found orphan/corrupt cart item:", JSON.stringify(item));
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
  const cart = await Cart.findOne({ userId: req.user.id, status: "pending" });
  if (!cart) return res.status(404).json({ message: "Cart empty" });

  cart.status = "checkedout";
  await cart.save();

  res.json({ message: "Checkout successful" });
};

exports.mergeCart = async (req, res) => {
  const { items } = req.body;
  if (!items || items.length === 0) return res.status(200).json({ message: "No items to merge" });

  let cart = await Cart.findOne({ userId: req.user.id, status: "pending" });

  if (!cart) {
    cart = new Cart({ userId: req.user.id, items: [] });
  }

  // Iterate through guest items and add/update them in user cart
  items.forEach(guestItem => {
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === guestItem.productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if exists
      cart.items[existingItemIndex].quantity += guestItem.quantity;
    } else {
      // Add new item
      cart.items.push({
        productId: guestItem.productId,
        price: guestItem.price,
        quantity: guestItem.quantity
      });
    }
  });

  await cart.save();
  res.status(200).json({ message: "Cart merged", cart });
};
