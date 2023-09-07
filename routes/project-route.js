const express = require('express');
const checkAuth = require('../middleware/checkAuth');
const projectController = require('../controller/project-controller');

const router = express.Router();

// Server validation: user is actually logged in,
// stores user id in req body
router.use(checkAuth);

// Create a new project
router.post('/create', projectController.createProject);

// Get the latest projects
router.get('/suggestedproject', projectController.getLatestProject);


router.post('/suggestedproject/filter/xyz',projectController.getFilteredProject);
// Get a specific project by ID
router.get('/:id', projectController.getProject);

// Need to add a middleware to check if the user is actually allowed to update or not
router.patch('/:id', projectController.updateProject);

// Delete a project
router.delete('/:id', projectController.deleteProject);

router.get('/getPendingUsers/:projectId',  projectController.getPendingUsers);


router.patch('/addPending/:id',projectController.addPendingUser);

router.get('/getuserproject/allprojects',projectController.getUserProject);


// Accept a user into the project
router.patch('/acceptPending/:id/:userId', projectController.acceptPendingUser);

// Reject a user from the project
router.patch('/rejectPending/:id/:userId', projectController.rejectPendingUser);

module.exports = router;
