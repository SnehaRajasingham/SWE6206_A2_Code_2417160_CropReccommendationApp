// Module Id: SWE6206
// Assessment Title: Emerging Technologies Emerging Technologies based Industry Solutions
// Student Id: 2417160
const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");

// Load the service account key JSON file
const serviceAccount = require("./serviceAccountKey.json");

// Initialize the Firebase app with the service account
initializeApp({
  credential: cert(serviceAccount),
  databaseURL:
    "https://crop-recommendation-syst-683a8-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = getDatabase();
const app = express();
app.use(cors());
const port = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// POST endpoint to recommend crops
app.get("/recommend-crops", async (req, res) => {
  const { avgTemperature, avgHumidity, avgSoilMoisture } =
    await getFirebaseReadings();

  const command = `python test.py ${avgTemperature} ${avgHumidity}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return res.status(500).send(`Error executing command: ${error.message}`);
    }

    if (stderr) {
      console.error(`Error in script: ${stderr}`);
      return res.status(500).send(`Error in script: ${stderr}`);
    }

    res.status(200).send(stdout);
  });
});

// GET endpoint to retrieve readings from Firebase
app.get("/readings", async (req, res) => {
  try {
    const { avgTemperature, avgHumidity, avgSoilMoisture } =
      await getFirebaseReadings();

    res.status(200).send({
      avgTemperature: avgTemperature,
      avgHumidity: avgHumidity,
      avgSoilMoisture: avgSoilMoisture,
    });
  } catch (error) {
    console.error(`Error fetching readings: ${error.message}`);
    res
      .status(500)
      .send({ error: `Error fetching readings: ${error.message}` });
  }
});

async function getFirebaseReadings() {
  const readingsRef = db.ref("readings");
  const snapshot = await readingsRef.get();

  if (!snapshot.exists()) {
    return res.status(404).send({ message: "No readings found." });
  }

  const rawData = snapshot.val();

  const readings = Object.values(rawData);
  const avgTemperature = readings.reduce(
    (acc, reading) => acc + reading.temperature,
    0
  );
  const avgHumidity = readings.reduce(
    (acc, reading) => acc + reading.humidity,
    0
  );
  const avgSoilMoisture = readings.reduce(
    (acc, reading) => acc + reading.soilMoisture,
    0
  );

  return {
    avgTemperature: (avgTemperature / readings.length).toFixed(2),
    avgHumidity: (avgHumidity / readings.length).toFixed(2),
    avgSoilMoisture: (avgSoilMoisture / readings.length).toFixed(2),
  };
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
