/**
 * @Author           Dymtro
 * @Created          May 23, 2024
 * @Description     
 ** MayaIQ Backend App.js
 */

const express = require("express");
const app = express();
// const cors = require("cors");
// const http = require("http").Server(app)
const bodyParser = require("body-parser")
const path = require('path')
require("dotenv/config"); // Environment variables

const http = require("http").Server(app);
const cors = require("cors");

const morgan = require('morgan');
const fs = require('fs');

// Custom token to log date and time
morgan.token('date', () => {
   return new Date().toISOString();
});

// Custom format including date and time
const customFormat = ':date :method :url :status :res[content-length] - :response-time ms';

// Create a write stream (in append mode)
const logStream = fs.createWriteStream(path.join(__dirname, 'requests.txt'), { flags: 'a' });

// Setup the logger with custom format
app.use(morgan(customFormat, { stream: logStream }));
app.use(express.static(path.join(__dirname, 'widget')));
const socketIO = require("socket.io")(http, {
   cors: {
      origin: "*"
   }
});


//Add this before the app.get() block
// socketIO.on("connection", (socket) => {
//   console.log("One user connected")
//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//   });
// });



// Route imports
const publicRoutes = require("./routes/publicRoutes");
const authRoutes = require("./routes/auth");
const privateRoutes = require("./routes/privateRoutes");
const { init } = require("./db");
// const limiter = require("./middlewares/rateLimiter");

// Middlewares
// app.use(bodyParser.json());
const corsOptions = {
   origin: '*', // Allow only this origin to access your server
   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
   allowedHeaders: 'Content-Type,Authorization', // Allow these headers
};

app.use('*', cors(corsOptions));
app.use(express.json());
// app.use(limiter);

// -> Route Middlewares
app.use("/api/public", publicRoutes);
app.use("/api/private", privateRoutes);
app.use("/api/user", authRoutes);

// Reusable function to send files with default fallback
const sendFileWithFallback = (res, filePath, defaultFilePath) => {
   // Check if the file exists
   fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
         // File does not exist, send default file instead
         res.sendFile(defaultFilePath);
      } else {
         // File exists, send the file
         res.sendFile(filePath);
      }
   });
}

app.get('/uploads/products/:imageName', (req, res) => {
   const imageName = req.params.imageName;
   const imagePath = path.join(__dirname, 'uploads', 'products', imageName);
   const defaultImagePath = path.join(__dirname, 'uploads', 'products', 'default_product.png');
   sendFileWithFallback(res, imagePath, defaultImagePath);
});

app.get('/uploads/users/:imageName', (req, res) => {
   const imageName = req.params.imageName;
   const imagePath = path.join(__dirname, 'uploads', 'users', imageName);
   const defaultImagePath = path.join(__dirname, 'uploads', 'users', 'default_product.png');
   sendFileWithFallback(res, imagePath, defaultImagePath);
});

app.get('/uploads/chats/images/:imageName', (req, res) => {
   const imageName = req.params.imageName;
   const imagePath = path.join(__dirname, 'uploads', 'chats/images', imageName);
   const defaultImagePath = path.join(__dirname, 'uploads', 'chats/images', 'default_product.png');
   sendFileWithFallback(res, imagePath, defaultImagePath);
});

app.get('/uploads/chats/files/:fileName', (req, res) => {
   const fileName = req.params.fileName;
   const filePath = path.join(__dirname, 'uploads', 'chats/files', fileName);
   const defaultImagePath = path.join(__dirname, 'uploads', 'chats/files', 'default_product.png');
   sendFileWithFallback(res, filePath, defaultImagePath);
});

init()

// Running the socket.io server
require("./middlewares/socket")(http);

// Starting the server
const PORT = process.env.PORT || 19823;
http.listen(PORT, () => {
   console.log(`Application running at http://23.27.164.88:${PORT}/`);
});



