import React, { useRef, useState } from 'react';
import axios from 'axios';

const VideoRecorder = () => {
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recordedChunks, setRecordedChunks] = useState([]);

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                webcamRef.current.srcObject = stream;
                mediaRecorderRef.current = new MediaRecorder(stream);

                mediaRecorderRef.current.ondataavailable = event => {
                    setRecordedChunks(recordedChunks.push(event.data))
                };

                mediaRecorderRef.current.onstop = () => {
                    console.log('recorded chunks', recordedChunks)
                    const blob = new Blob(recordedChunks, { type: 'video/webm' });
                    const formData = new FormData();

                    formData.append('user_id', 1);
                    formData.append('video_file', blob);
                    console.log(blob)

                    axios.post('http://localhost:8000/api/model/', formData)
                        .then(response => {
                            console.log(response.data);
                        })
                        .catch(error => {
                            console.error(error);
                        });

                    setRecordedChunks([]);
                };

                mediaRecorderRef.current.start();
            })
            .catch(error => {
                console.error('Error accessing webcam:', error);
            });
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            webcamRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    return (
        <div>
            <video ref={webcamRef} autoPlay />
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
        </div>
    );
};

export default VideoRecorder;