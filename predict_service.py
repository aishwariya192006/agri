"""
Plant Disease Prediction Service
Runs on http://localhost:5050
POST /predict  — multipart form with field 'image'
"""
import os, json, io
import numpy as np
from flask import Flask, request, jsonify
from PIL import Image
import tensorflow as tf

MODEL_DIR  = os.path.join(os.path.dirname(__file__), "agri", "agrimate", "backend", "ml_model")
MODEL_PATH = os.path.join(MODEL_DIR, "plant_disease_model.keras")
NAMES_PATH = os.path.join(MODEL_DIR, "class_names.json")
IMG_SIZE   = (224, 224)

print("Loading model…")
model = tf.keras.models.load_model(MODEL_PATH)
with open(NAMES_PATH) as f:
    class_names = json.load(f)   # {index_str: "ClassName"}
print(f"Model ready — {len(class_names)} classes")

app = Flask(__name__)

def preprocess(file_bytes):
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB").resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, 0)

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image file"}), 400
    data   = request.files["image"].read()
    tensor = preprocess(data)
    preds  = model.predict(tensor, verbose=0)[0]
    top3   = np.argsort(preds)[::-1][:3]
    results = [
        {"class": class_names[str(i)], "confidence": round(float(preds[i]) * 100, 2)}
        for i in top3
    ]
    return jsonify({
        "prediction": results[0]["class"],
        "confidence": results[0]["confidence"],
        "top3": results,
    })

@app.route("/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=False)
