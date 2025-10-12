import express from "express";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";
import config from "./config/config";

// initialize the express app
const app = express();

app.use(express.json());

// use the user routes
app.use("/api/users", userRoutes);

// use the error handler
app.use(errorHandler);

export default app;