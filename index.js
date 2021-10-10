const express = require("express");
const cors = require("cors");
const app = express();

const port = process.env.PORT;

require("./src/db/mongoose");

const userRouter = require("./src/routers/userRouter");
const adRouter = require("./src/routers/adRouter");

app.use(cors());
app.use(express.json())
app.use(userRouter);
app.use(adRouter);

app.listen(port, () => {
    console.log("Server connected: ", port)
})