const Message = require("../Model/Message-model");


class messageController {
    static createMessage = async (req, res) => {
        try {
            const { projectID,  text } = req.body;
            const newMessage = new Message({
                projectID, sender:req.userData.userID, text
            })
            const savedMessage = await newMessage.save();
            res.status(200).json(savedMessage);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    }
    static getMessage = async (req, res) => {
        try {
            console.log("trying to find meessage");
            const { projectID } = req.params;
            const messages = await Message.find({
                projectID: projectID
            });

            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
}
module.exports = messageController;