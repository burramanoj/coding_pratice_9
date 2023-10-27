const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedpass = await bcrypt.hash(password, 10);
  const getusername = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await db.get(getusername);
  if (dbUser === undefined) {
    let getQuery = `INSERT INTO user(username,name,password,gender,location)
        VALUES('${username}',
        '${name}',
        '${hashedpass}',
        '${gender}',
        '${location}');`;
  } else {
    response.status(400);
    response.send("User already exists");
  }
  if (password.length < 5) {
    response.status(400);
    response.send("Password is too short");
  } else {
    await db.run(getQuery);
    response.status(200);
    response.send("User created successfully");
  }
});
