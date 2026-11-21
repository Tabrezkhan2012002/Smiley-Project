import mongoose from "mongoose";
const loginschema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true   
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"registeruser"  
    }
    
})
const loginuser=mongoose.model("loginuser", loginschema);
export default loginuser;