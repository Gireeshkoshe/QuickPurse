const express=require("express");
const userRouter=express.Router();
const { User, Account } = require("../db");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const zod=require("zod");
const authmiddleware = require("../middleware");

//zod object
const signupBody= zod.object({
    username:zod.string(),
    password:zod.string(),
    firstName:zod.string(),
    lastName:zod.string()
})

userRouter.post("/signup",async(req,res)=>{
    const {success}=signupBody.safeParse(req.body);
    if(!success){
      return res.status(411).json({
        message:"Invalid Input"
      })
    }
    const existingUser= await User.findOne({
        username:req.body.username
    })
    if(existingUser)
    {
        return res.status(411).json({
            message:"Email Already Taken"
          }) 
    }
    const {username,password,firstName,lastName}=req.body;
    const salt= await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);
    const newUser=await User.create({
        username,
        password:hashedPassword,
        firstName,
        lastName
    })
    const userId=newUser._id;

    //create a new user in account db
    await Account.create({
        userId,
        balance: parseInt(Math.random()*10000),
    });
    const token=jwt.sign({
        userId,
    },process.env.JWT_SECRET);
    res.status(200).json({
        message:"User Created Sucessfully",
        token:token,
    });
});

const signinObject=zod.object({
    username:zod.string(),
    password:zod.string(),
})
userRouter.post("/signin",async(req,res)=>{
    const {success}=signinObject.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message:"Invalid Inputs"
        })
    }
    const user= await User.findOne({
        username:req.body.username,
    })
    if(!user){
        return res.status(404).json({
            message:"User Not found!!"
        })
    }
    if(user)
    {
        console.log('User:', user.password);
        const match= await bcrypt.compare(req.body.password,user.password);
        if(!match){
            return res.status(401).json({
                message:"wrong credentials!!"
            })
        }
        const token=  jwt.sign({
            userId:user._id
        },process.env.JWT_SECRET);
        return res.status(200).json({
            token:token
        });
    }
});

const updateObject=zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})
userRouter.put("/",authmiddleware,async(req,res)=>{
        const {success}=updateObject.safeParse(req.body);
        if(!success)
        {
            return res.status(411).json({
                message:"Invalid Inputs"
            })
        }
        const updated={};
        if(req.body.password)
        {
            const salt=await bcrypt.genSalt(10);
            updated.password= await bcrypt.hashSync(req.body.password,salt);
        }
        if (req.body.firstName) {
            updateData.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
            updateData.lastName = req.body.lastName;
        }
        await User.updateOne({
            _id:req.userId
        },updated);
    
        res.json({
            message: "Updated successfully",
          });
    
    });

    userRouter.get("/bulk",async(req,res)=>{
        const filter=req.query.filter;
        const users=await User.find({
            $or:[
                {
                    firstName:{
                        $regex:filter,
                        $options: 'i'
                    }
                },{
                    lastName:{
                        $regex:filter,
                        $options: 'i'
                    }
                }
            ],
        })
        res.json({
            users:users.map((user)=>({
                username:user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id,
            }))
        })
        userRouter.get("/getUser", authmiddleware, async (req, res) => {
            const user = await User.findOne({
              _id: req.userId,
            });
            res.json(user);
          });
    });

module.exports=userRouter;
