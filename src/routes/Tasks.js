const express = require("express");

const router = express.Router();
const Task = require("../model/Tasks");

// creating a new task
router.post("/tasks", async (req, res) => {
  console.log(req.body);
  const { task, description, completed } = req.body;
  const newTask = new Task({
    task,
    description,
    completed
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
router.get("/tasks", async (req, res) => {
  try {
    const results = await Task.find();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

module.exports = router;
