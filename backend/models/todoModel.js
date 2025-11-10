const mongoose = require('mongoose');

const todoschema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    description : {
        type : String,
        required : true,
    },
}, {timestamps : true});

const todoModel = mongoose.model("todoModel",todoschema);

module.exports = todoModel