const express = require('express');
const app = express();
require('dotenv').config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { error } = require('console');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@tourtide.xzqjgqd.mongodb.net/?retryWrites=true&w=majority&appName=tourTide`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run (){
    try{
        await client.connect();

        const addPackagesCollection = client.db('addPackages').collection('packages-collection');
        const bookingCollection = client.db('addPackages').collection("bookings");


        // call api for 6 card data for the home page
        app.get('/tour-card-data', async(req,res)=>{
            const result = await addPackagesCollection.find().limit(6).toArray();
            res.send(result);
        })

        // call single api for the home page details

        app.get('/tour-card-data/details/:id',async(req,res)=>{
            const id = req.params.id;
            const newDetailsId = new ObjectId(id);

            try{
                const tourCardDetails = await addPackagesCollection.findOne({_id: newDetailsId})
                res.send(tourCardDetails)
            }catch(error){
                res.send({error: 'field to find details'})
            }
        })



        // call api for the all package data it will render in all package page
        app.get('/all-packages', async(req,res)=>{
            const result = await addPackagesCollection.find().toArray();
            res.send(result)
        })



        // send data to db 
        app.post('/add-tour-packages', async(req,res)=>{
            const newPackage = req.body;
            console.log(newPackage);
            const result = await addPackagesCollection.insertOne(newPackage)
            res.send(result)
        })



        // get the data from the db for booking collection
        app.get('/bookings-collection',async(req,res)=>{
            const result = await bookingCollection.find().toArray();
            res.send(result);
        })

        // get single booking data by using tour_id 
        app.get('/bookings-collection/:id',async(req,res)=>{
            const id = req.params.id;
            // const objectId = new ObjectId(id);

            try{
                const bookingCount = await bookingCollection.find({tour_id: id}).toArray();
                res.send(bookingCount)
            }catch(error){
                res.send({
                    error: error.message
                })
            }
        })


        // updated status part for my-booking route

        app.patch('/bookings/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            console.log(id,query)

            const update = {$set: {status: "Completed"}};

            try{
                const result = await bookingCollection.updateOne(query,update)
                res.send(result)
            }catch(error){
                res.status(404).send({error: error.message});
            }
        })


        // send data to db for the booking collection
        app.post('/bookings',async(req,res)=>{
            const newBooking = req.body;
            const result = await bookingCollection.insertOne(newBooking);
            res.send(result)
        })

        // find my-booking data using buyer email

        app.get('/my-bookings',async(req,res)=>{
            const email = req.query.email;

            if(!email){
                return res.send({error: 'Email is require'})
            }

            try{
                const bookings = await bookingCollection.find({buyer_email: email}).toArray();
                res.send(bookings)
            }catch(error){
                res.status(500).send({error: error.message});
            }
        })


        await client.db("admin").command({ping: 1});
        console.log('mongodb connected successfully');
    }finally{
        // await client.close()
    }
}

run().catch(console.dir)

app.get('/',(req,res)=>{
    res.send('hello world');
})
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})