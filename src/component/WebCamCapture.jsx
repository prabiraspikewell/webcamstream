import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const WebcamCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    setCameraActive(true);
  };

  const stopCamera = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    let tracks = videoRef.current.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setCameraActive(false);
    setStreaming(false);
  };

  const startStreaming = () => {
    const id = setInterval(() => {
      captureFrameAndSend();
    }, 100); 
    setIntervalId(id);
    setStreaming(true);
  };

  const stopStreaming = () => {
    clearInterval(intervalId);
    setStreaming(false);
  };

  const captureFrameAndSend = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("frame", blob, "frame.jpg");

      try {
        await axios.post("http://localhost:8000/process-frame", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (error) {
        console.error("Error sending frame:", error);
      }
    }, "image/jpeg");
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <div className="webcam-container">
      <div className="video-container bg-slate-400 my-5 ">
        <video ref={videoRef} autoPlay />
        <canvas ref={canvasRef} width="640" height="480" style={{ display: "none" }} />
      </div>
      <div className="button-container flex justify-center gap-4">
        {!cameraActive ? (
          <button
            onClick={startCamera}
            className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
          >
            Start Camera
          </button>
        ) : streaming ? (
          <button
            onClick={stopStreaming}
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            Stop Streaming
          </button>
        ) : (
          <button
            onClick={startStreaming}
            className="focus:outline-none text-white bg-green-600 hover:bg-green-700 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          >
            Start Streaming
          </button>
        )}
        {cameraActive && (
          <button
            onClick={stopCamera}
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
