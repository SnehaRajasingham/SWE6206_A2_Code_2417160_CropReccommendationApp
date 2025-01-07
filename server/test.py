import json
import os
import pickle
import subprocess
import sys

import numpy as np
import pandas as pd


def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", package])

def ensure_dependencies():
    try:
        import sklearn
        if sklearn.__version__ != '1.3.2':
            print("Installing scikit-learn 1.3.2...")
            install('scikit-learn==1.3.2')
    except ImportError:
        print("scikit-learn not found. Installing scikit-learn 1.3.2...")
        install('scikit-learn==1.3.2')
    
    try:
        import pandas
    except ImportError:
        print("pandas not found. Installing pandas...")
        install('pandas')
    
    try:
        import numpy
    except ImportError:
        print("numpy not found. Installing numpy...")
        install('numpy')

    try:
        import joblib
    except ImportError:
        print("joblib not found. Installing joblib...")
        install('joblib')

    try:
        import pyodbc
    except ImportError:
        print("pyodbc not found. Installing pyodbc...")
        install('pyodbc')

# Path to the saved model
RF_pkl_filename = os.path.abspath('C:\\Users\\Shahe\\OneDrive\\Desktop\\ET\\server\\RandomForest3.pkl')

def recommend_crops(temperature, humidity):
    try:
        # Load the model from the file
        with open(RF_pkl_filename, 'rb') as file:
            loaded_RF = pickle.load(file)
    except FileNotFoundError:
        print(f"Error: The file {RF_pkl_filename} was not found.")
        return []
    except Exception as e:
        print(f"Error loading model: {e}")
        return []

    # Create a DataFrame with the input parameters
    input_data = pd.DataFrame([[0, 0, 0, temperature, humidity, 7.0, 100.0]],
                              columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'])

    try:
        # Get probabilities for all crops
        probabilities = loaded_RF.predict_proba(input_data)[0]

        # Get indices of top 3 probabilities
        top_indices = np.argsort(probabilities)[-3:][::-1]

        # Get corresponding crop labels
        crop_labels = loaded_RF.classes_[top_indices]

        return crop_labels.tolist()
    except Exception as e:
        print(f"Error during prediction: {e}")
        return []

# Example usage
if __name__ == "__main__":
    # Ensure dependencies are installed
    ensure_dependencies()
    
    try:
        temperature = float(sys.argv[1])
        humidity = float(sys.argv[2])
        recommendations = recommend_crops(temperature, humidity)
        print(json.dumps(recommendations))
    except IndexError:
        print("Error: Please provide temperature and humidity as arguments.")
    except ValueError:
        print("Error: Invalid input. Please provide numeric values for temperature and humidity.")
    except Exception as e:
        print(f"Unexpected error: {e}")