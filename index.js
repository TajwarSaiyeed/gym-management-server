const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 8000;
const jwt = require("jsonwebtoken");
const verifyJWT = require("./middleware/verifyJWT");
const connectDB = require("./config/db");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const userRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require("./routes/message.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const feesRoutes = require("./routes/fees.routes");

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// updated code
connectDB();

// old code
const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// updated code
app.use("/api/user", verifyJWT, userRoutes);
app.use("/api/chat", verifyJWT, chatRoutes);
app.use("/api/message", verifyJWT, messageRoutes);
app.use("/api/attendance", verifyJWT, attendanceRoutes);
app.use("/api/fees", verifyJWT, feesRoutes);

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

    const exercisesCollection = client.db("gymdb").collection("exercises");

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
    // Exercise
    app.post(
      "/addexercise",
      verifyJWT,
      verifyAdminOrTrainer,
      async (req, res) => {
        const exercise = req.body;
        const result = await exercisesCollection.insertOne(exercise);
        res.send(result);
      }
    );

    // get exercise by email
    app.get("/getexercisebyuser", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await exercisesCollection.find(query).toArray();
      res.send(result);
    });

    // NOTIFICATION
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

    app.patch("/notification/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const notificationBody = req.body.preValue;
      const query = { email: email };
      const updatedDoc = {
        $set: {
          preValue: notificationBody,
        },
      };
      const result = await notificationCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    //get notification
    app.get("/notification", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const notification = await notificationCollection.findOne(query);
      res.send(notification);
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
        const token = jwt.sign(
          { email, _id: user._id },
          process.env.ACCESS_TOKEN,
          {
            expiresIn: "5d",
          }
        );
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

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000", "https://gym-management-apps.web.app"],
    methods: ["GET", "POST"],
    pingTimeout: 60000,
  },
});

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("User disconnected");
    socket.leave(userData._id);
  });
});
