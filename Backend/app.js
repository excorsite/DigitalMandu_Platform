const express = require("express");
const { connectDatabase } = require("./database/database");
const app = express();

// requiring the registeruser and login user from auth controller from controller file
const { registerUser, loginUser } = require("./controller/auth/authController");

// We need this to parse JSON format data and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// code for making client access the folder named uploads only by defalt node doesnnot allow us access the folder
//directly by lcient
app.use(express.static("./uploads"));

// Include .env to access environment variables (must be before any process.env usage)
require("dotenv").config();

// Make database connection - supports both MONGO_URI and legacy Mongo_URI
const mongoUri = process.env.MONGO_URI || process.env.Mongo_URI;
connectDatabase(mongoUri);

const { Server } = require("socket.io");
//requirieng cors for fixing cors related error
const cors = require("cors");

//importing the authRoute.js in this file to work with routes
const admin_user_route = require("./routes/admin/adminUserRoute");
const admin_order_route = require("./routes/admin/adminOrderRoute");
const product_routes = require("./routes/admin/productRoute");
const auth_routes = require("./routes/auth/authRoute");
const user_review_route = require("./routes/user/userReviewRoute");
const user_profile_route = require("./routes/user/profileRoute");
const user_order_route = require("./routes/user/orderRoute");
const user_payment_route = require("./routes/user/paymentRoute");
const recommendation_route = require("./routes/recommendation/recommendationRoute");

//step:5 create the requirement of the route path here
const user_cart_route = require("./routes/user/cartRoute");

app.use(
  cors({
    origin: "*",
  }),
);

// using the routes we added for the auth routes
// the "/" denotes that there are no subfolders for the route
// we can leave it "" only it will work
app.use("/api", auth_routes);
app.use("/api", product_routes);
app.use("/api", admin_user_route);
app.use("/api", user_review_route);
app.use("/api", user_order_route);
app.use("/api", admin_order_route);
app.use("/api", user_payment_route);
app.use("/api", recommendation_route);

// another way of using route either add everything on main route file like top
//or explicitly mention path here like i did  tin this boottm part mentioning profile route explicitly
app.use("/api/profile", user_profile_route);

// step 6: make use of the included route
//notice how id did /api and did /profile
//it is basically same as i worte whole path here for profile
//and for cart i have written it in their own route file cartRoute
app.use("/api", user_cart_route);

// Test API
app.get("/", (req, res) => {
  res.status(404).json({
    message: "I am alive",
  });
});

const BASE_PORT = Number(process.env.PORT || 3000);
const MAX_PORT_RETRIES = 10;
let server;
let io;
let shuttingDown = false;

const startServer = (port, retries = 0) => {
  server = app.listen(port);

  server.once("listening", () => {
    console.log(`Server running on port ${port}`);

    io = new Server(server);
    io.on("connection", (socket) => {
      console.log("connected to a socket");
      // You can add more event listeners here
      console.log(server);
    });
  });

  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && retries < MAX_PORT_RETRIES) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy; trying port ${nextPort}`);
      startServer(nextPort, retries + 1);
      return;
    }

    if (error.code === "EADDRINUSE") {
      console.error(
        `Could not start server after ${MAX_PORT_RETRIES} port retries, starting at port ${BASE_PORT}.`,
        error,
      );
    } else {
      console.error(`Failed to start server on port ${port}.`, error);
    }
    process.exit(1);
  });
};

const closeServer = (callback) => {
  if (!server || !server.listening) {
    callback();
    return;
  }

  if (io) {
    io.close(callback);
  } else {
    server.close(callback);
  }
};

const shutdown = (restart = false) => {
  if (shuttingDown) return;
  shuttingDown = true;

  closeServer(() => {
    if (restart) {
      process.kill(process.pid, "SIGUSR2");
    } else {
      process.exit(0);
    }
  });
};

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());
process.once("SIGUSR2", () => shutdown(true));

startServer(BASE_PORT);

const getSocketIo = () => {
  return io;
};
module.exports.getSocketIo = getSocketIo;
