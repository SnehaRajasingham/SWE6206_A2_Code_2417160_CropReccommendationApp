// Module Id: SWE6206
// Assessment Title: Emerging Technologies Emerging Technologies based Industry Solutions
// Student Id: 2417160
#include <Arduino.h>
#include <WiFi.h>
#include "time.h"
#include <Firebase_ESP_Client.h>
#include "DHT.h"

// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// DHT sensor pin and type declared
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Potentiometer to mimic soil moisture sensor
#define SM 12

// Insert your network credentials
#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""

// Insert Firebase project API Key
#define API_KEY "AIzaSyAXx5Gj76bLJ0k1vN6PmHBlVU7g8cuUhLM"

// Insert RTDB URL
#define DATABASE_URL "https://crop-recommendation-syst-683a8-default-rtdb.asia-southeast1.firebasedatabase.app/"

// Define Firebase Data object
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
unsigned long timerDelay = 5000; // 5 seconds for testing
bool signupOK = false;

// Time synchronization
const char* ntpServer = "pool.ntp.org";

// Firebase database path
String databasePath = "/readings";

// Initialize WiFi
void initWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi ..");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  Serial.println("Connected!");
  Serial.println(WiFi.localIP());
}

// Function to get the current timestamp
unsigned long getTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return 0;
  }
  time(&now);
  return now;
}

void setup() {
  Serial.begin(115200);

  // Initialize DHT Sensor
  dht.begin();

  // Initialize WiFi
  initWiFi();

  // Initialize time synchronization
  configTime(0, 0, ntpServer);

  Serial.println("1");

  // Initialize Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  Serial.println("2");

  Firebase.reconnectWiFi(true);
  fbdo.setResponseSize(4096);

  Serial.println("3");
  // Set up token status callback
  config.token_status_callback = tokenStatusCallback;

  // Assign the maximum retry for token generation
  config.max_token_generation_retry = 5;

  Serial.println("4");
  
  // Sign up
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Anonymous authentication succeeded.");
    signupOK = true;
  } else {
    Serial.printf("Anonymous authentication failed, %s\n", config.signer.signupError.message.c_str());
  }

  Serial.println("5");

  Firebase.begin(&config, &auth);

  Serial.println("All Done");
}

void loop() {
  // Read humidity and temperature from DHT sensor
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // Read and map soil moisture
  int sm = analogRead(SM);
  int mappedSm = map(sm, 0, 4095, 0, 100);

  // Check if the sensor readings are valid
  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  // Print sensor readings
  // Serial.print(F("Humidity: "));
  // Serial.print(h);
  // Serial.print(F("%  Temperature: "));
  // Serial.print(t);
  // Serial.print(F("°C  Soil Moisture: "));
  // Serial.println(mappedSm);

  // Send data to Firebase at intervals
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > timerDelay || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    // Get timestamp
    unsigned long timestamp = getTime();
    String parentPath = databasePath + "/" + String(timestamp);

    // Create JSON object
    FirebaseJson json;
    json.set("humidity", h);
    json.set("temperature", t);
    json.set("soilMoisture", mappedSm);
    json.set("timestamp", timestamp);

    // Send data to Firebase
    if (Firebase.RTDB.setJSON(&fbdo, parentPath, &json)) {
      Serial.println("Data uploaded successfully.");
    } else {
      Serial.print("Failed to upload data: ");
      Serial.println(fbdo.errorReason());
    }
  }
} 