// DOM elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAudioShowcase();
    initializeScrollAnimations();
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
        // Define experiment order as per instructions
        const experimentOrder = ['librispeech', 'dns_no_reverb', 'dns_with_reverb', 'dns_real_records'];
        
        // Check which experiments actually exist
        const availableExperiments = [];
        for (const exp of experimentOrder) {
            try {
                const response = await fetch(`sample/${exp}/`, { method: 'HEAD' });
                if (response.ok) {
                    availableExperiments.push(exp);
                }
            } catch (error) {
                // Check if directory exists by trying to load a known file structure
                try {
                    const testResponse = await fetch(`sample/${exp}/noisy/`);
                    if (testResponse.status !== 404) {
                        availableExperiments.push(exp);
                    }
                } catch (e) {
                    // Skip this experiment
                }
            }
        }

        // Load experiments that we know exist from workspace inspection
        const knownExperiments = ['librispeech', 'dns_real_records'];
        
        experimentsContainer.innerHTML = '';
        
        for (const experiment of knownExperiments) {
            await loadExperiment(experiment, experimentsContainer);
        }
        
    } catch (error) {
        console.error('Error initializing audio showcase:', error);
        experimentsContainer.innerHTML = '<div class="error">Error loading audio samples</div>';
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
                const transcriptPath = `sample/${experimentName}/${modelKey}/trans.txt`;
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
            const audioPath = `sample/${experimentName}/${modelKey}/${sample}.${fileExtension}`;
            
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
                            <audio controls data-sample="${sample}" data-model="${modelKey}">
                                <source src="${audioPath}" type="audio/${fileExtension === 'flac' ? 'flac' : 'wav'}">
                                Audio not supported
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
        
        // Handle audio loading errors gracefully
        audio.addEventListener('error', function() {
            const parent = this.parentElement;
            parent.innerHTML = '<div style="color: #9ca3af; font-style: italic; padding: 1rem;">Audio file not available</div>';
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
