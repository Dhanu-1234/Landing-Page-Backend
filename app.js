const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(bodyParser.json());

const dbPath = path.join(__dirname, "LandingPage.db");

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

app.post('/userAuthenticate', async(request,response)=>{
    const {email, password} = request.body;
    const requestQuery = `
    SELECT
        *
    FROM
        users
    WHERE
        email LIKE '%${email}%' AND
        password LIKE '%${password}%';`
    const dbResponse = await db.get(requestQuery);
    if(dbResponse === undefined){
        response.status(401)
        response.send("Incorrect email or password");
    }else {
        response.status(200);
        response.send("Login successful");
    }
})

app.post('/technicians', async(request,response)=>{
    const {location, appliance} = request.body;
    const requestQUery1 = `
    SELECT
        *
    FROM
        technicians
    WHERE
        location LIKE '%${location}%' AND
        specialization LIKE '%${appliance}%';
    `
    const requestQUery2 = `
    SELECT
        *
    FROM
        technicians
    WHERE
        location LIKE '%${location}%';
    `
    const dbResponse = appliance === "ALL" ? await db.all(requestQUery2): await db.all(requestQUery1);
    response.send(dbResponse);
});

module.exports = app;