const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { error } = require("console");

const port = process.env.PORT || 3000;

const allowedOrigins = [
  {
    origin: [process.env.BASE_URL, process.env.LOCAL_URL],
  },
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

const serviceAccount = require("./firebaseAdmin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  try {
    // console.log(token)
    const decoded = await admin.auth().verifyIdToken(token);
    // console.log('decoded-token', decoded);
    req.decoded = decoded;
    next();
  } catch (error) {
    // console.error("Token verification failed:", error);
    return res.status(401).send({ message: "Unauthorized - token invalid" });
  }
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@tourtide.xzqjgqd.mongodb.net/?retryWrites=true&w=majority&appName=tourTide`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const addPackagesCollection = client
      .db("addPackages")
      .collection("packages-collection");
    const bookingCollection = client.db("addPackages").collection("bookings");

    // call api for 6 card data for the home page
    app.get("/tour-card-data", async (req, res) => {
      const result = await addPackagesCollection.find().limit(6).toArray();
      res.send(result);
    });

    // call single api for the home page details

    app.get("/tour-card-data/details/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const newDetailsId = new ObjectId(id);
      const email = req.query.email;

      try {
        const tourCardDetails = await addPackagesCollection.findOne({
          _id: newDetailsId,
        });

        // console.log('Sending tour card details:', tourCardDetails);
        res.send(tourCardDetails);
      } catch (error) {
        res.send({ error: "Failed to find details" });
      }
    });

    // Jwt token
    app.post("/jwt", async (req, res) => {
      const { access_token } = req.body;

      try {
        const decodedUser = await admin.auth().verifyIdToken(access_token);
        const token = jwt.sign(
          { email: decodedUser.email },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1h" }
        );
        res.send({ token });
      } catch (error) {
        // console.error('Firebase Token verification failed:', error);
        res.status(401).send({ message: "Invalid Firebase token" });
      }
    });

    // search functionality
    app.get("/all-packages/search", async (req, res) => {
      const text = req.query.text;
      const query = {
        $or: [
          { tourName: { $regex: text, $options: "i" } },
          { destination: { $regex: text, $options: "i" } },
        ],
      };

      try {
        const result = await addPackagesCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res
          .status(500)
          .send({ message: "Error during search", error: error.message });
      }
    });

    // call api for the all package data it will render in all package page
    app.get("/all-packages", async (req, res) => {
      const result = await addPackagesCollection.find().toArray();
      res.send(result);
    });

    // single package for show update field
    app.get("/package/:id", async (req, res) => {
      const id = req.params.id;
      const packageId = new ObjectId(id);

      try {
        const result = await addPackagesCollection.findOne({ _id: packageId });
        res.send(result);
      } catch (error) {
        res.send({ error: error.message });
      }
    });

    app.patch("/packages/increment-booking/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await addPackagesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { bookingCount: 1 } }
        );
        res.send(result);
      } catch (error) {
        res.send({ error: error.message });
      }
    });

    // delete package api

    app.delete("/package/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      try {
        const result = await addPackagesCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // update packages
    app.patch("/package/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: updateData,
      };

      try {
        const result = await addPackagesCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        res.send({ error: error.message });
      }
    });

    app.get("/all-packages/manage-package", verifyToken, async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res.send({ error: "Email is require" });
      }

      if (email != email) {
        res.status(401).send({ message: "Unauthorized access" });
      }

      try {
        const managePackage = await addPackagesCollection
          .find({ email: email })
          .toArray();
        res.send(managePackage);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // send data to db
    app.post("/add-tour-packages", verifyToken, async (req, res) => {
      const newPackage = req.body;
      console.log(newPackage);
      const result = await addPackagesCollection.insertOne(newPackage);
      res.send(result);
    });

    // get the data from the db for booking collection
    app.get("/bookings-collection", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });

    // get single booking data by using tour_id
    app.get("/bookings-collection/:id", async (req, res) => {
      const id = req.params.id;
      // const objectId = new ObjectId(id);

      try {
        const bookingCount = await bookingCollection
          .find({ tour_id: id })
          .toArray();
        res.send(bookingCount);
      } catch (error) {
        res.send({
          error: error.message,
        });
      }
    });

    // updated status part for my-booking route

    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(id, query);

      const update = { $set: { status: "Completed" } };

      try {
        const result = await bookingCollection.updateOne(query, update);
        res.send(result);
      } catch (error) {
        res.status(404).send({ error: error.message });
      }
    });

    // send data to db for the booking collection
    app.post("/bookings", async (req, res) => {
      const newBooking = req.body;
      const result = await bookingCollection.insertOne(newBooking);
      res.send(result);
    });

    // find my-booking data using buyer email

    app.get("/my-bookings", verifyToken, async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res.send({ error: "Email is require" });
      }

      if (email != req.decoded.email) {
        res.status(401).send({ message: "Unauthorized access" });
      }

      try {
        const bookings = await bookingCollection
          .find({ buyer_email: email })
          .toArray();
        res.send(bookings);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log("mongodb connected successfully");
  } finally {
    // await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello world");
});
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
