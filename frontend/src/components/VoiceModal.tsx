import React, { useRef, useState, useEffect } from 'react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('Tap to start recording');
  const [recordingTimer, setRecordingTimer] = useState('00:00');
  const [showSuccess, setShowSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState('Record a Memory');
  const [modalSubtitle, setModalSubtitle] = useState('Speak clearly about a person, place, or event you want ECHO to remember.');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      resetModalState();
    }
  }, [isOpen]);

  const resetModalState = () => {
    setIsRecording(false);
    setRecordingStatus('Tap to start recording');
    setRecordingTimer('00:00');
    setShowSuccess(false);
    setModalTitle('Record a Memory');
    setModalSubtitle('Speak clearly about a person, place, or event you want ECHO to remember.');
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        uploadAudioToBackend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      recordingStartTimeRef.current = Date.now();
      startTimer();

      setIsRecording(true);
      setRecordingStatus('Recording...');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setRecordingStatus('Microphone access denied or error.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    setIsRecording(false);
  };

  const startTimer = () => {
    timerIntervalRef.current = setInterval(() => {
      const elapsedTime = Date.now() - recordingStartTimeRef.current;
      const minutes = Math.floor(elapsedTime / 60000);
      const seconds = Math.floor((elapsedTime % 60000) / 1000);
      setRecordingTimer(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);
  };

  const showSuccessState = () => {
    setShowSuccess(true);
    setRecordingStatus('Memory successfully recorded!');
    setModalTitle('Memory Saved!');
    setModalSubtitle('Your memory has been successfully anchored with ECHO.');
  };

  const uploadAudioToBackend = async (audioBlob: Blob) => {
    setRecordingStatus('Uploading and analyzing...');
    setShowSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      
      const response = await fetch('http://localhost:8000/detect-emotion-from-audio', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Server error');
      
      const data = await response.json();
      showSuccessState();
      
      let resultMsg = `\n\nDetected Emotion: ${data.emotion} (Confidence: ${(data.confidence * 100).toFixed(1)}%)`;
      if (data.original_text) {
        resultMsg += `\nTranscribed Text: ${data.original_text}`;
      }
      
      setRecordingStatus(prev => prev + resultMsg);
    } catch (err) {
      setRecordingStatus('Error uploading or analyzing audio.');
      setModalTitle('Error');
      setModalSubtitle('Could not analyze your memory. Please try again.');
    }
  };

  const handleNewRecording = () => {
    resetModalState();
  };

  if (!isOpen) return null;

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{modalTitle}</h3>
        <p className="modal-subtitle">{modalSubtitle}</p>
        
        <div className="ai-voice-container">
          {!showSuccess && (
            <button 
              className={`voice-input-button ${isRecording ? 'recording' : ''}`}
              onClick={startRecording}
              disabled={isRecording}
            >
              <span>🎤</span>
            </button>
          )}
          
          <div className="voice-waves" style={{ display: isRecording ? 'flex' : 'none' }}>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
            <div className="wave-bar"></div>
          </div>
          
          <p className={`recording-status ${isRecording ? 'active' : ''}`}>
            {recordingStatus}
            <span className="recording-timer">{recordingTimer}</span>
          </p>
        </div>
        
        <div className={`success-checkmark ${showSuccess ? 'show' : ''}`}></div>
        
        <div className="modal-actions">
          {!isRecording && !showSuccess && (
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          )}
          
          {isRecording && (
            <button className="btn btn-primary" onClick={stopRecording}>
              Stop & Save
            </button>
          )}
          
          {showSuccess && (
            <>
              <button className="btn btn-primary" onClick={handleNewRecording}>
                New Recording
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceModal;
