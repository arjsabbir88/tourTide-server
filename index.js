const express = require('express');
const app = express();
require('dotenv').config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');

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


        // call api for 6 card data for the home page
        app.get('/tour-card-data', async(req,res)=>{
            const result = await addPackagesCollection.find().limit(6).toArray();
            res.send(result);
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