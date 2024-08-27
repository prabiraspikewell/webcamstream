import WebcamCapture from "./component/WebCamCapture"
import './App.css'
import StreamWebCam from "./component/StreamWebCam"
export default function App() {
  return (
    <div className="bg-slate-300 main-container flex justify-center">
        {/* <WebcamCapture/> */}
        <StreamWebCam/>
    </div>
  )
}