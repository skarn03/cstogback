const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');
const http = require('http').createServer(app);
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
//router imports
const userRoute = require('./routes/user-routes');
const messageRoute = require('./routes/message-route');
const projectRoute = require('./routes/project-route');
const { Server } = require('socket.io'); // Import the Server class from Socket.IO

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
//routes here
app.use('/api/users', userRoute);
app.use('/api/projects', projectRoute);
app.use('/api/message', messageRoute);

mongoose
    .connect(`${process.env.DB_URI}`,
        { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {

        http.listen(process.env.port || port, () => {
            console.log('Connected to MongoDB & Backend');
        });


        // Socket.io event handlers
        const io = new Server(http, {
            cors: {
                origin: '*',
                methods: ["GET", "POST", "DELETE", "PATCH"],
            },
        });


        io.on('connection', (socket) => {
            console.log('A user connected');
            socket.on('joinRoom', (roomID) => {
                console.log("inside room", roomID);
                socket.join(roomID);
            });
            socket.on('sendMessage', async (data) => {
                try {
                    // Save the message to the database (if necessary)
                    // ...

                    console.log("message to " + data.roomID);
                    io.to(data.roomID).emit('receiveMessage', data.message);
                    // Emit the received message to the specific room


                } catch (error) {
                    console.log(error);
                    // Handle error (e.g., display an error message)
                }
            });

            socket.on('disconnect', () => {
                console.log('A user disconnected');
            });
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });
