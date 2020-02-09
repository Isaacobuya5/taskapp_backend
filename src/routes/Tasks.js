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
// router.put('/tasks/:id', async (req, res) => {
//   const id = req.params.id;

//   const task = await Task.findById(id).exec();
//   if (!task) return res.status(404).send('The task with the given ID was not found.');
//   let query = {$set: {}};
//   for (let key in req.body) {
//     if (product[key] && product[key] !== req.body[key]) // if the field we have in req.body exists, we're gonna update it
//        query.$set[key] = req.body[key];
//   }
//   const updatedProduct = await Task.updateOne({_id: id}, query}).exec();

//   res.send(task);
// });

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
