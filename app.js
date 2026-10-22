//external Import
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

//load environment variables before anything reads process.env
dotenv.config();

//internal Import

const {
  errorHandler,
  notFoundHandler,
} = require("./middlerwares/common/errorHandler");
const loginRouter = require("./router/longinRouter");
const inboxRouter = require("./router/inboxRouter");
const usersRouter = require("./router/usersRouter");

//create app
const app = express();
const server = http.createServer(app);

// socket creation
const io = new Server(server);
// make the io instance available to the controllers (sendMessage emits on it)
global.io = io;

io.on("connection", (socket) => {
  console.log(`socket connected: ${socket.id}`);
  socket.on("disconnect", (reason) => {
    console.log(`socket disconnected: ${socket.id} (${reason})`);
  });
});

//set view engine
app.set("view engine", "ejs");

//request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookie parsers
app.use(cookieParser(process.env.COOKIE_SECRET));

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//set router
app.use("/", loginRouter);
app.use("/inbox", inboxRouter);
app.use("/users", usersRouter);

//not found error handler
app.use(notFoundHandler);

//common error handler
app.use(errorHandler);

//connect to the database first, then start the HTTP + socket.io server
async function start() {
  try {
    await mongoose.connect(process.env.DB_STRING);
    console.log("database connection is successful");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    // NOTE: server.listen (not app.listen) so socket.io shares the same
    // HTTP server and can answer /socket.io requests.
    server.listen(process.env.PORT, () => {
      console.log(`app is listening on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("database connection failed:", err.message);
    process.exit(1);
  }
}

start();
