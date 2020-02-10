const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || "4000";
const bodyParser = require("body-parser");
// allows express to parse cookies passed by our application
const cookieParser = require("cookie-parser");
//
const mongoose = require("mongoose");
// user router
const UserRoutes = require("./routes/User");
// task routers
const TaskRoutes = require("./routes/Tasks");

mongoose
  .connect(process.env.DATABASE_CONNECTION_STRING)
  .then(() => console.log("Connected to mongo db succesfully"))
  .catch(error => console.log(error));

app.use(cors());

app.get("/", (req, res) => {
  res.send({ message: "Succesfully set up" });
});

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

app.use(cookieParser());

app.use("/api", UserRoutes, TaskRoutes);
// server listening on port 4000
app.listen(port, () => console.log("Server is running succcesfully"));
