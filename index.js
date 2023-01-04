const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log(authHeader);
  if (!authHeader) {
    return res.status(401).send({ error: 401, message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ error: 403, message: "Forbidded Access" });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    const usersCollection = client.db("gymdb").collection("users");
    const membersCollection = client.db("gymdb").collection("members");
    const dietCollection = client.db("gymdb").collection("diet");
    const groupsCollection = client.db("gymdb").collection("groups");
    const paymentsCollection = client.db("gymdb").collection("payments");
    const notificationCollection = client
      .db("gymdb")
      .collection("notifications");

    // verify admin
    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "admin") {
        return res
          .status(403)
          .send({ error: 403, message: "forbidden access" });
      }
      next();
    };

    // verify trainer

    const verifyTrainer = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "trainer") {
        return res
          .status(403)
          .send({ error: 403, message: "forbidden access" });
      }
      next();
    };

    const verifyAdminOrTrainer = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "admin" && user?.role !== "trainer") {
        return res
          .status(403)
          .send({ error: 403, message: "forbidden access" });
      }
      next();
    };

    app.patch("/notification", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const notificationBody = req.body;
      const query = { email: email };
      const notification = await notificationCollection.findOne(query);

      if (notification) {
        const upData = [...notification.text, ...notificationBody.text];
        const updatedDoc = {
          $set: {
            text: upData,
          },
        };
        const result = await notificationCollection.updateOne(
          query,
          updatedDoc
        );
        return res.send(result);
      }

      const result = await notificationCollection.insertOne(notificationBody);
      res.send(result);
    });

    // create payment intent
    app.post("/create-payment-intent", async (req, res) => {
      const data = req.body;
      const price = data.fees;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // payments
    app.post("/payments", verifyJWT, async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);
      const id = payment.uId;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const updateResult = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // add or update fees
    app.patch("/fees", verifyJWT, verifyAdminOrTrainer, async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const updateDoc = {
        $set: { fees: user.fees },
      };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    // add or update salary
    app.patch("/salary", verifyJWT, verifyAdmin, async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const updateDoc = {
        $set: { salary: user.salary },
      };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // all groups
    app.get("/groups", verifyJWT, async (req, res) => {
      const groups = await groupsCollection.find({}).toArray();
      res.send(groups);
    });

    // add group
    app.post("/groups", verifyJWT, verifyAdminOrTrainer, async (req, res) => {
      const group = req.body;
      const result = await groupsCollection.insertOne(group);
      res.send(result);
    });

    // delete group
    app.delete(
      "/groups/:id",
      verifyJWT,
      verifyAdminOrTrainer,
      async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await groupsCollection.deleteOne(query);
        res.send(result);
      }
    );

    // add member to group
    app.patch("/groups", verifyJWT, verifyAdminOrTrainer, async (req, res) => {
      const name = req.query.name;
      const member = req.body;
      const query = { name: name };
      const group = await groupsCollection.findOne(query);
      const members = group.members;
      const isExist = members.find((m) => m.email === member.email);
      if (isExist) {
        return res.send({ error: 403, message: "member already exist" });
      }
      members.push(member);
      const updateDoc = {
        $set: { members: members },
      };
      const result = await groupsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // put diet data to db

    app.put("/diet", verifyJWT, verifyAdminOrTrainer, async (req, res) => {
      const diet = req.body;
      const email = diet.email;
      const query = { email: email, day: diet.day };
      const updateDoc = {
        $set: diet,
      };
      const result = await dietCollection.updateOne(query, updateDoc, {
        upsert: true,
      });
      res.send(result);
    });

    // get diet data from db
    app.get("/diet", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const day = req.query.day;
      const query = { email: email, day: day };
      const diet = await dietCollection.find(query).toArray();
      res.send(diet);
    });

    // add a member by verify trainer
    app.put("/members", verifyJWT, verifyAdminOrTrainer, async (req, res) => {
      const member = req.body;
      const email = member.email;
      const query = { email: email };
      const updateDoc = {
        $set: member,
      };
      const result = await membersCollection.updateOne(query, updateDoc, {
        upsert: true,
      });
      res.send(result);
    });

    app.get("/members", verifyJWT, async (req, res) => {
      const query = { role: "user" };
      const members = await membersCollection.find(query).toArray();
      res.send(members);
    });

    // get specific member
    app.get("/members/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await membersCollection.findOne(query);
      res.send(user);
    });

    // jwt
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "5d",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    // delete user and member

    app.delete("/users/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const checkEmail = req.decoded.email;
      const users = await usersCollection.find({}).toArray();
      const finduserone = users.find((user) => user.email === checkEmail);
      const findusertwo = users.find((user) => user.email === email);
      if (email === checkEmail) {
        return res.send({ error: 403, message: "You can't delete yourself" });
      } else if (finduserone.role === findusertwo.role) {
        return res.send({ error: 403, message: "You can't delete Trainer" });
      } else {
        const result = await usersCollection.deleteOne(query);
        const result2 = await membersCollection.deleteOne(query);
        res.send(result);
      }
    });

    // update user by admin or trainer
    app.patch("/users/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const userDB = await usersCollection.findOne(filter);

      const adminTrainer = req.decoded.email;
      const check = await usersCollection.findOne({ email: adminTrainer });

      if (check.role === "admin") {
        if (userDB.role === "trainer") {
          const updateTrainerDoc = {
            $set: {
              name: user.name,
            },
          };
          const result = await usersCollection.updateOne(
            filter,
            updateTrainerDoc
          );
          res.send(result);
        }

        if (userDB.role === "user") {
          const updateUserDoc = {
            $set: {
              name: user.name,
              role: user.role,
            },
          };
          const result = await usersCollection.updateOne(filter, updateUserDoc);
          res.send(result);
        }
      } else if (check.role === "trainer" && check.email === email) {
        const updateTrainerDoc = {
          $set: {
            name: user.name,
          },
        };
        const result = await usersCollection.updateOne(
          filter,
          updateTrainerDoc
        );
        res.send(result);
      } else if (userDB.role === "trainer" || userDB.role === "admin") {
        return res.send({ error: 403, message: "You can't update Trainer" });
      }
      const updateDoc = {
        $set: {
          name: user.name,
          role: user.role,
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // get all users for admin
    app.get("/users", verifyJWT, async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    // students
    app.get("/students", verifyJWT, async (req, res) => {
      const query = { role: "user" };
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    // trainers
    app.get("/trainers", verifyJWT, async (req, res) => {
      const query = { role: "trainer" };
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    // add a user
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // get a user
    app.get("/users/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });
    // active user
    app.patch("/users/active/:email", async (req, res) => {
      const email = req.params.email;
      const active = req.body.isActive;
      const query = { email: email };
      const updateDoc = {
        $set: { isActive: active },
      };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    // deactive user
    app.patch("/users/deactive/:email", async (req, res) => {
      const email = req.params.email;
      const active = req.body.isActive;
      const query = { email: email };
      const updateDoc = {
        $set: { isActive: active },
      };
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // check admin
    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    // check user
    app.get("/users/user/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isUser: user?.role === "user" });
    });

    // check trainer
    app.get("/users/trainer/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isTrainer: user?.role === "trainer" });
    });

    // use user Image
    app.get("/users/image/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ image: user?.image });
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
