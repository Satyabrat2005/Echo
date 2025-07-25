document.addEventListener('DOMContentLoaded', () => {
    const addSpeechBtn = document.getElementById('addSpeechBtn');
    const voiceModal = document.getElementById('voiceModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const recordButton = document.getElementById('recordButton');
    const stopRecordingBtn = document.getElementById('stopRecordingBtn');
    const cancelRecordingBtn = document.getElementById('cancelRecordingBtn');
    const newRecordingBtn = document.getElementById('newRecordingBtn');
    const recordingStatus = document.getElementById('recordingStatus');
    const recordingTimer = document.getElementById('recordingTimer');
    const voiceWaves = document.getElementById('voiceWaves');
    const recordIcon = document.getElementById('recordIcon');
    const successCheckmark = document.getElementById('successCheckmark');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const aiVoiceContainer = document.querySelector('.ai-voice-container');
    const modalActions = document.querySelector('.modal-actions');

    let mediaRecorder;
    let audioChunks = [];
    let recordingStartTime;
    let timerInterval;

    // Open the modal
    addSpeechBtn.addEventListener('click', () => {
        voiceModal.classList.add('active');
        resetModalState();
    });

    // Close the modal
    closeModalBtn.addEventListener('click', () => {
        voiceModal.classList.remove('active');
        stopRecording(); // Ensure recording stops if modal is closed via this button
    });

    // Close modal on outside click (optional)
    voiceModal.addEventListener('click', (e) => {
        if (e.target === voiceModal) {
            voiceModal.classList.remove('active');
            stopRecording();
        }
    });

    // Start recording
    recordButton.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                // Upload the audioBlob to the backend
                uploadAudioToBackend(audioBlob);
                stream.getTracks().forEach(track => track.stop()); // Stop microphone access
            };

            mediaRecorder.start();
            recordingStartTime = Date.now();
            startTimer();

            recordButton.classList.add('recording');
            recordIcon.textContent = '⏸️'; // Change icon to pause/stop
            recordingStatus.classList.add('active');
            recordingStatus.innerHTML = 'Recording... <span class="recording-timer" id="recordingTimer">00:00</span>';
            voiceWaves.classList.add('active');

            stopRecordingBtn.style.display = 'inline-flex';
            cancelRecordingBtn.style.display = 'inline-flex';
            recordButton.style.display = 'none'; // Hide record button during recording
            newRecordingBtn.style.display = 'none';
            closeModalBtn.style.display = 'none';
        } catch (err) {
            console.error('Error accessing microphone:', err);
            recordingStatus.textContent = 'Microphone access denied or error.';
            recordingStatus.style.color = 'red';
            // Optionally, show a "Try again" button or instructions
        }
    });

    // Stop recording
    stopRecordingBtn.addEventListener('click', () => {
        stopRecording();
    });

    // Cancel recording
    cancelRecordingBtn.addEventListener('click', () => {
        stopRecording();
        resetModalState();
    });

    // Start a new recording
    newRecordingBtn.addEventListener('click', () => {
        resetModalState();
    });

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            clearInterval(timerInterval);
        }
        recordButton.classList.remove('recording');
        voiceWaves.classList.remove('active');
        recordIcon.textContent = '🎤'; // Reset icon to microphone
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            const elapsedTime = Date.now() - recordingStartTime;
            const minutes = Math.floor(elapsedTime / 60000);
            const seconds = Math.floor((elapsedTime % 60000) / 1000);
            // Always get the timer element in case DOM changes
            const timerElem = document.getElementById('recordingTimer');
            if (timerElem) {
                timerElem.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                timerElem.style.display = 'inline';
            }
        }, 1000);
    }

    function resetModalState() {
        stopRecording(); // Ensure any active recording is stopped
        recordButton.style.display = 'inline-flex';
        stopRecordingBtn.style.display = 'none';
        cancelRecordingBtn.style.display = 'inline-flex'; // Keep cancel visible for initial state
        newRecordingBtn.style.display = 'none';
        closeModalBtn.style.display = 'none';
        
        recordingStatus.classList.remove('active');
        recordingStatus.textContent = 'Tap to start recording';
        // Always get the timer element and reset
        const timerElem = document.getElementById('recordingTimer');
        if (timerElem) {
            timerElem.textContent = '00:00';
            timerElem.style.display = 'inline';
        }
        voiceWaves.classList.remove('active');
        successCheckmark.classList.remove('show');

        // Reset title and subtitle if they were changed
        document.querySelector('.modal-title').textContent = 'Record a Memory';
        document.querySelector('.modal-subtitle').textContent = 'Speak clearly about a person, place, or event you want ECHO to remember.';
    }

    function showSuccessState() {
        recordButton.style.display = 'none';
        stopRecordingBtn.style.display = 'none';
        cancelRecordingBtn.style.display = 'none';
        voiceWaves.classList.remove('active');

        successCheckmark.classList.add('show');
        recordingStatus.classList.remove('active');
        recordingStatus.textContent = 'Memory successfully recorded!';
        recordingStatus.style.color = 'var(--accent-primary)';

        newRecordingBtn.style.display = 'inline-flex';
        closeModalBtn.style.display = 'inline-flex';

        // Update modal title and subtitle for success
        document.querySelector('.modal-title').textContent = 'Memory Saved!';
        document.querySelector('.modal-subtitle').textContent = 'Your memory has been successfully anchored with ECHO.';
    }

    // Add this function to handle upload and response display
    async function uploadAudioToBackend(audioBlob) {
        const recordingStatus = document.getElementById('recordingStatus');
        const successCheckmark = document.getElementById('successCheckmark');
        const modalTitle = document.querySelector('.modal-title');
        const modalSubtitle = document.querySelector('.modal-subtitle');
        // Show uploading state
        recordingStatus.textContent = 'Uploading and analyzing...';
        recordingStatus.style.color = '';
        successCheckmark.classList.remove('show');
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.wav');
            // Change the URL below if your backend runs on a different port or host
            const response = await fetch('http://localhost:8000/detect-emotion-from-audio', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Server error');
            const data = await response.json();
            // Show success state and backend response
            showSuccessState();
            // Add emotion result below the success message
            let resultMsg = `\n\n<b>Detected Emotion:</b> ${data.emotion} (Confidence: ${(data.confidence * 100).toFixed(1)}%)`;
            if (data.original_text) {
                resultMsg += `<br/><b>Transcribed Text:</b> ${data.original_text}`;
            }
            // Optionally, show a custom response message if you want
            // resultMsg += `<br/><b>AI Response:</b> ${data.response || ''}`;
            recordingStatus.innerHTML += resultMsg;
            recordingStatus.style.color = 'var(--accent-primary)';
        } catch (err) {
            recordingStatus.textContent = 'Error uploading or analyzing audio.';
            recordingStatus.style.color = 'red';
            successCheckmark.classList.remove('show');
            modalTitle.textContent = 'Error';
            modalSubtitle.textContent = 'Could not analyze your memory. Please try again.';
        }
    }
});
