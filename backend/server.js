const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

const PORT =process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

mongoose
.connect(MONGO_URI, {autoIndex: true})
.then(() => {
    console.log('MongoDB connected!!');
})
.catch((err) => {
    console.log('MongoDm connection error : ', err.message);
    process.exit(1);
    
});

const todoModel = require('./models/todoModel')

app.post("/api/todos", async (req, res , next) => {
    try{
        const {title} = req.body
        const todo = await todoModel.create({title: title.trim()});
        res.status(201).json(todo);
    }catch(err){
        next(err)
    }
})


app.use((req,res) => {
    res.status(404).json({error : "Route not found"});
})

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
    
})