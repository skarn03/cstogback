const express = require('express');
const router = express.Router();
const userController = require('../controller/user-controller');
//validating for blank signup or invalid login/signup credentails
const Validate  = require('../middleware/validate');
const checkAuth = require('../middleware/checkAuth');


router.post('/signup', Validate.validateSignup(), userController.signup);
router.post('/login', Validate.validateLogin(), userController.login);

router.use(checkAuth);
router.get('/profile/:userId',userController.getUserWithProjects);


//anything after this should check if it's the actual user or not
router.get('/settings/:userId',userController.getUserSettings);
router.patch('/updateSettings',userController.updateUserSettings);


module.exports = router;
