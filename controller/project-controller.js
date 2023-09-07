const { validationResult } = require('express-validator');
const Project = require("../Model/project-model");
const cloudinary = require("cloudinary").v2;
const User = require("../Model/user-model");

cloudinary.config({
    cloud_name: 'dcrcc9b4h',
    api_key: '638351652727691',
    api_secret: 'pjMWR4xBh2svNScZ_vFg5pyidH0',
});
class projectController {


    static getFilteredProject = async (req, res) => {
        try {
            // Retrieve data from the request body
            const { keyword, frontend, backend, language } = req.body;

            // Log the received data
            console.log('Received search keyword:', keyword);
            console.log('Received selected frontend tools:', frontend);
            console.log('Received selected backend tools:', backend);
            console.log('Received selected languages:', language);

            // Construct the filter object based on the provided filters
            const filter = {};

            if (keyword !== '') {
                filter.title = { $regex: keyword, $options: 'i' }; // Case-insensitive search
            }

            if (frontend.length > 0) {
                filter.frontend = { $in: frontend };
            }

            if (backend.length > 0) {
                filter.backend = { $in: backend };
            }

            if (language.length > 0) {
                filter.languages = { $in: language };
            }

            // Query the database with the constructed filter
            const projects = await Project.find(filter);

            // Respond with the filtered projects
            res.status(200).json({ projects });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // project-controller.js

    // ... (Other controller functions)

    static acceptPendingUser = async (req, res) => {
        try {
            const projectId = req.params.id;
            const userId = req.params.userId;

            // Find the project by ID
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            // Check if the user's ID is in the pendingUser array
            if (!project.pendingUser.includes(userId)) {
                return res.status(400).json({ message: 'User is not in the pending list' });
            }

            // Move the user from pendingUser to joinedUser
            project.joinedUser.push(userId);
            project.pendingUser.pull(userId);

            await project.save(); // Save the updated project

            // Add the project ID to the user's joinedProjects array
            const user = await User.findById(userId);
            if (user) {
                user.joinedProjects.push(projectId);
                await user.save();
            }

            res.status(200).json({ message: 'User accepted' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }


    static rejectPendingUser = async (req, res) => {
        try {
            const projectId = req.params.id;
            const userId = req.params.userId;

            // Find the project by ID
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            // Check if the user's ID is in the pendingUser array
            if (!project.pendingUser.includes(userId)) {
                return res.status(400).json({ message: 'User is not in the pending list' });
            }

            // Remove the user from pendingUser
            project.pendingUser.pull(userId);

            await project.save(); // Save the updated project

            res.status(200).json({ message: 'User rejected' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static getLatestProject = async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        try {
            const projects = await Project.find()
                .sort({ createdAt: -1 }) // Sort by descending order of creation date
                .skip(skip) // Skip the specified number of projects
                .limit(limit); // Limit the number of projects to retrieve
            res.status(200).json({ projects });
        } catch (error) {
            res.status(500).json({ message: 'Fetching projects failed.' });
        }
    }
    static getProject = async (req, res) => {
        const id = req.params.id;

        try {
            const project = await Project.findById(id);

            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            res.status(200).json(project);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static cloudinaryDelete = async (image, imageID) => {
        if (image && imageID && imageID != "") {

            await cloudinary.uploader.destroy(imageID);
        }
    }
    static updateProject = async (req, res) => {
        try {
            const { title, frontend, backend, description, languages, other, projectPictureId, projectPicture } = req.body;
            const projectId = req.params.id;
            // Find the project by ID and check if it exists
            const project = await Project.findById(projectId);
            console.log(projectPictureId);

            if (!project) {
                projectController.cloudinaryDelete(projectPicture, projectPictureId)
                return res.status(404).json({ message: 'Project not found' });
            }

            // Assuming you have a function to check if the user making the request is the creator of the project
            console.log(project.creator + " " + req.userData.userID);

            if (project.creator != req.userData.userID) {
                return res.status(403).json({ message: 'You are not authorized to update this project' });
            }

            if (project.projectPictureId != projectPictureId && projectPictureId != "") {
                projectController.cloudinaryDelete(project.projectPicture, project.projectPictureId)
            }
            // Update the project fields with the provided values
            project.title = title;
            project.frontend = frontend;
            project.backend = backend;
            project.description = description;
            project.languages = languages;
            project.other = other;
            project.projectPicture = projectPicture;
            project.projectPictureId = projectPictureId;
            // Save the updated project
            const updatedProject = await project.save();
            console.log("saved");
            res.status(200).json(updatedProject);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static createProject = async (req, res) => {
        try {
            // Checking validation results from express-validator middleware

            const { title, description, languages, frontendTools, backendTools, projectPicture, otherTools, projectPictureId } = req.body;

            // Assuming you're using a user authentication system
            const creator = req.userData.userID; // Get the creator's ID from the authenticated user

            // Conditionally set projectPicture based on whether it's an empty string or not
            const projectPictureField = projectPicture === '' ? undefined : projectPicture;
            const projectPictureIdField = projectPictureId === '' ? undefined : projectPictureId;

            const newProject = new Project({
                title,
                description,
                frontend: frontendTools,
                backend: backendTools,
                projectPicture: projectPictureField,
                creator,
                projectPictureId: projectPictureIdField,
                other: otherTools,
                languages,
                active: 'active' // Set the initial status
            });

            const savedProject = await newProject.save();

            // Retrieve the user document corresponding to the creator's ID
            const user = await User.findById(creator);

            // Update the user's project reference array
            user.projects.push(savedProject._id);

            // Save the updated user document
            await user.save();

            res.status(201).json(savedProject);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    static deleteProject = async (req, res) => {
        try {
            const projectId = req.params.id;
            // Find the project by ID
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            // Assuming you have a function to check if the user making the request is the creator of the project
            if (project.creator != req.userData.userID) {
                return res.status(403).json({ message: 'You are not authorized to delete this project' });
            }

            // Delete the project picture from Cloudinary if it exists
            if (project.projectPictureId) {
                await projectController.cloudinaryDelete(project.projectPicture, project.projectPictureId);
            }

            // Retrieve the user document corresponding to the creator's ID
            const user = await User.findById(project.creator);

            // Remove the project reference from the user's project array
            user.projects.pull(projectId);

            // Save the updated user document
            await user.save();

            // Delete the project from the database
            await Project.deleteOne({ _id: projectId });
            console.log("deleted");
            res.status(200).json({ message: 'Project deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    static addPendingUser = async (req, res) => {
        try {
            const projectId = req.params.id;
            const userID = req.userData.userID;

            // Find the project by ID
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            // Check if the user's ID is already in the pendingUser array
            if (!project.pendingUser.includes(userID)) {
                project.pendingUser.push(userID); // Add the user's ID to the pendingUser array
                await project.save(); // Save the updated project document
            }

            res.status(200).json({ message: 'User added to pending list' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
            console.log(error.message);
        }
    }

    static getUserProject = async (req, res) => {
        try {
            console.log(req.userData.userID);
            const userId = req.userData.userID;

            // Find the user by ID
            const user = await User.findById(userId)
                .populate({
                    path: 'projects',
                    select: 'title projectPicture creator pendingUser joinedUser',
                    options: { sort: { updatedAt: -1 } } // Sort by descending order of updatedAt
                })
                .populate({
                    path: 'joinedProjects',
                    select: 'title projectPicture creator pendingUser joinedUser',
                    options: { sort: { updatedAt: -1 } } // Sort by descending order of updatedAt
                });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ userProjects: user.projects, joinedProjects: user.joinedProjects });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    static getPendingUsers = async (req, res) => {
        try {
            const projectId = req.params.projectId;

            // Find the project by ID and populate the pendingUser array with user names
            const project = await Project.findById(projectId)
                .populate({
                    path: 'pendingUser',
                    select: 'name', // Assuming 'name' is a field in the User model
                });

            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            res.status(200).json({ pendingUsers: project.pendingUser });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
            console.log(error.message);
        }
    }

}

module.exports = projectController;
