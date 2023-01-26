import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WebcamRecorder() {
  const [stream, setStream] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    async function getMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setStream(mediaStream);
      } catch (err) {
        console.error(err);
      }
    }
    getMedia();
  }, []);

  useEffect(() => {
    if (recorder) {
      recorder.ondataavailable = e => {
        // console.log('hi');
        console.log(e.data);
        // setRecordedChunks((prevChunks) => {
        //   console.log(prevChunks);
        //   return [...prevChunks, e.data]
        // });
        setRecordedChunks(r => [...r, e.data])
      };
    }
  }, [recorder]);

  useEffect(() => {
    if (recorder && recorder.state === 'recording') {
      let animationFrameId;
      const start = performance.now();
      const step = (timestamp) => {
        setTime(Math.round((timestamp - start) / 1000));
        animationFrameId = requestAnimationFrame(step);
      };
      animationFrameId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [recorder]);

  const startRecording = () => {
    if (stream) {
      const options = { mimeType: 'video/webm;codecs=vp9' };
      const newRecorder = new MediaRecorder(stream, options);

      setRecorder(newRecorder);
      setTime(0);
      newRecorder.start();
    }
  };

  const stopRecording = async () => {
    if (recorder) {
      recorder.stop();
      console.log(recordedChunks);
      const recordedBlobs = new Blob(recordedChunks, {
        type: 'video/webm'
      });
      console.log('recoredeblobs');
      console.log(recordedBlobs);
      
      const file = new File([recordedBlobs], 'recordedVideo3.webm', {
        type: 'video/webm'
      });
      console.log('file');
      console.log(file);
      let formData = new FormData();
      formData.append('video', file);
      for (let value of formData.values()) {
        console.log(value);
      }
      try {
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
        await axios.post('http://210.178.239.160:3000/index/upload', formData, config);
        
        console.log('Video successfully uploaded');
      } catch (err) {
        console.error(err);
      }
    }
  };
 
  return (
    <>
      <video
        ref={ref => {
          if (ref) {
            ref.srcObject = stream;
          }
        }}
        autoPlay
        style={{ width: '320px', height: '240px' }}
      />
      <div> Recording Time: {time}s </div>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
    </>
  );
}
export default WebcamRecorder;