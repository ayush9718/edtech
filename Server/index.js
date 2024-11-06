// imports
const express= require("express");
const app = express();

// middleware
require("dotenv").config();
app.use(express.json());