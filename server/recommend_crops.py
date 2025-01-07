import json
import pickle
import sys

import numpy as np
import pandas as pd

# Load the trained Random Forest model
RF_pkl_filename = 'C:\\Users\\Shahe\\OneDrive\\Desktop\\ET\\server\\RandomForest3.pkl'
with open(RF_pkl_filename, 'rb') as RF_Model_pkl:
    RF = pickle.load(RF_Model_pkl)

def recommend_crops(temperature, humidity):
    return ['rice', 'maize', 'chickpea']
    # Create a DataFrame with the input parameters
    input_data = pd.DataFrame([[0, 0, 0, temperature, humidity, 7.00, 100.0]],
                             columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'])

    print(input_data)
    # Get probabilities for all crops
    probabilities = RF.predict_proba(input_data)[0]

    # Get indices of top 3 probabilities
    top_indices = np.argsort(probabilities)[-3:][::-1]

    # Get corresponding crop labels
    crop_labels = RF.classes_[top_indices]

    return crop_labels.tolist()

if __name__ == "__main__":
    temperature = float(sys.argv[1])
    humidity = float(sys.argv[2])
    recommended_crops = recommend_crops(temperature, humidity)
    print(json.dumps(recommended_crops))