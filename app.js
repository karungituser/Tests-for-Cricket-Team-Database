const express = require("express");
const { open } = require("sqlite");
const path = require("path");

const sqlite3 = require("sqlite3");
const databasePath = path.join(__dirname, "cricketTeam.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectIntoResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get API1

app.get("/players/", async (request, response) => {
  const getPlayersInTeam = `SELECT * FROM cricket_team;`;
  const playersArray = await database.all(getPlayersInTeam);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectIntoResponseObject(eachPlayer)
    )
  );
});

//Post API2

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayersInTeam = `INSERT INTO cricket_team (player_name,jersey_number,role) VALUES('${playerName}','${jerseyNumber}','${role}');`;
  await database.run(postPlayersInTeam);
  response.send("Player Added to Team");
});

//Get API3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerInTeam = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const player = await database.get(getPlayerInTeam);
  response.send(convertDbObjectIntoResponseObject(player));
});

//Put API4

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerInTeam = `UPDATE cricket_team 
    SET player_name = '${playerName}',jersey_number='${jerseyNumber}',role='${role}'
    WHERE player_id = '${playerId}';`;
  await database.run(updatePlayerInTeam);
  response.send("Player Details Updated");
});

//Delete API5

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerInTeam = `DELETE FROM cricket_team WHERE player_id='${playerId}';`;
  await database.run(deletePlayerInTeam);
  response.send("Player Removed");
});

module.exports = app;
