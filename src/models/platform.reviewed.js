const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

 const platformReviewSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    review:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    platform:{
        type:String,
        required:true
    }
 },{
    timestamps:true
 })

// add plugin that converts mongoose to json
platformReviewSchema.plugin(toJSON);
platformReviewSchema.plugin(paginate);

 const PlatformReview=mongoose.model('PlatformReview',platformReviewSchema)
 module.exports=PlatformReview