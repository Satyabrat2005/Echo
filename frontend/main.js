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
                // Here you would typically upload the audioBlob to a server
                console.log('Audio recorded:', audioBlob);
                showSuccessState();
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
            recordingTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
        recordingTimer.textContent = '00:00';
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
});
