const mongoose = require('mongoose');
const tripSchema = new mongoose.Schema({ 
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}, 
  destination:{type:String,required:true}, 
  startDate:{type:Date,required:true}, 
  endDate:{type:Date,required:true}, 
  budget:{type:Number,default:0}, 
  description:{type:String,default:''}, 
  tripType:{type:String,default:'leisure'},
  imageUrl:{type:String,default:''},
  members:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
  joinRequests:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}]
}, { timestamps:true });
module.exports = mongoose.model('Trip', tripSchema);
