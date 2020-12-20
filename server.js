const express = require("express");
const connectDB = require("./config/db");
const app = express();
// Connect DB
connectDB();
// Init Middleware
// allow to get data in req.body

app.use(express.json({ extended: false }));
// test in postman (http://localhost::5000)
app.get("/", (req, res) => res.send("API Running"));
//  Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));

// Any port valiable
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server start on port ${PORT}`));
