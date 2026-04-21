import mongoose from "mongoose";
import express from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import cors from "cors"
import dns from "node:dns";

// import routes
import userRoutes from "./Routes/userRoutes.js";
import cakeRoutes from "./Routes/cakeRoutes.js";
import accessoriesRoutes from "./Routes/accessoriesRoutes.js";
import orderRoutes from "./Routes/orderRoutes.js";
import paymentRoutes from "./Routes/paymentRoutes.js";
import deliveryRoutes from "./Routes/deliveryRoutes.js";
import feedbackRoutes from "./Routes/feedbackRoutes.js";
import reviewRoutes from "./Routes/reviewRoutes.js";
import driverRoutes from "./Routes/driverRoutes.js";
import reportRoutes from "./Routes/reportRoutes.js";



dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const mongoUrl=process.env.Mongo_Url;

mongoose.connect(mongoUrl).then(()=>{
    console.log("Connected to MongoDB");
}).catch((error)=>{
    console.error("Error connecting to MongoDB:",error);
}
);

const app=express();
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    const authorizationHeader = req.header("Authorization");
   
   if(authorizationHeader != null){
        const token = authorizationHeader.replace("Bearer ", "")
        console.log("Authorization Token:", token);

         jwt.verify(token, process.env.JWT_SECRET, (error, content) => {
           if(error){
            console.log("Invalid token:", error.message);
           } else if(content){
            console.log("Token content:", content);
            req.user = content;
           }
        })
    }
    next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/cakes", cakeRoutes);
app.use("/api/accessories", accessoriesRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/reports", reportRoutes);
app.listen(3000,()=>{
    console.log("Server is running on port 3000");
}
);