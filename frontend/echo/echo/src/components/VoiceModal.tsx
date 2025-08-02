import React, { useRef, useState } from 'react';
import './VoiceModal.css'; // copy relevant styles from style.css here

const VoiceModal: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState('Tap to start recording');
  const [timer, setTimer] = useState('00:00');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timer | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    audioChunks.current = [];
    mediaRecorder.ondataavailable = e => audioChunks.current.push(e.data);

    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
      await uploadAudio(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setStatus('Recording...');
    startTimer();
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(timerIntervalRef.current!);
    setStatus('Uploading...');
  };

  const startTimer = () => {
    const start = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const mins = Math.floor(elapsed / 60000);
      const secs = Math.floor((elapsed % 60000) / 1000);
      setTimer(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    }, 1000);
  };

  const uploadAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    const response = await fetch('http://localhost:8000/detect-emotion-from-audio', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setStatus(`Emotion: ${data.emotion} (${(data.confidence * 100).toFixed(1)}%)`);
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn btn-primary">Record Memory</button>
      {showModal && (
        <div className="modal active" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Record a Memory</h2>
            <p className="modal-subtitle">Speak clearly about someone or something you want ECHO to remember.</p>
            <div className="ai-voice-container">
              <button
                className={`voice-input-button ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : handleStartRecording}
              >
                {isRecording ? '⏸️' : '🎤'}
              </button>
              <div className={`recording-status ${isRecording ? 'active' : ''}`}>
                {status} <span className="recording-timer">{timer}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceModal;
