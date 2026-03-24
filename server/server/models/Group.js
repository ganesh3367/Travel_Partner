const mongoose = require('mongoose');
const groupSchema = new mongoose.Schema({ groupName:{type:String,required:true}, members:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}], tripId:{type:mongoose.Schema.Types.ObjectId,ref:'Trip',required:true}, messages:[{type:mongoose.Schema.Types.ObjectId,ref:'Message'}] }, { timestamps:true });
module.exports = mongoose.model('Group', groupSchema);
