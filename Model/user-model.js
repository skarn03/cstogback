const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Project = require('./project-model');


const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    DOB: { type: String, required: true },
    bio: { type: String, default: '' },
    profilePic: { type: String, default: 'https://static.thenounproject.com/png/5034901-200.png' },
    GitHub: { type: String, default: ''},
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project'}],
    joinedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project'}],
});

module.exports = mongoose.model('User', userSchema);
