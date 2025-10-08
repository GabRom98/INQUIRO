import express from "express";
import mainRouter from "./src/routes/mainRouter.js";
import morgan from "morgan";
import cors from 'cors';
import dotenv from "dotenv";

const server = express();
dotenv.config();

const HOSTNAME = '127.0.0.1';
const PORT = process.env.PORT || 8080;

const corsOptions = {
  origin: '*',  
  methods: 'GET,POST,PUT,DELETE',  
  allowedHeaders: 'Content-Type,Authorization',  
  credentials: true,
};

server.use(cors(corsOptions));

server.use(express.json())
server.use(express.text())
server.use(morgan('combined'));
server.use(mainRouter);

server.listen(PORT,HOSTNAME,() => {
    console.log(`Servidor corriendo en http://${HOSTNAME}:${PORT}`);
})