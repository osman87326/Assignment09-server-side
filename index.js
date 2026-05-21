require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;
const port = process.env.DATABASE_URL

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db("ArenaPulse");
    const facilityCollection = database.collection("facilities");
    const bookingCollection = database.collection("myBookings");

    //get
    app.get('/facilities', async (req, res) => {
      const result = await facilityCollection.find().toArray()
      res.json(result)
    })

    //search
    app.get('/facilities/search', async (req, res) =>{
      const {searchedValue} = req.query
      if(searchedValue.trim() === " "){
        const allFacilities = await facilityCollection.find().toArray();
        return res.json(allFacilities);
      }
      const query = { 
        $and: searchedValue?.trim().split(" ").map(q => ({
        name: { $regex: q, $options: "i" }
        }))
      }

       const result = await facilityCollection.find(query).toArray();
       res.json(result);
    })
 
    //get by id
    app.get("/facilities/:id", async (req, res) => {
      const id = req.params.id;
      const idBSON = { _id: new ObjectId(id) }
      const result = await facilityCollection.findOne(idBSON)
      res.json(result)
      // console.log(result)
    })

    //post
    app.post("/facilities", async (req, res) => {
      const newFacility = req.body;
      const result = await facilityCollection.insertOne(newFacility)
      // console.log(result)
      res.json(result)
    })

    //get my facilities by email
    app.get("/facilitiesByEmail/:email", async (req, res) => {
      const email = req.params.email;
      const result = await facilityCollection.find({ owner_email: email }).toArray();
      res.json(result)
    })

    //delete
    app.delete("/facilities/:id", async (req, res) => {
      const id = req.params.id
      const idBSON = { _id: new ObjectId(id) }
      const result = await facilityCollection.deleteOne(idBSON)
      res.json(result)
    })

    //update
    app.patch('/facilities/:id', async (req, res) => {
      const getId = req.params.id
      const findId = { _id: new ObjectId(getId) }
      const data = req.body;

      const gotModifiedData = {
        $set: data
      };
      // console.log(modifiedData)
      const result = await facilityCollection.updateOne(findId, gotModifiedData)
      res.json(result)
    })

    //booking
    app.post("/myBookings", async (req, res) => {
      const bookingData = req.body;
      // console.log(bookingData)
      const result = await bookingCollection.insertOne(bookingData)
      res.json(result)
    })

    //get bookingData by userEemail
    app.get("/myBookingsByEmail/:email", async (req, res) => {
      const email = req.params.email;
      const result = await bookingCollection.find({ user_email: email }).toArray();
      res.json(result)
    })

    //delete bookingData
    app.delete("/myBookings/:id", async (req, res) => {
      const bookingId = req.params.id
      const idBSON = { _id: new ObjectId(bookingId) }
      const result = await bookingCollection.deleteOne(idBSON)
      res.json(result)
    })

    //filter 
    app.post("/facilities/filter", async (req, res) => {
      const sportsArray = req.body;
      if (sportsArray.length === 0) {
        const allFacilities = await facilityCollection.find().toArray();
        return res.json(allFacilities);
      }
      const query = {
        facility_type: { $in: sportsArray }
      };
      const filteredResult = await facilityCollection.find(query).toArray();
      res.json(filteredResult);
    });

    











    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})