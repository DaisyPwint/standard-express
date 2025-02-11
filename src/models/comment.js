// comments[icon: message-circle]{
//     id ObjectId pk
//     content string
//     owner ObjectId users
//   }

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    owner: Schema.Types.ObjectId
}, {
    timestamps: true
})

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);