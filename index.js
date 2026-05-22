require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ✅ FIX: backend-safe env (NOT NEXT_PUBLIC)
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.BETTER_AUTH_URL}/api/auth/jwks`)
);

// ===================== JWT MIDDLEWARE =====================
const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

// ===================== DB ROUTES =====================
async function run() {
  try {
    await client.connect();

    const database = client.db("sport-nest");
    const facilityCollection = database.collection("facilities");
    const bookingCollection = database.collection("myBookings");

    console.log("MongoDB connected successfully!");

    // ---------- GET ALL FACILITIES ----------
    app.get("/facilities", async (req, res) => {
      const result = await facilityCollection.find().toArray();
      res.json(result);
    });

    // ---------- SEARCH FACILITIES ----------
    app.get("/facilities/search", async (req, res) => {
      const searchedValue = String(req.query.searchedValue || "").trim();

      if (!searchedValue) {
        const all = await facilityCollection.find().toArray();
        return res.json(all);
      }

      const parts = searchedValue.split(" ").filter(Boolean);

      const query = parts.length
        ? {
            $and: parts.map((q) => ({
              name: { $regex: q, $options: "i" },
            })),
          }
        : {};

      const result = await facilityCollection.find(query).toArray();
      res.json(result);
    });

    // ---------- GET BY ID ----------
    app.get("/facilities/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const result = await facilityCollection.findOne({
        _id: new ObjectId(id),
      });

      res.json(result);
    });

    // ---------- CREATE FACILITY ----------
    app.post("/facilities", verifyToken, async (req, res) => {
      const result = await facilityCollection.insertOne(req.body);
      res.json(result);
    });

    // ---------- GET BY EMAIL ----------
    app.get("/facilitiesByEmail/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const result = await facilityCollection.find({ owner_email: email }).toArray();
      res.json(result);
    });

    // ---------- DELETE FACILITY ----------
    app.delete("/facilities/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const result = await facilityCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.json(result);
    });

    // ---------- UPDATE FACILITY ----------
    app.patch("/facilities/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const result = await facilityCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: req.body }
      );

      res.json(result);
    });

    // ---------- BOOKINGS ----------
    app.post("/myBookings", verifyToken, async (req, res) => {
      const result = await bookingCollection.insertOne(req.body);
      res.json(result);
    });

    app.get("/myBookingsByEmail/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const result = await bookingCollection.find({ user_email: email }).toArray();
      res.json(result);
    });

    app.delete("/myBookings/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const result = await bookingCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.json(result);
    });

    // ---------- FILTER ----------
    app.post("/facilities/filter", async (req, res) => {
      const sportsArray = req.body;

      if (!sportsArray || sportsArray.length === 0) {
        const all = await facilityCollection.find().toArray();
        return res.json(all);
      }

      const query = {
        facility_type: { $in: sportsArray },
      };

      const result = await facilityCollection.find(query).toArray();
      res.json(result);
    });
  } finally {
    // keep connection alive
  }
}

run().catch(console.dir);

// ---------- ROOT ----------
app.get("/", (req, res) => {
  res.send("Server is running");
});

// ---------- START SERVER ----------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});



// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.09uzkpk.mongodb.net/?appName=Cluster0";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
// user:sport-nest
// password: WG6r13SgGsOqCMa2

