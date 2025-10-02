#!/bin/bash

# Face-API.js Model Downloader
# Downloads required models for face verification

set -e

echo "🎭 Face-API.js Model Downloader"
echo "================================"

# Create models directory
MODELS_DIR="$(dirname "$0")/../public/models"
mkdir -p "$MODELS_DIR"
cd "$MODELS_DIR"

echo "📁 Models directory: $MODELS_DIR"
echo ""

BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master"

# Tiny Face Detector
echo "⬇️  Downloading Tiny Face Detector..."
curl -L "${BASE_URL}/tiny_face_detector/tiny_face_detector_model-weights_manifest.json" -o tiny_face_detector_model-weights_manifest.json
curl -L "${BASE_URL}/tiny_face_detector/tiny_face_detector_model-shard1" -o tiny_face_detector_model-shard1

# Face Landmarks 68
echo "⬇️  Downloading Face Landmarks 68..."
curl -L "${BASE_URL}/face_landmark_68/face_landmark_68_model-weights_manifest.json" -o face_landmark_68_model-weights_manifest.json
curl -L "${BASE_URL}/face_landmark_68/face_landmark_68_model-shard1" -o face_landmark_68_model-shard1

# Face Recognition
echo "⬇️  Downloading Face Recognition Model..."
curl -L "${BASE_URL}/face_recognition/face_recognition_model-weights_manifest.json" -o face_recognition_model-weights_manifest.json
curl -L "${BASE_URL}/face_recognition/face_recognition_model-shard1" -o face_recognition_model-shard1
curl -L "${BASE_URL}/face_recognition/face_recognition_model-shard2" -o face_recognition_model-shard2

echo ""
echo "✅ All models downloaded successfully!"
echo ""
echo "📋 Downloaded files:"
ls -lh

echo ""
echo "🎉 Face verification is now ready to use!"
