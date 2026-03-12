const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const promoCodeSchema=new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true
    },
    discountType:{
        type:String,
        enum:['percentage','fixed'],
        required:true
    },
    discountValue:{
        type:Number,
        required:true
    },
    minOrderAmount:{
        type:Number,
        required:true
    },
    maxDiscountAmount:{
        type:Number,
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    usageLimit:{
        type:Number,
        required:true
    },
    usedCount:{
        type:Number,
        default:0
    },
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    userType: {
        type: String,
        enum: ['newUser', 'regular_user', 'frequent_user', 'prime_user', 'inactive_user', 'all'],
    }
}, { timestamps: true })

// add plugin that converts mongoose to json
promoCodeSchema.plugin(toJSON);
promoCodeSchema.plugin(paginate);

const PromoCodes=mongoose.model("promocodes",promoCodeSchema)

module.exports=PromoCodes