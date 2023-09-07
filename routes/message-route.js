const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');

const messageController = require('../controller/message-controller');

router.use(checkAuth);

router.post("/create",messageController.createMessage);
router.get('/get/:projectID',messageController.getMessage);


module.exports = router;
