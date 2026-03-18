const Menu = require('../models/Menu');

const seedMenu = async () => {
  const count = await Menu.countDocuments();
  if (count > 0) {
    console.log(`Menu already has ${count} items — skipping seed ✅`);
    return;
  }

  await Menu.insertMany([
    // ═══════════════════════════════════════
    //           FAST FOOD CATEGORY
    // ═══════════════════════════════════════

    // — Zinger —
    {
      _id: "65d4f1a2e4b0a1b2c3d4e5f1",
      productCategory: "Fast Food",
      productSubCategory: "Zinger",
      productName: "Zinger Burger",
      productPrice: 350,
      productDescription: "Crispy zinger patty with lettuce, mayo, and special sauce in a toasted bun"
    },
    {
      _id: "65d4f1a2e4b0a1b2c3d4e5f2",
      productCategory: "Fast Food",
      productSubCategory: "Zinger",
      productName: "Double Zinger Burger",
      productPrice: 550,
      productDescription: "Two crispy zinger patties stacked with cheese, jalapenos, and signature sauce"
    },

    // — Fried Chicken —
    {
      _id: "65d4f1a2e4b0a1b2c3d4e5f3",
      productCategory: "Fast Food",
      productSubCategory: "Fried Chicken",
      productName: "Fried Chicken (2pc)",
      productPrice: 300,
      productDescription: "Golden crispy fried chicken pieces with a blend of secret spices"
    },
    {
      _id: "65d4f1a2e4b0a1b2c3d4e5f4",
      productCategory: "Fast Food",
      productSubCategory: "Fried Chicken",
      productName: "Spicy Wings (6pc)",
      productPrice: 350,
      productDescription: "Hot and spicy chicken wings tossed in our signature chili glaze"
    },

    // — Shawarma —
    {
      _id: "65d4f1a2e4b0a1b2c3d4e5f5",
      productCategory: "Fast Food",
      productSubCategory: "Shawarma",
      productName: "Chicken Shawarma",
      productPrice: 250,
      productDescription: "Juicy grilled chicken wrapped in fresh pita with garlic sauce and pickles"
    },
    {
      _id: "65d4f1a2e4b0a1b2c3d4e5f6",
      productCategory: "Fast Food",
      productSubCategory: "Shawarma",
      productName: "Beef Shawarma",
      productPrice: 300,
      productDescription: "Tender beef slices with tahini, vegetables, and spices in a warm pita wrap"
    },

    // — Fries —
    {
      _id: "65d4f1a2e4b0a1b2c3d4e5f7",
      productCategory: "Fast Food",
      productSubCategory: "Fries",
      productName: "French Fries",
      productPrice: 150,
      productDescription: "Crispy golden french fries seasoned with salt and served hot"
    },
    {
      _id: "65d4f1a2e4b0a1b2c3d4e5f8",
      productCategory: "Fast Food",
      productSubCategory: "Fries",
      productName: "Loaded Fries",
      productPrice: 300,
      productDescription: "Fries loaded with melted cheese, jalapenos, and ranch sauce"
    },

    // ═══════════════════════════════════════
    //             BBQ CATEGORY
    // ═══════════════════════════════════════

    // — Seekh Kabab —
    {
      _id: "65d4f1a2e4b0a1b2c3d4e601",
      productCategory: "BBQ",
      productSubCategory: "Seekh Kabab",
      productName: "Chicken Seekh Kabab",
      productPrice: 200,
      productDescription: "Spiced minced chicken skewered and grilled over open flame"
    },
    {
      _id: "65d4f1a2e4b0a1b2c3d4e602",
      productCategory: "BBQ",
      productSubCategory: "Seekh Kabab",
      productName: "Beef Seekh Kabab",
      productPrice: 250,
      productDescription: "Premium beef mince with herbs and spices, charcoal grilled to perfection"
    },

    // — Tikka Boti —
    {
      _id: "65d4f1a2e4b0a1b2c3d4e603",
      productCategory: "BBQ",
      productSubCategory: "Tikka Boti",
      productName: "Tikka Boti",
      productPrice: 400,
      productDescription: "Boneless chicken pieces marinated in traditional spices and grilled"
    },
    {
      _id: "65d4f1a2e4b0a1b2c3d4e604",
      productCategory: "BBQ",
      productSubCategory: "Tikka Boti",
      productName: "Special Tikka Boti",
      productPrice: 500,
      productDescription: "Premium tikka boti with extra herbs, served with mint chutney"
    },

    // — Malai Boti —
    {
      _id: "65d4f1a2e4b0a1b2c3d4e605",
      productCategory: "BBQ",
      productSubCategory: "Malai Boti",
      productName: "Malai Boti",
      productPrice: 450,
      productDescription: "Creamy, tender chicken boti marinated in yogurt and mild spices"
    },
    {
      _id: "65d4f1a2e4b0a1b2c3d4e606",
      productCategory: "BBQ",
      productSubCategory: "Malai Boti",
      productName: "Creamy Malai Boti",
      productPrice: 550,
      productDescription: "Extra creamy malai boti with cheese and cream, a rich delight"
    },

    // — Chicken Tikka —
    {
      _id: "65d4f1a2e4b0a1b2c3d4e607",
      productCategory: "BBQ",
      productSubCategory: "Chicken Tikka",
      productName: "Chicken Tikka",
      productPrice: 450,
      productDescription: "Classic bone-in chicken tikka with smoky charcoal flavor"
    },
    {
      _id: "65d4f1a2e4b0a1b2c3d4e608",
      productCategory: "BBQ",
      productSubCategory: "Chicken Tikka",
      productName: "Afghani Chicken Tikka",
      productPrice: 550,
      productDescription: "Afghani-style creamy chicken tikka with a mild, aromatic taste"
    },

    // ═══════════════════════════════════════
    //             RICE CATEGORY
    // ═══════════════════════════════════════

    // — Biryani —
    {
      _id: "65d4f1a2e4b0a1b2c3d4e609",
      productCategory: "Rice",
      productSubCategory: "Biryani",
      productName: "Chicken Biryani",
      productPrice: 350,
      productDescription: "Fragrant basmati rice layered with spiced chicken and saffron"
    },
    {
      _id: "65d4f1a2e4b0a1b2c3d4e610",
      productCategory: "Rice",
      productSubCategory: "Biryani",
      productName: "Mutton Biryani",
      productPrice: 550,
      productDescription: "Slow-cooked mutton biryani with rich aromatic spices and raita"
    },

    // — Pulao —
    {
      _id: "65d4f1a2e4b0a1b2c3d4e611",
      productCategory: "Rice",
      productSubCategory: "Pulao",
      productName: "Chicken Pulao",
      productPrice: 300,
      productDescription: "Lightly spiced rice cooked with tender chicken pieces and whole spices"
    },
    {
      _id: "65d4f1a2e4b0a1b2c3d4e612",
      productCategory: "Rice",
      productSubCategory: "Pulao",
      productName: "Beef Pulao",
      productPrice: 400,
      productDescription: "Aromatic beef pulao with caramelized onions and fragrant spices"
    },
  ]);

  console.log("Menu seeded successfully ✅ (22 items across 3 categories)");
};

module.exports = seedMenu;
