import React, { useRef, useState } from "react";

const WebcamCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [streamingActive, setStreamingActive] = useState(false);
  const [ws, setWs] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    setCameraActive(true);
  };

  const stopCamera = () => {
    if (ws) {
      ws.close();
    }
    let tracks = videoRef.current.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setCameraActive(false);
    stopStreaming(); // Ensure streaming is stopped if camera is stopped
  };

  const startStreaming = () => {
    const socket = new WebSocket("ws://localhost:8000/ws/stream");
    setWs(socket);

    socket.onopen = () => {
      console.log("WebSocket connection established");
      setStreamingActive(true);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 640;
      canvas.height = 480;

      const streamVideo = () => {
        if (cameraActive && socket.readyState === WebSocket.OPEN) {
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              console.log('Blob size:', blob.size);
              socket.send(blob);
            } else {
              console.log('Blob is null');
            }
          }, "image/jpeg");
        }
      };
      const id = setInterval(streamVideo, 300); 
      setIntervalId(id);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      setStreamingActive(false);
      clearInterval(intervalId); 
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStreamingActive(false);
      clearInterval(intervalId); 
    };
  };

  const stopStreaming = () => {
    if (ws) {
      ws.close();
    }
    setStreamingActive(false);
    if (intervalId) {
      clearInterval(intervalId); 
    }
  };

  return (
    <div className="webcam-container">
      <div className="video-container bg-slate-400 my-5">
        <video ref={videoRef} autoPlay />
        <canvas ref={canvasRef} width="640" height="480" style={{ display: "none" }} />
      </div>
      <div className="button-container flex justify-center gap-4">
        {!cameraActive ? (
          <button onClick={startCamera} className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">
            Start Camera
          </button>
        ) : (
          <>
            {!streamingActive ? (
              <button onClick={startStreaming} className="focus:outline-none text-white bg-green-600 hover:bg-green-700 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                Start Streaming
              </button>
            ) : (
              <button onClick={stopStreaming} className="focus:outline-none text-white bg-red-600 hover:bg-red-700 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                Stop Streaming
              </button>
            )}
            <button onClick={stopCamera} className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
              Stop Camera
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
