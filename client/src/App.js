// Module Id: SWE6206
// Assessment Title: Emerging Technologies Emerging Technologies based Industry Solutions
// Student Id: 2417160
import { Brightness4, Brightness7 } from "@mui/icons-material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useState } from "react";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [recCrops, setRecCrops] = useState([]);
  const [avgTemp, setAvgTemp] = useState(0);
  const [avgHumidity, setAvgHumidity] = useState(0);
  const [avgSoilMoisture, setAvgSoilMoisture] = useState(0);

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const getCrops = async () => {
    try {
      const response = await fetch("http://localhost:5000/recommend-crops");
      const data = await response.json();
      setRecCrops(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getWeather = async () => {
    try {
      const response = await fetch("http://localhost:5000/readings");
      const data = await response.json();
      setAvgTemp(data.avgTemperature);
      setAvgHumidity(data.avgHumidity);
      setAvgSoilMoisture(data.avgSoilMoisture);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Welcome to Crop Recommendation Web App
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="mode"
              onClick={() => {
                setRecCrops([]);
                setAvgTemp(0);
                setAvgHumidity(0);
                setAvgSoilMoisture(0);
              }}
            >
              <HighlightOffIcon />
            </IconButton>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="mode"
              onClick={handleThemeChange}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={getCrops}
            sx={{ mt: 2 }}
          >
            Get Recommended Crops
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={getWeather}
            sx={{ mt: 2 }}
          >
            Get Weather Data
          </Button>
          <Box sx={{ mt: 4, width: "80%" }}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Recommended Crops
                </Typography>
                <ul>
                  {recCrops.map((crop, index) => (
                    <li key={index}>{crop}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Weather Data
                </Typography>
                <Typography variant="body1">
                  Average Temperature: {avgTemp}°C
                </Typography>
                <Typography variant="body1">
                  Average Humidity: {avgHumidity}%
                </Typography>
                <Typography variant="body1">
                  Average Soil Moisture: {avgSoilMoisture}%
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
