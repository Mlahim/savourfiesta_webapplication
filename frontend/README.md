# SavourFiesta — Frontend (React + Vite)

The customer-facing and admin dashboard frontend for the **SavourFiesta** hotel food ordering and management system. Built with React and Vite for blazing-fast development and production performance.

## Features

### Customer Side
- **Dynamic Menu** — Browse food items organized by category and subcategory with beautiful product cards.
- **Cart System** — Add to cart, adjust quantities, and checkout seamlessly (supports both guest and authenticated users).
- **Order Tracking** — Real-time order status tracking from placement to delivery.
- **Responsive Design** — Fully optimized for mobile, tablet, and desktop screens.

### Admin Dashboard
- **Order Management** — Dashboard with status-based cards (Pending, Confirmed, Preparing, Enroute, Delivered, Rejected, Delivery Failed). Each status opens a detailed order list page for easy management.
- **Menu Management** — Add, edit, and delete food items directly from the dashboard. Supports image upload to Cloudinary, category/subcategory assignment with autocomplete suggestions, and price management.
- **Delivery Settings** — Configure global delivery charges.
- **Sales Analytics** — Date-filtered sales reports showing itemized product breakdowns, quantities sold, subtotals, and grand totals. Includes "All Time" view and real-time background polling.

## Tech Stack

| Layer       | Technology                             |
|-------------|----------------------------------------|
| Framework   | React 19 + Vite                        |
| Routing     | React Router DOM                       |
| HTTP Client | Axios (with JWT interceptors)          |
| Icons       | Lucide React                           |
| Toasts      | React Hot Toast                        |
| Styling     | Tailwind CSS                           |

## Getting Started

### Prerequisites
- Node.js v18+
- Backend server running on `http://localhost:5000`

### Installation

```bash
git clone <repo-url>
cd hotel-management-system(reactJs)
npm install
```

### Run

```bash
npm run dev
```

App starts on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── api/          # Axios instance with JWT interceptors
├── components/   # Reusable UI components (Navbar, Footer, etc.)
├── context/      # React Context providers (Auth, Cart)
├── pages/        # Page components
│   ├── AdminDashboard.jsx   # Full admin panel (Orders, Menu, Delivery, Analytics)
│   ├── AdminOrdersList.jsx  # Status-filtered detailed order list
│   ├── Checkout.jsx         # Guest & authenticated checkout flow
│   └── ...
└── App.jsx       # Main app with routing
```

## License

This project is for educational and portfolio purposes.
