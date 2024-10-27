const mongoose=require("mongoose");
const { number } = require("zod");
require("dotenv").config();
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.error("Failed to connect to MongoDB:", error));

const userSchema=new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }, 
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
});
const accountSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        require:true
    },
    balance:{
        type:Number,
        required: true,
    }
});

const User=mongoose.model('User',userSchema);
const Account=mongoose.model('Account',accountSchema);
module.exports={
    User,
    Account,
};