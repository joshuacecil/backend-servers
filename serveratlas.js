const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");

app.use(express.json());
app.use(cors());

let uri = `mongodb+srv://ceciljr16777:joshuakk777@cluster0.3zob8dl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let userCollection;
let chatCollection;
async function mongo() {
  const mongo = new MongoClient(uri);
  await mongo.connect();
  console.log("db connected");

  const database = await mongo.db("chatApp");
  userCollection = await database.createCollection("users");
  chatCollection = await database.createCollection("group");
  console.log("collection created");
}

mongo()

function random() {
  const hex = "ABCDEF0123456789";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += hex[Math.floor(Math.random() * hex.length)];
  }
  return color;
}

app.post("/createuser", async (req, res) => {
  let { username, email, password } = req.body;
  let color = random();
  try {
    const user = await userCollection.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (!user) {
      const document = await new userCollection.insertOne({
        username,
        email,
        password,
        color,
      });
      await document.save();
      res.send("created");
    } else {
      res.send("user already exist");
    }
  } catch {
    console.error();
  }
});

app.put("/message", async (req, res) => {
  let { username, message, time, color } = req.body;
  const document = await chatCollection.updateOne(
    { groupId: 3 },
    {
      $push: {
        messages: {
          username: username,
          message: message,
          time: time,
          color: color,
        },
      },
    }
  );
});
app.post("/messagepo", async (req, res) => {
  try {
    let { username, message, time, color } = req.body;
    const document = await chatCollection.updateOne(
      { groupId: 3 },
      {
        $push: {
          messages: {
            username: username,
            message: message,
            time: time,
            color: color,
          },
        },
      }
    );

    if (document.modifiedCount > 0) {
      res
        .status(200)
        .json({ success: true, message: "Message added successfully" });
    } else {
      res.status(404).json({ success: false, message: "Group not found" });
    }
  } catch (error) {
    console.error("Error updating messages:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/group", async (req, res) => {
  const { id, message } = req.body;
  const document = new chatCollection({ id, message });
  await document.save();
  res.send("created");
});

app.get("/chatdata", async (req, res) => {
  const document = await chatCollection.findOne();
  res.json(document);
});

app.listen(5000, () => {
  console.log("listening");
});

app.post("/login", async (req, res) => {
  let { query, password } = req.body;
  try {
    const user = await userCollection.findOne({
      $or: [{ username: query }, { email: query }],
    });
    if (user) {
      if (user.password === password) {
        res.json({
          status: "success",
          username: user.username,
          color: user.color,
        });
      } else {
        res.json("password not correct");
      }
    } else {
      res.json("no account found");
    }
  } catch {
    console.error();
  }
});
