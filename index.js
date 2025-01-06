const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//middleware
app.use(cors())
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j0hxo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

	const menuCollection = client.db('bistroDB').collection('menu');
	const reviewsCollection = client.db('bistroDB').collection('reviews');
  const cartCollection = client.db('bistroDB').collection('carts');
  const userCollection = client.db('bistroDB').collection('users');


  //users related apis
  app.post('/users', async(req, res)=>{
    const user = req.body;

    //insert email if user doesn't exist
    //you can do this many ways (1. email unique, 2. upsert, 3. simple checking)

    const query = { email: user.email};
    const existingUser = await userCollection.findOne(query);
    if(existingUser) {
      return res.send({message: 'user already exists', insertedId: null})
    }
    const result = await userCollection.insertOne(user);
    res.send(result);
  })

  //get users collection 
  app.get('/users', async(req, res) =>{
    const result = await userCollection.find().toArray();
    res.send(result);
  })

	//all data load
	app.get('/menu', async(req, res) =>{
		const result = await menuCollection.find().toArray();
		res.send(result);
	})

	//reviews api
	app.get('/reviews', async(req, res) =>{
		const result = await reviewsCollection.find().toArray();
		res.send(result);
	})

  // cart collection

  app.get('/carts', async (req, res)=>{
    const email = req.query.email;
    const query = { email: email};
    const result = await cartCollection.find(query).toArray();
    res.send(result);
  })


  app.post('/carts', async (req, res)=>{
    const cartItem = req.body;
    const result = await cartCollection.insertOne(cartItem);
    res.send(result);
  })

  //delete operation 
  app.delete('/carts/:id', async (req, res)=>{
    const id = req.params.id;
    const query = { _id: new ObjectId(id)};
    const result = await cartCollection.deleteOne(query);
    res.send(result);
  })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


//
app.get('/', (req, res) =>{
	res.send('boss is sitting')
})

app.listen(port, () =>{
	console.log(`Bistro boss is sitting on port ${port}`);
})


/**
 * naming convention
 * ---------------
 * app.get('/users')
 * app.get('/users/:id')
 * app.post('/users')
 * app.put('/users/:id')
 * app.patch('/users/:id')
 * app.delete('/users/:id')
 */