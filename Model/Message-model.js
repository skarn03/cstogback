const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user-model');
const Project = require('./project-model');

const MessageSchema = new Schema({
    projectID: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
