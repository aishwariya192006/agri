import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator

DATASET_DIR = r"archive (5)\dataset_clean_final"
MODEL_DIR   = r"agri\agrimate\backend\ml_model"
IMG_SIZE    = (224, 224)
BATCH_SIZE  = 32
EPOCHS_HEAD = 5
EPOCHS_FINE = 10

os.makedirs(MODEL_DIR, exist_ok=True)

# ── Data generators ──────────────────────────────────────────────
train_gen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    zoom_range=0.1,
    validation_split=0.2,
)

train_data = train_gen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training",
    seed=42,
)

val_data = train_gen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation",
    seed=42,
)

NUM_CLASSES = len(train_data.class_indices)
print(f"Classes ({NUM_CLASSES}): {list(train_data.class_indices.keys())}")

# Save class names
class_names = {v: k for k, v in train_data.class_indices.items()}
with open(os.path.join(MODEL_DIR, "class_names.json"), "w") as f:
    json.dump(class_names, f)

# ── Build model ───────────────────────────────────────────────────
base = MobileNetV2(input_shape=(*IMG_SIZE, 3), include_top=False, weights="imagenet")
base.trainable = False

model = models.Sequential([
    base,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    layers.Dense(256, activation="relu"),
    layers.Dropout(0.3),
    layers.Dense(NUM_CLASSES, activation="softmax"),
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

# ── Phase 1: train head ───────────────────────────────────────────
print("\n=== Phase 1: Training head ===")
model.fit(train_data, validation_data=val_data, epochs=EPOCHS_HEAD)

# ── Phase 2: fine-tune top layers ────────────────────────────────
base.trainable = True
for layer in base.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-4),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

print("\n=== Phase 2: Fine-tuning ===")
callbacks = [
    tf.keras.callbacks.ModelCheckpoint(
        os.path.join(MODEL_DIR, "best_model.keras"),
        save_best_only=True, monitor="val_accuracy", verbose=1,
    ),
    tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
]

model.fit(
    train_data,
    validation_data=val_data,
    epochs=EPOCHS_FINE,
    callbacks=callbacks,
)

# ── Save final model ──────────────────────────────────────────────
model.save(os.path.join(MODEL_DIR, "plant_disease_model.keras"))
print(f"\nModel saved to {MODEL_DIR}")

# ── Evaluate ──────────────────────────────────────────────────────
loss, acc = model.evaluate(val_data)
print(f"Val accuracy: {acc*100:.2f}%")
