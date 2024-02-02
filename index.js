require("dotenv").config(); //for using variables from .env file.
const express = require("express");
const mongoose = require("mongoose");
const JournalModel = require("./models/journal")
const app = express();
const port = 3000;

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("MongoDB is connected!");
});


app.use(express.urlencoded({extended: true}))
app.set("view engine", "ejs")

app.get("/", (req, res)=>{
    res.render("index")
})

app.post("/api/journal", async (req, res)=>{
  try {
    const newJournal = await JournalModel.create(req.body);
    res.status(201).json(newJournal);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
