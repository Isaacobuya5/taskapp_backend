const express = require("express");

const router = express.Router();
const Task = require("../model/Tasks");
const auth = require("../middleware/middleware");

// creating a new task
router.post("/tasks", auth, async (req, res) => {
  console.log(req.body);
  const { task, description, completed, username } = req.body;
  const newTask = new Task({
    task,
    description,
    completed,
    username
  });
  try {
    const result = await newTask.save();
    res.status(201).json({
      result,
      message: "Task created succesfully"
    });
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
});

// getting tasks
router.post("/tasks/fetch", auth, async (req, res) => {
  const { username } = req.body;
  try {
    const results = await Task.find({ username: username });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

// editting a task or marking as complete
router.put("/tasks/:id", async (req, res) => {
  console.log(req.body);
  const { task, description, completed, username } = req.body;
  try {
    // find the user with the given id
    const user = Task.findOne({ _id: req.params.id });
    if (!user) {
      throw new Error("Invalid user");
    }

    await user.update({ completed: "true" });
    res.status(201).json({ message: "Task marked succesfully." });
  } catch (error) {
    res.status(400).json({ error });
    console.log(error);
  }
});

// deleting a task
router.delete("/tasks/:id", auth, async (req, res) => {
  const id = req.params.id;
  try {
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: "Delete succesful" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
