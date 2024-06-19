import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import { Router } from "./src/Routes/index.js";
dotenv.config();

//initializing server
const app=express();
  
//middlewares
app.use(express.json());
app.use(cors());

//initializing PORT
const PORT=2004;

//routes
app.use("/",Router);

//listening to the server
app.listen(PORT,()=>console.log("Server Started in PORT : "+PORT));