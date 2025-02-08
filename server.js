const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");

app.use(express.json());
app.use(cors());

let uri = `mongodb+srv://ceciljr16777:joshuakk777@cluster0.3zob8dl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let user;
let data;

async function mongo() {
  const mongo = new MongoClient(uri);
  await mongo.connect();
  console.log("db connected");

  const database = await mongo.db("SnakeGame");
  user = await database.createCollection("users");
  data = await database.createCollection("gamedata");
  console.log("collection created");
}

mongo();

app.post("/login", async (req, res) => {
  try {
    const { query, password } = req.body;
    const check = await user.findOne({
      $and: [
        { $or: [{ username: query }, { email: query }, { phone: query }] },
        { password: password },
      ],
    });
    if (check) {
      res.json("allow");
    } else {
      res.json("credential error");
    }
  } catch (err) {
    console.error(err);
  }
});

app.post("/register", async (req, res) => {
  const { username, email, phone, password } = req.body;
  try {
    const userdata = await user.insertOne({ username, email, phone, password });
    res.json("added");
  } catch (err) {
    console.error(err);
  }
});

const date = new Date();
app.post("/store", async (req, res) => {
  const { user, winner, score } = req.body;
  const time = date.getTime();
  try {
    const store = await data.insertOne({ user, time, winner, score });
    res.send("stored");
  } catch (err) {
    console.error(err);
  }
});

app.get("/", async (requestAnimationFrame, res) => {
  res.send("snake game");
});

app.listen(5000);

// app.post('register', async(req,res)=>{
//     try{}
//     catch(err){
//         console.error(err)
//     }
// })
