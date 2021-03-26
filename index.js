const express = require('express');
const cors = require('cors');
const app = express();
const admin = require('firebase-admin');
require('dotenv').config();
app.use(cors());
app.use(express.json());
const port = 3002;
// console.log(process.env.DB_PASS);
// console.log(process.env.DB_USER);

var serviceAccount = require("./configs/burj-al-arab-e8d3a-firebase-adminsdk-ixriw-036d98fe9c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})



const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzoti.mongodb.net/burjalarab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookingCollection = client.db("burjalarab").collection("bookings");
  console.log("Database connected successfully");
    // Post data from ui
    app.post('/addbooking',(req,res)=>{
        const newBooking = req.body;
        bookingCollection.insertOne(newBooking)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    // Send data to ui
    app.get('/bookingdata',(req,res)=>{
      const bearer = req.headers.authorization;
      if(bearer && bearer.startsWith('Bearer ')){
        const idToken = bearer.split(' ')[1];
        // console.log({idToken});

        admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if(tokenEmail == req.query.email){
            bookingCollection.find({email:req.query.email})
          .toArray((err,documents)=>{
              res.send(documents);
          })
          }else{
            res.status(401).send('Un-authorized access');
          }
          // ...
        })
        .catch((error) => {
          res.status(401).send('Un-authorized access');
        });

      }else{
        res.status(401).send('Un-authorized access');
      }
    })
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})