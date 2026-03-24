const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({ name:{type:String,required:true}, email:{type:String,required:true,unique:true}, password:{type:String,required:true}, profileImage:{type:String,default:''}, bio:{type:String,default:''}, interests:[{type:String}], budget:{type:Number,default:0}, travelStyle:{type:String,default:''}, location:{type:String,default:''} }, { timestamps:{createdAt:'createdAt',updatedAt:true} });
module.exports = mongoose.model('User', userSchema);
