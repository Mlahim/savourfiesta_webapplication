# SavourFiesta — Backend (Node.js + Express)

A production-ready RESTful API server powering the **SavourFiesta** hotel food ordering and management system.

## Features

- **Authentication & Authorization** — JWT-based user signup, login, and role-based admin access.
- **Menu Management** — Full CRUD for food items. Supports image uploads to **Cloudinary** with automatic optimization.
- **Order Management** — Complete order lifecycle: placement, status tracking (Pending → Confirmed → Preparing → Enroute → Delivered), rejection, and delivery failure handling.
- **Delivery Settings** — Admin-configurable delivery charges stored in MongoDB.
- **Email Notifications** — Transactional emails via Nodemailer (Mailtrap for development).
- **Guest & Authenticated Checkout** — Supports both guest and logged-in user order flows.

## Tech Stack

| Layer       | Technology                      |
|-------------|---------------------------------|
| Runtime     | Node.js                         |
| Framework   | Express.js                      |
| Database    | MongoDB Atlas (via Mongoose)    |
| Auth        | JSON Web Tokens (JWT)           |
| File Upload | Multer + Cloudinary             |
| Email       | Nodemailer (Mailtrap sandbox)   |

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB instance)
- Cloudinary account

### Installation

```bash
git clone <repo-url>
cd hotelManagementSystem(NodeJs)
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_KEY=your_jwt_secret
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_pass
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Run

```bash
node index.js
```

Server starts on `http://localhost:5000`

## API Endpoints

| Method | Endpoint                      | Description                      |
|--------|-------------------------------|----------------------------------|
| POST   | `/api/auth/signup`            | Register a new user              |
| POST   | `/api/auth/login`             | Login and receive JWT            |
| GET    | `/api/menu`                   | Get all menu items               |
| POST   | `/api/menu`                   | Add a new menu item (Admin)      |
| DELETE | `/api/menu/:id`               | Delete a menu item (Admin)       |
| POST   | `/api/order`                  | Place a new order                |
| GET    | `/api/order/admin/all`        | Get all orders (Admin)           |
| PUT    | `/api/order/admin/:id/status` | Update order status (Admin)      |
| GET    | `/api/settings`               | Get delivery settings            |
| PUT    | `/api/settings/delivery-charge` | Update delivery charge (Admin) |

## License

This project is for educational and portfolio purposes.
