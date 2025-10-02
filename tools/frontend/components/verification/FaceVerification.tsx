'use client';

import { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerificationManager } from '@/hooks';
import { AlertCircle, Camera, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function FaceVerification() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [faceData, setFaceData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { submitVerification, isPending, isConfirming, isSuccess } = useVerificationManager();

    // Load face-api.js models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models'; // You'll need to add models to public/models
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
            } catch (err) {
                setError('Failed to load face detection models');
                console.error(err);
            }
        };
        loadModels();
    }, []);

    // Start webcam
    const startCapture = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCapturing(true);
                detectFace();
            }
        } catch (err) {
            setError('Failed to access webcam. Please grant camera permissions.');
            console.error(err);
        }
    };

    // Stop webcam
    const stopCapture = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCapturing(false);
            setFaceDetected(false);
        }
    };

    // Detect face in real-time
    const detectFace = async () => {
        if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

        const detections = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detections) {
            setFaceDetected(true);

            // Draw detection on canvas
            const displaySize = { width: 640, height: 480 };
            faceapi.matchDimensions(canvasRef.current, displaySize);

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, 640, 480);
                faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
            }
        } else {
            setFaceDetected(false);
        }

        if (isCapturing) {
            setTimeout(() => detectFace(), 100);
        }
    };

    // Capture face data for verification
    const captureFace = async () => {
        if (!videoRef.current || !faceDetected) {
            setError('No face detected. Please ensure your face is clearly visible.');
            return;
        }

        try {
            const detections = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detections) {
                // Convert face descriptor to hex string for blockchain storage
                const descriptor = Array.from(detections.descriptor);
                const descriptorHash = '0x' + descriptor.map(n =>
                    Math.floor((n + 1) * 127).toString(16).padStart(2, '0')
                ).join('');

                setFaceData(descriptorHash);
                stopCapture();
            }
        } catch (err) {
            setError('Failed to capture face data');
            console.error(err);
        }
    };

    // Submit to blockchain
    const handleSubmit = async () => {
        if (!faceData) {
            setError('Please capture your face first');
            return;
        }

        try {
            await submitVerification('face', faceData as `0x${string}`);
        } catch (err) {
            setError('Failed to submit verification');
            console.error(err);
        }
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Face Verification</CardTitle>
                <CardDescription>
                    Use your webcam to capture your face for biometric verification
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!modelsLoaded && (
                    <Alert>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertDescription>Loading face detection models...</AlertDescription>
                    </Alert>
                )}

                {isSuccess && (
                    <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>Face verification submitted successfully!</AlertDescription>
                    </Alert>
                )}

                <div className="relative">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full rounded-lg border"
                        style={{ display: isCapturing ? 'block' : 'none' }}
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full"
                        style={{ display: isCapturing ? 'block' : 'none' }}
                    />

                    {!isCapturing && !faceData && (
                        <div className="flex items-center justify-center h-64 bg-muted rounded-lg border-2 border-dashed">
                            <div className="text-center">
                                <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Click Start Capture to begin
                                </p>
                            </div>
                        </div>
                    )}

                    {faceData && !isCapturing && (
                        <div className="flex items-center justify-center h-64 bg-muted rounded-lg border-2 border-solid border-green-500">
                            <div className="text-center">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                <p className="text-sm font-medium">Face captured successfully!</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Ready to submit verification
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    {!isCapturing && !faceData && (
                        <Button
                            onClick={startCapture}
                            disabled={!modelsLoaded}
                            className="flex-1"
                        >
                            <Camera className="mr-2 h-4 w-4" />
                            Start Capture
                        </Button>
                    )}

                    {isCapturing && (
                        <>
                            <Button
                                onClick={captureFace}
                                disabled={!faceDetected}
                                className="flex-1"
                            >
                                {faceDetected ? 'Capture Face' : 'No Face Detected'}
                            </Button>
                            <Button
                                onClick={stopCapture}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </>
                    )}

                    {faceData && !isCapturing && (
                        <>
                            <Button
                                onClick={handleSubmit}
                                disabled={isPending || isConfirming}
                                className="flex-1"
                            >
                                {isPending || isConfirming ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Verification'
                                )}
                            </Button>
                            <Button
                                onClick={() => {
                                    setFaceData(null);
                                    setFaceDetected(false);
                                }}
                                variant="outline"
                            >
                                Retake
                            </Button>
                        </>
                    )}
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Ensure good lighting for best results</p>
                    <p>• Look directly at the camera</p>
                    <p>• Remove glasses if possible</p>
                    <p>• Your face data is encrypted before submission</p>
                </div>
            </CardContent>
        </Card>
    );
}
