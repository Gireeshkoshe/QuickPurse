const express=require("express");
const app=express();
const mainRouter=require("./routes/index")
const cors=require("cors");
app.use(cors());
app.use(express.json());

app.use("/api/v1",mainRouter)

app.get("/",(req,res)=>{
    console.log ("started baby");
    res.json({
        message:"hello"
    })
})
app.listen(process.env.PORT,()=>{
    console.log("listning");
})