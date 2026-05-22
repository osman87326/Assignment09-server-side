# 🏟️  Sport Nest Server Side

> RESTful API server for the SportNest sports facility booking platform. Handles all data operations for facilities and bookings with JWT-based authentication.

---

## 📌 Purpose

This is the backend of sport nest — a Node.js + Express REST API that connects to MongoDB. It serves facility and booking data to the Next.js frontend, and protects sensitive routes using JWT verification via JWKS (JSON Web Key Set).

---

## ✨ Features

- 🏟️ **Facilities CRUD** — Create, read, update, and delete sports facilities
- 📅 **Booking System** — Insert and retrieve bookings per user email
- 🔍 **Search** — Full-text regex search on facility names
- 🎯 **Filter** — Filter facilities by sports type using MongoDB `$in` query
- 🔒 **JWT Verification** — Protected routes verified via remote JWKS from Better Auth
- 🗑️ **Delete Booking** — Users can cancel their bookings

---

## 🛠️ Technologies Used

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (via MongoDB Node Driver) |
| Auth | JWKS + JWT (`jose-cjs`) |
| Config | dotenv |
| Deployment | Vercel |

---

## 📦 NPM Packages Used

```
express
cors
mongodb
jose-cjs
dotenv
```

---

## 🗂️ Project Structure

```
server-side/
├── index.js          # Main server file — all routes and DB logic
├── db.json           # Local sample data (for reference)
├── vercel.json       # Vercel deployment config
├── package.json
└── .gitignore
```

---

## 🌐 API Endpoints

### Facilities

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/facilities` | ❌ | Get all facilities |
| GET | `/facilities/search?searchedValue=` | ❌ | Search by name |
| GET | `/facilities/:id` | ✅ | Get single facility |
| POST | `/facilities` | ✅ | Add new facility |
| PATCH | `/facilities/:id` | ✅ | Update facility |
| DELETE | `/facilities/:id` | ✅ | Delete facility |
| GET | `/facilitiesByEmail/:email` | ✅ | Get facilities by owner email |
| POST | `/facilities/filter` | ❌ | Filter by sports type array |

### Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/myBookings` | ✅ | Create a booking |
| GET | `/myBookingsByEmail/:email` | ✅ | Get bookings by user email |
| DELETE | `/myBookings/:id` | ✅ | Cancel a booking |

> ✅ = Requires `Authorization: Bearer <token>` header

---

## ⚙️ Core Implementation Concepts

### 1. 🔒 JWT Verification Middleware — JWKS

Instead of storing a static secret, the server fetches the **public key dynamically** from the frontend's Better Auth JWKS endpoint. Every protected request is verified against this key.

---

### 2. 🔍 Search — Regex Query

Each word in the search string is matched independently using MongoDB `$regex` with `$and`, making it flexible for partial and multi-word searches.

---

### 3. 🎯 Filter — MongoDB `$in` Operator

The frontend sends an array of selected sports types. The server uses MongoDB's `$in` operator to return only matching facilities. If the array is empty, all facilities are returned.

---

### 4. 📅 Booking by User Email

Bookings are stored with a `user_email` field. The server retrieves bookings by filtering on that field — no complex joins needed.

---

### 5. ⚙️ Facility Update — Dynamic `$set`

The PATCH route accepts any partial data from the frontend and wraps it with MongoDB's `$set` operator, so only the provided fields are updated.

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone 
cd  server-side

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a .env file with:
MONGODB_URI=your_mongodb_connection_string
DATABASE_URL=5000
CLIENT_URL=https://your-frontend.vercel.app

# 4. Run the server
node index.js
```

---

## 👤 Author

**Kazi Md Osman Goni**
GitHub: [osman873](https://github.com/osman87326)