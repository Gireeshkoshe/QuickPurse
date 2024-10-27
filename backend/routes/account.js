const express=require("express");
const authmiddleware = require("../middleware");
const { default: mongoose } = require("mongoose");
const { setErrorMap } = require("zod");
const { Account } = require("../db");
const accountRouter=express.Router();
accountRouter.get("/balance",authmiddleware,async(req,res)=>{
    const userId=req.userId;
    if(!userId){
        return res.json({
            message:"invalid user"
        })
    }
    const account= await Account.findOne({
        userId
    });
    res.json({
        balance:account.balance,
    });
});

accountRouter.post("/transfer",authmiddleware,async(req,res)=>{
    const session= await mongoose.startSession();
    session.startTransaction();
    const {amount,to}=req.body;

    if(to=== req.userId)
    {
        await session.abortTransaction();
        return res.json({
             message: "Cannot Transfer to yourself!"
        });
    }

    const account= await Account.findOne({
        userId:req.userId
    }).session(session);


    if(!account||account.balance<amount)
    {
        await session.abortTransaction();
        res.status(400).json({
            message: "Insufficient balance",
        })
    }
    const toaccount=await Account.findOne({
        userId:to
    }).session(session);

    if(!toaccount)
    {
        session.abortTransaction();
        return res.status(400).json({
            message:"Invalid account"
        })
    }

    await Account.updateOne({
        userId:account.userId
    },{
       $inc:{
        balance:-amount,
       }
    }).session(session);

    await Account.updateOne({
        userId:to
    },{
        $inc:{
            balance:amount,
        }
    }).session(session);

    await session.commitTransaction();
    return res.status(200).json({
        message:"Transfer Successful"
    });

});
module.exports=accountRouter;