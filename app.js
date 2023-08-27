const exp = require("express");
const app = exp();
const { open } = require("sqlite");
const path = require("path");
const dbpath = path.join(__dirname, "moviesData.db");
const sqlite3 = require("sqlite3");
app.use(exp.json());
let db = null;

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
    //  console.log("start");
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initialize();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const direc = (dbobj) => {
  return {
    directorId: dbobj.director_id,
    directorName: dbobj.director_name,
  };
};

app.get("/movies/", async (req, resp) => {
  const movienameq = `SELECT movie_name FROM movie;`;
  const movielist = await db.all(movienameq);
  resp.send(
    movielist.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (req, resp) => {
  const movieDetails = req.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addmovie = `INSERT INTO movie (director_id,movie_name,lead_actor) 
    VALUES ('${directorId}','${movieName}','${leadActor}');`;
  const dbresp = await db.run(addmovie);
  const movieId = dbresp.lastID;
  resp.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (req, resp) => {
  const { movieId } = req.params;
  //console.log(movieId);
  const getmovie = `SELECT * FROM movie WHERE movie_id= ${movieId} ;`;
  //console.log(getmovie);
  const movi = await db.get(getmovie);
  // console.log(movi);
  resp.send(convertDbObjectToResponseObject(movi));
});

app.put("/movies/:movieId/", async (req, resp) => {
  const { movieId } = req.params;
  const movieDet = req.body;
  const { directorId, movieName, leadActor } = movieDet;
  const movieupd = `UPDATE movie SET director_id='${directorId}',movie_name='${movieName}'
    ,lead_actor='${leadActor}' WHERE movie_id='${movieId}';`;
  await db.run(movieupd);
  resp.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (req, resp) => {
  const { movieId } = req.params;
  const delq = `DELETE FROM movie WHERE movie_id='${movieId}';`;
  await db.run(delq);
  resp.send("Movie Removed");
});

app.get("/directors/", async (req, resp) => {
  const dirq = `SELECT * FROM director;`;
  const dirlist = await db.all(dirq);
  resp.send(dirlist.map((dir) => direc(dir)));
});

app.get("/directors/:directorId/movies/", async (req, resp) => {
  const { directorId } = req.params;
  const dirmovq = `SELECT * FROM movie 
    WHERE director_id='${directorId}';`;
  const movlis = await db.all(dirmovq);
  resp.send(movlis.map((mov) => ({ movieName: mov.movie_name })));
});

module.exports = app;
