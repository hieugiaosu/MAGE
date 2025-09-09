// DOM elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const noiseTypeSelect = document.getElementById('noise-type');
const snrLevelSelect = document.getElementById('snr-level');
const noisyAudio = document.getElementById('noisy-audio');
const enhancedAudio = document.getElementById('enhanced-audio');
const cleanAudio = document.getElementById('clean-audio');
const waveformCanvas = document.getElementById('waveform');
const noisySpectrogramCanvas = document.getElementById('noisy-spectrogram');
const enhancedSpectrogramCanvas = document.getElementById('enhanced-spectrogram');
const performanceChart = document.getElementById('performance-chart');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAudioDemo();
    initializeVisualizations();
    initializeScrollAnimations();
    initializePerformanceChart();
});

// Navigation functionality
function initializeNavigation() {
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

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
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
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

// Audio demo functionality
function initializeAudioDemo() {
    // Audio sample data structure
    const audioSamples = {
        'cafe': {
            '0db': { noisy: 'audio/samples/noisy_cafe_0db.wav', enhanced: 'audio/samples/enhanced_cafe_0db.wav' },
            '5db': { noisy: 'audio/samples/noisy_cafe_5db.wav', enhanced: 'audio/samples/enhanced_cafe_5db.wav' },
            '10db': { noisy: 'audio/samples/noisy_cafe_10db.wav', enhanced: 'audio/samples/enhanced_cafe_10db.wav' },
            '15db': { noisy: 'audio/samples/noisy_cafe_15db.wav', enhanced: 'audio/samples/enhanced_cafe_15db.wav' }
        },
        'traffic': {
            '0db': { noisy: 'audio/samples/noisy_traffic_0db.wav', enhanced: 'audio/samples/enhanced_traffic_0db.wav' },
            '5db': { noisy: 'audio/samples/noisy_traffic_5db.wav', enhanced: 'audio/samples/enhanced_traffic_5db.wav' },
            '10db': { noisy: 'audio/samples/noisy_traffic_10db.wav', enhanced: 'audio/samples/enhanced_traffic_10db.wav' },
            '15db': { noisy: 'audio/samples/noisy_traffic_15db.wav', enhanced: 'audio/samples/enhanced_traffic_15db.wav' }
        },
        'office': {
            '0db': { noisy: 'audio/samples/noisy_office_0db.wav', enhanced: 'audio/samples/enhanced_office_0db.wav' },
            '5db': { noisy: 'audio/samples/noisy_office_5db.wav', enhanced: 'audio/samples/enhanced_office_5db.wav' },
            '10db': { noisy: 'audio/samples/noisy_office_10db.wav', enhanced: 'audio/samples/enhanced_office_10db.wav' },
            '15db': { noisy: 'audio/samples/noisy_office_15db.wav', enhanced: 'audio/samples/enhanced_office_15db.wav' }
        },
        'babble': {
            '0db': { noisy: 'audio/samples/noisy_babble_0db.wav', enhanced: 'audio/samples/enhanced_babble_0db.wav' },
            '5db': { noisy: 'audio/samples/noisy_babble_5db.wav', enhanced: 'audio/samples/enhanced_babble_5db.wav' },
            '10db': { noisy: 'audio/samples/noisy_babble_10db.wav', enhanced: 'audio/samples/enhanced_babble_10db.wav' },
            '15db': { noisy: 'audio/samples/noisy_babble_15db.wav', enhanced: 'audio/samples/enhanced_babble_15db.wav' }
        },
        'white': {
            '0db': { noisy: 'audio/samples/noisy_white_0db.wav', enhanced: 'audio/samples/enhanced_white_0db.wav' },
            '5db': { noisy: 'audio/samples/noisy_white_5db.wav', enhanced: 'audio/samples/enhanced_white_5db.wav' },
            '10db': { noisy: 'audio/samples/noisy_white_10db.wav', enhanced: 'audio/samples/enhanced_white_10db.wav' },
            '15db': { noisy: 'audio/samples/noisy_white_15db.wav', enhanced: 'audio/samples/enhanced_white_15db.wav' }
        }
    };

    // Performance metrics for different conditions
    const performanceMetrics = {
        'cafe': { '0db': { pesq: 1.8, snr: 18 }, '5db': { pesq: 2.1, snr: 20 }, '10db': { pesq: 2.5, snr: 22 }, '15db': { pesq: 2.8, snr: 25 } },
        'traffic': { '0db': { pesq: 1.9, snr: 17 }, '5db': { pesq: 2.2, snr: 19 }, '10db': { pesq: 2.6, snr: 21 }, '15db': { pesq: 2.9, snr: 24 } },
        'office': { '0db': { pesq: 2.0, snr: 16 }, '5db': { pesq: 2.3, snr: 18 }, '10db': { pesq: 2.7, snr: 20 }, '15db': { pesq: 3.0, snr: 23 } },
        'babble': { '0db': { pesq: 1.7, snr: 15 }, '5db': { pesq: 2.0, snr: 17 }, '10db': { pesq: 2.4, snr: 19 }, '15db': { pesq: 2.7, snr: 22 } },
        'white': { '0db': { pesq: 2.1, snr: 19 }, '5db': { pesq: 2.4, snr: 21 }, '10db': { pesq: 2.8, snr: 23 }, '15db': { pesq: 3.1, snr: 26 } }
    };

    // Event listeners for demo controls
    noiseTypeSelect.addEventListener('change', updateAudioSamples);
    snrLevelSelect.addEventListener('change', updateAudioSamples);

    function updateAudioSamples() {
        const noiseType = noiseTypeSelect.value;
        const snrLevel = snrLevelSelect.value;
        
        if (audioSamples[noiseType] && audioSamples[noiseType][snrLevel]) {
            const samples = audioSamples[noiseType][snrLevel];
            const metrics = performanceMetrics[noiseType][snrLevel];
            
            // Update audio sources
            updateAudioSource(noisyAudio, samples.noisy);
            updateAudioSource(enhancedAudio, samples.enhanced);
            
            // Update performance metrics display
            updateMetricsDisplay(metrics);
            
            // Update spectrograms
            updateSpectrograms(noiseType, snrLevel);
        }
    }

    function updateAudioSource(audioElement, src) {
        const source = audioElement.querySelector('source');
        if (source) {
            source.src = src;
            audioElement.load();
        }
    }

    function updateMetricsDisplay(metrics) {
        // Update the audio card specs
        const enhancedCard = document.querySelector('.audio-card.enhanced .audio-specs');
        if (enhancedCard) {
            enhancedCard.innerHTML = `
                <span class="spec">SNR: ${metrics.snr} dB</span>
                <span class="spec">PESQ: ${metrics.pesq}</span>
            `;
        }
    }

    // Initialize with default values
    updateAudioSamples();
}

// Visualization functions
function initializeVisualizations() {
    drawWaveform();
    drawSpectrograms();
}

function drawWaveform() {
    if (!waveformCanvas) return;
    
    const ctx = waveformCanvas.getContext('2d');
    const width = waveformCanvas.width;
    const height = waveformCanvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw noisy waveform (top half)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
        const progress = x / width;
        // Simulate noisy waveform with random variations
        const noise = (Math.random() - 0.5) * 0.3;
        const signal = Math.sin(progress * Math.PI * 8) * 0.4;
        const y = height * 0.25 + (signal + noise) * height * 0.2;
        
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw enhanced waveform (bottom half)
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
        const progress = x / width;
        // Simulate clean waveform
        const signal = Math.sin(progress * Math.PI * 8) * 0.4;
        const y = height * 0.75 + signal * height * 0.2;
        
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Add labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Inter';
    ctx.fillText('Noisy Input', 10, 25);
    ctx.fillText('Enhanced Output', 10, height - 10);
}

function drawSpectrograms() {
    drawSpectrogram(noisySpectrogramCanvas, 'noisy');
    drawSpectrogram(enhancedSpectrogramCanvas, 'enhanced');
}

function drawSpectrogram(canvas, type) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create gradient for spectrogram
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (type === 'noisy') {
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(0.5, '#3b82f6');
        gradient.addColorStop(1, '#93c5fd');
    } else {
        gradient.addColorStop(0, '#166534');
        gradient.addColorStop(0.5, '#22c55e');
        gradient.addColorStop(1, '#86efac');
    }
    
    // Draw spectrogram-like pattern
    for (let x = 0; x < width; x += 2) {
        for (let y = 0; y < height; y += 2) {
            const intensity = type === 'noisy' 
                ? Math.random() * 0.8 + 0.2  // More random for noisy
                : Math.random() * 0.6 + 0.1; // Less random for enhanced
            
            ctx.fillStyle = gradient;
            ctx.globalAlpha = intensity;
            ctx.fillRect(x, y, 2, 2);
        }
    }
    
    ctx.globalAlpha = 1;
}

function updateSpectrograms(noiseType, snrLevel) {
    // Redraw spectrograms with updated parameters
    drawSpectrograms();
}

// Performance chart
function initializePerformanceChart() {
    if (!performanceChart) return;
    
    const ctx = performanceChart.getContext('2d');
    const width = performanceChart.width;
    const height = performanceChart.height;
    
    // Chart data
    const methods = ['Noisy', 'Wiener', 'RNNoise', 'DeepNoise', 'MAGE (Ours)'];
    const pesqScores = [1.97, 2.12, 2.45, 2.67, 3.08];
    const stoiScores = [0.78, 0.82, 0.86, 0.89, 0.94];
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart settings
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Draw background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);
    
    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = margin.top + (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + chartWidth, y);
        ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= methods.length; i++) {
        const x = margin.left + (i / methods.length) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + chartHeight);
        ctx.stroke();
    }
    
    // Draw PESQ bars
    const barWidth = chartWidth / methods.length * 0.35;
    const maxPesq = Math.max(...pesqScores);
    
    pesqScores.forEach((score, index) => {
        const x = margin.left + (index / methods.length) * chartWidth + chartWidth / methods.length * 0.1;
        const barHeight = (score / maxPesq) * chartHeight * 0.8;
        const y = margin.top + chartHeight - barHeight;
        
        // Bar color
        ctx.fillStyle = index === methods.length - 1 ? '#2563eb' : '#6b7280';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Score label
        ctx.fillStyle = '#374151';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(score.toFixed(2), x + barWidth / 2, y - 5);
    });
    
    // Draw STOI bars
    const maxStoi = Math.max(...stoiScores);
    
    stoiScores.forEach((score, index) => {
        const x = margin.left + (index / methods.length) * chartWidth + chartWidth / methods.length * 0.55;
        const barHeight = (score / maxStoi) * chartHeight * 0.8;
        const y = margin.top + chartHeight - barHeight;
        
        // Bar color
        ctx.fillStyle = index === methods.length - 1 ? '#059669' : '#9ca3af';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Score label
        ctx.fillStyle = '#374151';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(score.toFixed(2), x + barWidth / 2, y - 5);
    });
    
    // Draw method labels
    ctx.fillStyle = '#374151';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    
    methods.forEach((method, index) => {
        const x = margin.left + (index / methods.length) * chartWidth + chartWidth / methods.length * 0.5;
        const y = margin.top + chartHeight + 25;
        ctx.fillText(method, x, y);
    });
    
    // Draw axis labels
    ctx.font = '16px Inter';
    ctx.fillStyle = '#1f2937';
    
    // Y-axis label
    ctx.save();
    ctx.translate(20, margin.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Score', 0, 0);
    ctx.restore();
    
    // X-axis label
    ctx.textAlign = 'center';
    ctx.fillText('Methods', margin.left + chartWidth / 2, height - 20);
    
    // Legend
    ctx.font = '14px Inter';
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(margin.left + chartWidth - 120, margin.top + 10, 15, 15);
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'left';
    ctx.fillText('PESQ', margin.left + chartWidth - 100, margin.top + 22);
    
    ctx.fillStyle = '#059669';
    ctx.fillRect(margin.left + chartWidth - 120, margin.top + 35, 15, 15);
    ctx.fillStyle = '#374151';
    ctx.fillText('STOI', margin.left + chartWidth - 100, margin.top + 47);
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
    document.querySelectorAll('.section-title, .audio-card, .results-card').forEach(el => {
        observer.observe(el);
    });
}

// Utility functions
function copyCitation() {
    const citationText = document.getElementById('citation-text');
    const text = citationText.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#059669';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '#2563eb';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy citation: ', err);
    });
}

// Audio playback synchronization
function syncAudioPlayback() {
    const audioElements = [noisyAudio, enhancedAudio, cleanAudio];
    
    audioElements.forEach((audio, index) => {
        if (!audio) return;
        
        audio.addEventListener('play', () => {
            // Pause other audio elements when one starts playing
            audioElements.forEach((otherAudio, otherIndex) => {
                if (otherIndex !== index && otherAudio && !otherAudio.paused) {
                    otherAudio.pause();
                }
            });
        });
    });
}

// Initialize audio synchronization
document.addEventListener('DOMContentLoaded', syncAudioPlayback);

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(240, 240, 240, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(51, 51, 51, 0.1)';
    } else {
        navbar.style.background = 'rgba(240, 240, 240, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Preload audio samples for better user experience
function preloadAudioSamples() {
    const samplePaths = [
        'audio/samples/clean_reference.wav',
        'audio/samples/noisy_cafe_0db.wav',
        'audio/samples/enhanced_cafe_0db.wav'
    ];
    
    samplePaths.forEach(path => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.src = path;
    });
}

// Initialize preloading
document.addEventListener('DOMContentLoaded', preloadAudioSamples);

// Error handling for missing audio files
function handleAudioError(audioElement, fallbackMessage) {
    audioElement.addEventListener('error', () => {
        console.warn(`Audio file not found: ${audioElement.src}`);
        const parent = audioElement.parentElement;
        parent.innerHTML = `<div class="audio-error">${fallbackMessage}</div>`;
    });
}

// Apply error handling to all audio elements
document.addEventListener('DOMContentLoaded', () => {
    if (noisyAudio) handleAudioError(noisyAudio, 'Noisy audio sample not available');
    if (enhancedAudio) handleAudioError(enhancedAudio, 'Enhanced audio sample not available');
    if (cleanAudio) handleAudioError(cleanAudio, 'Clean reference not available');
});

// Export functions for global access
window.copyCitation = copyCitation;
