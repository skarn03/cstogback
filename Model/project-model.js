const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user-model');



const projectSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    languages :[{type:String}],
    frontend:[{type:String}],
    backend:[{type:String}],
    other:[{type:String}],
    projectPictureId:{type:String},
    projectPicture:{type:String , default : 'https://cms-assets.tutsplus.com/cdn-cgi/image/width=630/uploads/users/2362/posts/106981/image-upload/n17.jpg'},
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    repositary: { type: String},
    active:{type:String},
    pendingUser: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    joinedUser: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
},{timestamps:true});

module.exports = mongoose.model('Project', projectSchema);
