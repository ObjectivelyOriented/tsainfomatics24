const express = require('express')
const app = express()
const mongoose = require("mongoose")
var connectionUrl = "mongodb://localhost:27017/databasename"
mongoose.connect(connectionUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err)=>{
    if(err) throw err
    console.log("Connected")
})

app.get("/home", (req, res)=>{
    res.send("Hello")
})

const port = process.env.PORT || 4000
app.listen(port, ()=>{
    console.log(`Listening to Port ${port}`)
})
