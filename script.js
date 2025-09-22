// DOM elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Configuration for GitHub Pages deployment
const CONFIG = {
    // Automatically detect if we're on GitHub Pages
    isGitHubPages: window.location.hostname.includes('github.io'),
    basePath: window.location.hostname.includes('github.io') ? '/MAGE' : '',
    baseUrl: window.location.origin + (window.location.hostname.includes('github.io') ? '/MAGE' : '')
};

// Utility function to construct proper file paths
function getFilePath(relativePath) {
    return CONFIG.basePath + '/' + relativePath;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAudioShowcase();
    initializeScrollAnimations();
    initializeLiveDemo();
});

// Navigation functionality
function initializeNavigation() {
    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (hamburger && navMenu) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    // Update active navigation link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`a[href="#${sectionId}"]`);

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
}

// Audio showcase functionality
async function initializeAudioShowcase() {
    const experimentsContainer = document.getElementById('experiments-container');
    
    if (!experimentsContainer) return;

    try {
        console.log('Initializing audio showcase...');
        console.log('Configuration:', CONFIG);
        
        // Define experiment order as per instructions
        const experimentOrder = ['librispeech', 'dns_no_reverb', 'dns_with_reverb', 'dns_real_records'];
        
        // Load experiments that we know exist from workspace inspection
        const knownExperiments = ['librispeech', 'dns_real_records'];
        
        experimentsContainer.innerHTML = '';
        
        for (const experiment of knownExperiments) {
            console.log(`Loading experiment: ${experiment}`);
            await loadExperiment(experiment, experimentsContainer);
        }
        
        console.log('Audio showcase initialization complete');
        
    } catch (error) {
        console.error('Error initializing audio showcase:', error);
        experimentsContainer.innerHTML = `
            <div class="error">
                <h3>Error loading audio samples</h3>
                <p>Please check the browser console for more details.</p>
                <details>
                    <summary>Technical Details</summary>
                    <pre>${error.message}</pre>
                </details>
            </div>
        `;
    }
}

async function loadExperiment(experimentName, container) {
    try {
        console.log(`Loading experiment: ${experimentName}`);
        
        // Get available models for this experiment
        const models = await getAvailableModels(experimentName);
        console.log(`Available models for ${experimentName}:`, models);
        
        // Load transcript data from all available model directories
        let allTranscripts = {};
        for (const modelKey of Object.keys(models)) {
            try {
                const transcriptPath = getFilePath(`sample/${experimentName}/${modelKey}/trans.txt`);
                console.log(`Attempting to load transcript from: ${transcriptPath}`);
                
                const transcriptResponse = await fetch(transcriptPath);
                console.log(`Transcript response for ${modelKey}:`, transcriptResponse.status, transcriptResponse.ok);
                
                if (transcriptResponse.ok) {
                    const transcriptText = await transcriptResponse.text();
                    console.log(`Transcript text for ${modelKey}:`, transcriptText.substring(0, 100) + '...');
                    
                    const modelTranscripts = parseTranscripts(transcriptText);
                    console.log(`Parsed transcripts for ${modelKey}:`, modelTranscripts);
                    
                    allTranscripts[modelKey] = modelTranscripts;
                }
            } catch (error) {
                console.log(`No transcripts found for ${experimentName}/${modelKey}:`, error);
            }
        }
        
        console.log(`All transcripts for ${experimentName}:`, allTranscripts);
        
        // Get sample files
        const samples = await getSampleFiles(experimentName, models);
        console.log(`Sample files for ${experimentName}:`, samples);
        
        // Create experiment container
        const experimentDiv = document.createElement('div');
        experimentDiv.className = 'experiment';
        experimentDiv.innerHTML = createExperimentHTML(experimentName, models, samples, allTranscripts);
        
        container.appendChild(experimentDiv);
        
        // Add event listeners for audio players
        addAudioEventListeners(experimentDiv);
        
    } catch (error) {
        console.error(`Error loading experiment ${experimentName}:`, error);
    }
}

async function getAvailableModels(experimentName) {
    // Based on workspace inspection, define available models for each experiment
    const modelMapping = {
        'librispeech': {
            'noisy': 'Noisy',
            'clean': 'Clean',
            'mage': 'MAGE',
            'flow_se': 'Flow SE',
            'sgmse': 'SGMSE',
            'storm': 'STORM'
        },
        'dns_real_records': {
            'noisy': 'Noisy', 
            'mage': 'MAGE',
            'masksr': 'MaskSR'
        }
    };
    
    return modelMapping[experimentName] || {};
}

async function getSampleFiles(experimentName, models) {
    // Based on workspace inspection, get actual filenames
    const sampleMapping = {
        'librispeech': [
            '1188-133604-0004',
            '1284-1180-0029', 
            '4992-23283-0011',
            '61-70970-0015'
        ],
        'dns_real_records': [
            'audioset_realrec_airconditioner_8v4sEeK2Owc',
            'audioset_realrec_airconditioner_EK746oGQz6E',
            'audioset_realrec_car_0AVTgzegI4s'
        ]
    };
    
    return sampleMapping[experimentName] || [];
}

function parseTranscripts(transcriptText) {
    const transcripts = {};
    const lines = transcriptText.trim().split('\n');
    
    for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
            const filename = line.substring(0, colonIndex).replace('.wav', '');
            const transcript = line.substring(colonIndex + 1).trim();
            transcripts[filename] = transcript;
        }
    }
    
    return transcripts;
}

function createExperimentHTML(experimentName, models, samples, allTranscripts) {
    const experimentTitle = experimentName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const experimentDescription = getExperimentDescription(experimentName);
    
    // Create table headers
    const modelOrder = getModelOrder(models);
    const headers = ['Sample', ...modelOrder.map(model => models[model])];
    
    let html = `
        <h3 class="experiment-title">${experimentTitle}</h3>
        <p class="experiment-description">${experimentDescription}</p>
        <div class="table-container">
            <table class="samples-table">
                <thead>
                    <tr>
                        ${headers.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Create rows for each sample
    samples.forEach((sample, index) => {
        html += `
            <tr>
                <td class="sample-index" data-label="Sample">${index + 1}</td>
        `;
        
        modelOrder.forEach(modelKey => {
            const modelLabel = models[modelKey];
            const fileExtension = experimentName === 'librispeech' && modelKey === 'clean' ? 'flac' : 'wav';
            const audioPath = getFilePath(`sample/${experimentName}/${modelKey}/${sample}.${fileExtension}`);
            
            // Get transcript for this model/sample combination
            // Prefer clean/ground truth transcript, fall back to model-specific transcript
            let transcript = '';
            let transcriptClass = '';
            
            if (allTranscripts['clean'] && allTranscripts['clean'][sample]) {
                transcript = allTranscripts['clean'][sample];
                transcriptClass = 'ground-truth';
                console.log(`Using clean transcript for ${sample}: ${transcript}`);
            } else if (allTranscripts[modelKey] && allTranscripts[modelKey][sample]) {
                transcript = allTranscripts[modelKey][sample];
                console.log(`Using ${modelKey} transcript for ${sample}: ${transcript}`);
            }
            
            html += `
                <td data-label="${modelLabel}">
                    <div class="audio-item">
                        <div class="audio-label ${modelKey === 'clean' ? 'ground-truth' : ''} ${modelKey === 'mage' ? 'mage' : ''}">${modelLabel}</div>
                        <div class="audio-player">
                            <audio controls data-sample="${sample}" data-model="${modelKey}" data-audio-path="${audioPath}">
                                <source src="${audioPath}" type="audio/${fileExtension === 'flac' ? 'flac' : 'wav'}">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                        ${transcript ? `<div class="transcript ${transcriptClass}">"${transcript}"</div>` : ''}
                        <div class="spectrogram-container" id="spectrogram-${sample}-${modelKey}">
                            <div class="spectrogram-label">Spectrogram - ${modelLabel}</div>
                            <div class="spectrogram-placeholder">
                                <i class="fas fa-chart-line"></i> Spectrogram visualization
                            </div>
                        </div>
                    </div>
                </td>
            `;
        });
        
        html += '</tr>';
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

function getModelOrder(models) {
    // Define the order based on instructions: Noisy, Clean (Ground Truth), MAGE (ours), Others
    const order = ['noisy', 'clean', 'mage'];
    const others = Object.keys(models).filter(key => !order.includes(key));
    return [...order.filter(key => models[key]), ...others];
}

function getExperimentDescription(experimentName) {
    const descriptions = {
        'librispeech': 'Clean speech samples from LibriSpeech dataset with various noise conditions and enhancement results.',
        'dns_real_records': 'Real-world recorded audio samples with background noise, comparing different enhancement methods.',
        'dns_no_reverb': 'DNS Challenge dataset samples without reverberation effects.',
        'dns_with_reverb': 'DNS Challenge dataset samples with reverberation effects.'
    };
    
    return descriptions[experimentName] || 'Audio enhancement comparison samples.';
}

function addAudioEventListeners(experimentDiv) {
    const audioElements = experimentDiv.querySelectorAll('audio');
    
    audioElements.forEach(audio => {
        // Add load event listener for debugging
        audio.addEventListener('loadstart', function() {
            console.log(`Loading audio: ${this.dataset.audioPath}`);
        });
        
        audio.addEventListener('loadeddata', function() {
            console.log(`Successfully loaded audio: ${this.dataset.audioPath}`);
        });
        
        audio.addEventListener('canplay', function() {
            console.log(`Audio ready to play: ${this.dataset.audioPath}`);
        });
        
        // Add click event for spectrogram toggle
        audio.addEventListener('click', function(e) {
            const sample = this.dataset.sample;
            const model = this.dataset.model;
            const spectrogramContainer = document.getElementById(`spectrogram-${sample}-${model}`);
            
            if (spectrogramContainer) {
                spectrogramContainer.classList.toggle('show');
                
                // Animate the toggle
                if (spectrogramContainer.classList.contains('show')) {
                    spectrogramContainer.style.maxHeight = spectrogramContainer.scrollHeight + 'px';
                } else {
                    spectrogramContainer.style.maxHeight = '0';
                }
            }
        });
        
        // Sync audio playback - pause others when one plays
        audio.addEventListener('play', function() {
            audioElements.forEach(otherAudio => {
                if (otherAudio !== this && !otherAudio.paused) {
                    otherAudio.pause();
                }
            });
        });
        
        // Enhanced error handling for GitHub Pages
        audio.addEventListener('error', function(e) {
            const audioPath = this.dataset.audioPath;
            const parent = this.parentElement;
            
            console.error(`Audio loading error for: ${audioPath}`, e);
            console.error(`Error details:`, {
                error: e.target.error,
                code: e.target.error ? e.target.error.code : 'unknown',
                networkState: this.networkState,
                readyState: this.readyState,
                currentSrc: this.currentSrc
            });
            
            // Try alternative path construction for GitHub Pages
            if (CONFIG.isGitHubPages && !audioPath.startsWith('http')) {
                console.log(`Attempting alternative path for GitHub Pages...`);
                const alternativePath = `${CONFIG.baseUrl}/${audioPath.replace(/^\/+/, '')}`;
                console.log(`Trying alternative path: ${alternativePath}`);
                
                // Create a new source element with the alternative path
                const newSource = document.createElement('source');
                newSource.src = alternativePath;
                newSource.type = this.querySelector('source').type;
                
                // Replace the existing source
                const existingSource = this.querySelector('source');
                if (existingSource) {
                    existingSource.remove();
                }
                this.appendChild(newSource);
                this.load(); // Reload the audio with new source
                return;
            }
            
            // If still failing, show error message
            parent.innerHTML = `
                <div class="audio-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Audio file not available</span>
                    <div class="error-details">Path: ${audioPath}</div>
                </div>
            `;
        });
    });
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.section-title, .experiment, .metric-card').forEach(el => {
        observer.observe(el);
    });
}

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(240, 240, 240, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(51, 51, 51, 0.1)';
        } else {
            navbar.style.background = 'rgba(240, 240, 240, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }
});

// Utility function for copying citation (if needed)
function copyCitation() {
    const citationText = document.getElementById('citation-text');
    if (!citationText) return;
    
    const text = citationText.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        if (copyBtn) {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.style.background = '#059669';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = '#2563eb';
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy citation: ', err);
    });
}

// Export functions for global access
window.copyCitation = copyCitation;

// Live Demo Functionality
let mediaRecorder = null;
let recordedChunks = [];
let recordingTimer = null;
let recordingStartTime = null;
let currentAudioBlob = null;
let isRecording = false;

function initializeLiveDemo() {
    console.log('Initializing live demo...');
    
    // Initialize tab switching
    initializeTabs();
    
    // Initialize recording functionality
    initializeRecording();
    
    // Initialize file upload
    initializeFileUpload();
    
    // Initialize process button
    initializeProcessButton();
    
    console.log('Live demo initialized');
}

// Tab Functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab}-tab`) {
                    content.classList.add('active');
                }
            });
            
            // Reset demo state when switching tabs
            resetDemo();
        });
    });
}

// Recording Functionality
async function initializeRecording() {
    const startBtn = document.getElementById('start-recording');
    const stopBtn = document.getElementById('stop-recording');
    const clearBtn = document.getElementById('clear-recording');
    
    if (!startBtn || !stopBtn || !clearBtn) {
        console.error('Recording buttons not found');
        return;
    }
    
    // Check if browser supports MediaRecorder
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.');
        startBtn.disabled = true;
        return;
    }
    
    startBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
    clearBtn.addEventListener('click', clearRecording);
}

async function startRecording() {
    try {
        console.log('Starting recording...');
        
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                sampleRate: 16000, // Request 16kHz sample rate
                channelCount: 1,   // Mono audio
                echoCancellation: true,
                noiseSuppression: true
            } 
        });
        
        console.log('Microphone access granted');
        
        // Check if browser supports the required audio format
        const options = {
            mimeType: 'audio/webm',
            audioBitsPerSecond: 128000
        };
        
        // Fallback for browsers that don't support webm
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'audio/mp4';
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/wav';
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    delete options.mimeType; // Use default
                }
            }
        }
        
        console.log('Using MIME type:', options.mimeType || 'default');
        
        mediaRecorder = new MediaRecorder(stream, options.mimeType ? options : undefined);
        recordedChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = async () => {
            console.log('Recording stopped');
            
            // Stop all tracks to release microphone
            stream.getTracks().forEach(track => track.stop());
            
            // Create blob from recorded chunks
            const mimeType = mediaRecorder.mimeType || 'audio/wav';
            const audioBlob = new Blob(recordedChunks, { type: mimeType });
            
            console.log('Audio blob created:', {
                size: audioBlob.size,
                type: audioBlob.type
            });
            
            // Convert to 16kHz WAV format
            await processRecordedAudio(audioBlob);
        };
        
        // Start recording
        mediaRecorder.start(100); // Collect data every 100ms
        isRecording = true;
        recordingStartTime = Date.now();
        
        // Update UI
        updateRecordingUI(true);
        startRecordingTimer();
        
        console.log('Recording started successfully');
        
    } catch (error) {
        console.error('Error starting recording:', error);
        
        if (error.name === 'NotAllowedError') {
            showError('Microphone access denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
            showError('No microphone found. Please connect a microphone and try again.');
        } else {
            showError(`Recording error: ${error.message}`);
        }
        
        updateRecordingUI(false);
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        console.log('Stopping recording...');
        mediaRecorder.stop();
        isRecording = false;
        
        // Update UI
        updateRecordingUI(false);
        stopRecordingTimer();
    }
}

function clearRecording() {
    console.log('Clearing recording...');
    
    // Stop recording if active
    if (isRecording) {
        stopRecording();
    }
    
    // Clear recorded data
    recordedChunks = [];
    currentAudioBlob = null;
    
    // Hide preview
    const preview = document.getElementById('recording-preview');
    if (preview) {
        preview.style.display = 'none';
    }
    
    // Reset UI
    updateRecordingUI(false);
    updateProcessButton();
    
    // Reset timer
    const timer = document.querySelector('.recording-timer');
    if (timer) {
        timer.textContent = '00:00';
    }
}

function updateRecordingUI(recording) {
    const startBtn = document.getElementById('start-recording');
    const stopBtn = document.getElementById('stop-recording');
    const clearBtn = document.getElementById('clear-recording');
    const indicator = document.getElementById('recording-indicator');
    const statusText = indicator.querySelector('.status-text');
    
    if (recording) {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        clearBtn.disabled = true;
        indicator.classList.add('recording');
        statusText.textContent = 'Recording...';
    } else {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        clearBtn.disabled = currentAudioBlob ? false : true;
        indicator.classList.remove('recording');
        statusText.textContent = currentAudioBlob ? 'Recording complete' : 'Ready to record';
    }
}

function startRecordingTimer() {
    const timer = document.querySelector('.recording-timer');
    
    recordingTimer = setInterval(() => {
        if (recordingStartTime) {
            const elapsed = Date.now() - recordingStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const displaySeconds = seconds % 60;
            
            timer.textContent = `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function stopRecordingTimer() {
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
}

async function processRecordedAudio(audioBlob) {
    try {
        console.log('Processing recorded audio...');
        
        // Convert audio to 16kHz WAV format
        const processedBlob = await convertAudioTo16kHz(audioBlob);
        currentAudioBlob = processedBlob;
        
        // Show preview
        showAudioPreview(processedBlob, 'recording-preview', 'recording-info');
        
        // Update process button
        updateProcessButton();
        
        console.log('Audio processing complete');
        
    } catch (error) {
        console.error('Error processing audio:', error);
        showError(`Audio processing error: ${error.message}`);
    }
}

// File Upload Functionality
function initializeFileUpload() {
    const uploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('audio-file-input');
    
    if (!uploadArea || !fileInput) {
        console.error('Upload elements not found');
        return;
    }
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File selection
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
            handleFileUpload(file);
        } else {
            showError('Please upload a valid audio file.');
        }
    });
}

async function handleFileUpload(file) {
    try {
        console.log('Handling file upload:', {
            name: file.name,
            size: file.size,
            type: file.type
        });
        
        // Validate file type
        if (!file.type.startsWith('audio/')) {
            showError('Please select a valid audio file.');
            return;
        }
        
        // Validate file size (limit to 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            showError('File size must be less than 50MB.');
            return;
        }
        
        // Convert file to blob and process
        const audioBlob = new Blob([file], { type: file.type });
        
        // Convert to 16kHz WAV format
        const processedBlob = await convertAudioTo16kHz(audioBlob);
        currentAudioBlob = processedBlob;
        
        // Show file info
        showFileInfo(file);
        showAudioPreview(processedBlob, 'upload-info', 'upload-info');
        
        // Update process button
        updateProcessButton();
        
        console.log('File upload complete');
        
    } catch (error) {
        console.error('Error handling file upload:', error);
        showError(`File upload error: ${error.message}`);
    }
}

function showFileInfo(file) {
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    
    if (!fileInfo || !fileName || !fileSize) return;
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'block';
}

function showAudioPreview(audioBlob, containerId, infoId) {
    const container = document.getElementById(containerId);
    const audioElement = container.querySelector('audio');
    const infoElement = document.getElementById(infoId);
    
    if (!container || !audioElement) return;
    
    // Create object URL for audio playback
    const audioUrl = URL.createObjectURL(audioBlob);
    audioElement.src = audioUrl;
    
    // Show container
    container.style.display = 'block';
    
    // Show audio info
    if (infoElement) {
        infoElement.textContent = `Processed: 16kHz WAV, ${formatFileSize(audioBlob.size)}`;
    }
    
    // Clean up URL when audio is loaded
    audioElement.addEventListener('loadstart', () => {
        console.log('Audio preview loaded');
    });
}

// Audio Processing Utilities
async function convertAudioTo16kHz(audioBlob) {
    return new Promise((resolve, reject) => {
        try {
            console.log('Converting audio to 16kHz...');
            
            // Create audio context with 16kHz sample rate
            const audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });
            
            const fileReader = new FileReader();
            
            fileReader.onload = async (event) => {
                try {
                    const arrayBuffer = event.target.result;
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    
                    console.log('Original audio:', {
                        sampleRate: audioBuffer.sampleRate,
                        channels: audioBuffer.numberOfChannels,
                        duration: audioBuffer.duration
                    });
                    
                    // Resample to 16kHz if needed
                    let resampledBuffer = audioBuffer;
                    if (audioBuffer.sampleRate !== 16000) {
                        resampledBuffer = await resampleAudio(audioBuffer, 16000);
                    }
                    
                    // Convert to mono if stereo
                    if (resampledBuffer.numberOfChannels > 1) {
                        resampledBuffer = convertToMono(resampledBuffer);
                    }
                    
                    console.log('Processed audio:', {
                        sampleRate: resampledBuffer.sampleRate,
                        channels: resampledBuffer.numberOfChannels,
                        duration: resampledBuffer.duration
                    });
                    
                    // Convert to WAV blob
                    const wavBlob = audioBufferToWav(resampledBuffer);
                    
                    // Clean up
                    audioContext.close();
                    
                    resolve(wavBlob);
                    
                } catch (error) {
                    console.error('Error processing audio:', error);
                    audioContext.close();
                    reject(error);
                }
            };
            
            fileReader.onerror = () => {
                audioContext.close();
                reject(new Error('Error reading audio file'));
            };
            
            fileReader.readAsArrayBuffer(audioBlob);
            
        } catch (error) {
            console.error('Error setting up audio conversion:', error);
            reject(error);
        }
    });
}

async function resampleAudio(audioBuffer, targetSampleRate) {
    const sourceContext = audioBuffer.context || new AudioContext();
    const targetContext = new OfflineAudioContext(1, audioBuffer.duration * targetSampleRate, targetSampleRate);
    
    // Create source and destination
    const source = targetContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(targetContext.destination);
    
    // Start processing
    source.start();
    
    const resampledBuffer = await targetContext.startRendering();
    targetContext.close();
    
    return resampledBuffer;
}

function convertToMono(audioBuffer) {
    const context = audioBuffer.context || new AudioContext();
    const monoBuffer = context.createBuffer(1, audioBuffer.length, audioBuffer.sampleRate);
    const monoData = monoBuffer.getChannelData(0);
    
    // Mix all channels to mono
    for (let i = 0; i < audioBuffer.length; i++) {
        let sum = 0;
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            sum += audioBuffer.getChannelData(channel)[i];
        }
        monoData[i] = sum / audioBuffer.numberOfChannels;
    }
    
    return monoBuffer;
}

function audioBufferToWav(audioBuffer) {
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    
    // Calculate buffer size
    const bufferLength = 44 + length * 2; // WAV header (44 bytes) + data
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, bufferLength - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float32 to int16
    let offset = 44;
    for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Process Button Functionality
function initializeProcessButton() {
    const processBtn = document.getElementById('process-audio');
    
    if (!processBtn) {
        console.error('Process button not found');
        return;
    }
    
    processBtn.addEventListener('click', processAudioWithMage);
}

function updateProcessButton() {
    const processBtn = document.getElementById('process-audio');
    
    if (!processBtn) return;
    
    processBtn.disabled = !currentAudioBlob;
}

async function processAudioWithMage() {
    try {
        console.log('Processing audio with MAGE...');
        
        if (!currentAudioBlob) {
            showError('No audio to process. Please record or upload audio first.');
            return;
        }
        
        // Show processing status
        showProcessingStatus();
        
        // Prepare form data
        const formData = new FormData();
        formData.append('audio', currentAudioBlob, 'audio.wav');
        
        console.log('Sending request to MAGE API...');
        
        // Send request to MAGE API
        const response = await fetch('https://hieugiaosu--mage-deploy-endpoint-deployendpoint-web.modal.run/?num_step=20', {
            method: 'POST',
            headers: {
                'accept': 'application/json'
            },
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
        }
        
        // Get enhanced audio
        const enhancedAudioBlob = await response.blob();
        
        console.log('Enhanced audio received:', {
            size: enhancedAudioBlob.size,
            type: enhancedAudioBlob.type
        });
        
        // Show results
        showResults(currentAudioBlob, enhancedAudioBlob);
        
        console.log('Audio processing complete');
        
    } catch (error) {
        console.error('Error processing audio with MAGE:', error);
        hideProcessingStatus();
        
        let errorMessage = 'Failed to process audio. ';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage += 'Network error - please check your internet connection and try again.';
        } else if (error.message.includes('API request failed')) {
            errorMessage += 'Server error - the processing service may be temporarily unavailable. Please try again later.';
        } else {
            errorMessage += error.message;
        }
        
        showError(errorMessage);
    }
}

// UI Helper Functions
function showProcessingStatus() {
    const processingStatus = document.getElementById('processing-status');
    const demoResults = document.getElementById('demo-results');
    const demoError = document.getElementById('demo-error');
    
    if (processingStatus) processingStatus.style.display = 'block';
    if (demoResults) demoResults.style.display = 'none';
    if (demoError) demoError.style.display = 'none';
}

function hideProcessingStatus() {
    const processingStatus = document.getElementById('processing-status');
    if (processingStatus) processingStatus.style.display = 'none';
}

function showResults(originalBlob, enhancedBlob) {
    hideProcessingStatus();
    
    const demoResults = document.getElementById('demo-results');
    const originalAudio = document.getElementById('original-result');
    const enhancedAudio = document.getElementById('enhanced-result');
    const downloadBtn = document.getElementById('download-enhanced');
    
    if (!demoResults || !originalAudio || !enhancedAudio) return;
    
    // Set audio sources
    originalAudio.src = URL.createObjectURL(originalBlob);
    enhancedAudio.src = URL.createObjectURL(enhancedBlob);
    
    // Setup download button
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const url = URL.createObjectURL(enhancedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `enhanced_audio_${Date.now()}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    }
    
    // Show results
    demoResults.style.display = 'block';
    
    // Scroll to results
    demoResults.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showError(message) {
    hideProcessingStatus();
    
    const demoError = document.getElementById('demo-error');
    const errorMessage = document.getElementById('error-message');
    const demoResults = document.getElementById('demo-results');
    
    if (!demoError || !errorMessage) {
        console.error('Error display elements not found');
        alert(`Error: ${message}`);
        return;
    }
    
    errorMessage.textContent = message;
    demoError.style.display = 'block';
    if (demoResults) demoResults.style.display = 'none';
    
    // Scroll to error
    demoError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetDemo() {
    console.log('Resetting demo...');
    
    // Stop any ongoing recording
    if (isRecording) {
        stopRecording();
    }
    
    // Clear recorded data
    clearRecording();
    
    // Hide all status displays
    const processingStatus = document.getElementById('processing-status');
    const demoResults = document.getElementById('demo-results');
    const demoError = document.getElementById('demo-error');
    const recordingPreview = document.getElementById('recording-preview');
    const fileInfo = document.getElementById('file-info');
    
    if (processingStatus) processingStatus.style.display = 'none';
    if (demoResults) demoResults.style.display = 'none';
    if (demoError) demoError.style.display = 'none';
    if (recordingPreview) recordingPreview.style.display = 'none';
    if (fileInfo) fileInfo.style.display = 'none';
    
    // Reset file input
    const fileInput = document.getElementById('audio-file-input');
    if (fileInput) fileInput.value = '';
    
    // Reset current audio blob
    currentAudioBlob = null;
    
    // Update process button
    updateProcessButton();
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Make resetDemo available globally for the error button
window.resetDemo = resetDemo;
