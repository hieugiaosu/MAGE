# MAGE: Speech Enhancement Demo Website

A modern, interactive demo website for the MAGE (Multi-scale Audio Generation Enhancement) speech enhancement research paper.

![MAGE Demo](https://img.shields.io/badge/Demo-Live-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

## 🎯 Features

- **Interactive Audio Demo**: Compare noisy input, enhanced output, and clean reference audio
- **Multiple Noise Conditions**: Test with cafe, traffic, office, babble, and white noise
- **Performance Metrics**: Real-time display of PESQ and STOI scores
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Visualizations**: Waveform and spectrogram displays
- **Academic Integration**: Easy citation copying and paper links

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)

1. Fork this repository
2. Add your audio samples to the `audio/samples/` directory
3. Enable GitHub Pages in repository settings
4. Your demo will be live at `https://yourusername.github.io/MAGE`

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/hieugiaosu/MAGE.git
cd MAGE

# Serve locally (Python 3)
python -m http.server 8000

# Or with Node.js
npx serve .

# Or with PHP
php -S localhost:8000
```

Visit `http://localhost:8000` to view the demo.

## 📁 Project Structure

```
MAGE/
├── index.html              # Main HTML file
├── styles.css              # CSS styling
├── script.js               # JavaScript functionality
├── README.md               # This file
├── audio/
│   ├── README.md           # Audio directory documentation
│   └── samples/            # Audio sample files
│       ├── clean_reference.wav
│       ├── noisy_cafe_0db.wav
│       ├── enhanced_cafe_0db.wav
│       └── ... (more samples)
└── docs/                   # Additional documentation (optional)
```

## 🎵 Audio Sample Setup

### Required Audio Files

Place your audio samples in the `audio/samples/` directory with this naming convention:

```
clean_reference.wav                 # Original clean speech
noisy_{noise_type}_{snr}db.wav     # Noisy inputs
enhanced_{noise_type}_{snr}db.wav  # Enhanced outputs
```

### Supported Configurations

- **Noise Types**: cafe, traffic, office, babble, white
- **SNR Levels**: 0db, 5db, 10db, 15db
- **Format**: WAV files, 16kHz sample rate, mono channel

### Example Files Needed

```
audio/samples/
├── clean_reference.wav
├── noisy_cafe_0db.wav
├── enhanced_cafe_0db.wav
├── noisy_cafe_5db.wav
├── enhanced_cafe_5db.wav
├── noisy_traffic_0db.wav
├── enhanced_traffic_0db.wav
└── ... (continue pattern for all noise types and SNR levels)
```

## 🛠️ Customization

### Updating Paper Information

Edit the following sections in `index.html`:

1. **Title and Meta Tags** (lines 5-10)
2. **Hero Section** (lines 45-65)
3. **Abstract Content** (lines 85-105)
4. **Paper Details** (lines 280-300)
5. **Citation Information** (lines 310-320)

### Modifying Performance Metrics

Update the metrics in `script.js`:

```javascript
// Performance metrics for different conditions
const performanceMetrics = {
    'cafe': { 
        '0db': { pesq: 1.8, snr: 18 }, 
        '5db': { pesq: 2.1, snr: 20 },
        // ... add your actual metrics
    },
    // ... other noise types
};
```

### Styling Changes

Customize the appearance by modifying `styles.css`:

- **Colors**: Update CSS custom properties at the top
- **Fonts**: Change the Google Fonts import
- **Layout**: Modify grid and flexbox configurations

## 📊 Performance Comparison

The demo includes comparison with state-of-the-art methods:

| Method | PESQ ↑ | STOI ↑ | SDR ↑ |
|--------|--------|--------|-------|
| Noisy | 1.97 | 0.78 | 8.5 |
| Wiener Filter | 2.12 | 0.82 | 10.2 |
| RNNoise | 2.45 | 0.86 | 12.8 |
| DeepNoise | 2.67 | 0.89 | 14.3 |
| **MAGE (Ours)** | **3.08** | **0.94** | **17.2** |

## 🎨 Features Overview

### Interactive Components

- **Audio Players**: Synchronized playback controls
- **Demo Controls**: Dynamic sample switching
- **Performance Charts**: Real-time metric visualization
- **Responsive Navigation**: Mobile-friendly menu
- **Smooth Animations**: Scroll-triggered effects

### Visual Elements

- **Waveform Display**: Animated comparison visualization
- **Spectrograms**: Real-time frequency domain representation
- **Performance Charts**: Interactive metric comparisons
- **Mobile Optimization**: Touch-friendly interface

## 🔧 Technical Requirements

### Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Server Requirements

- Any static file server (GitHub Pages, Netlify, Vercel, etc.)
- No backend processing required
- HTTPS recommended for audio playback

## 📝 Deployment Options

### GitHub Pages

1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://username.github.io/repository-name`

### Netlify

1. Connect your GitHub repository
2. Set build command: (none needed)
3. Set publish directory: `/`
4. Deploy automatically on commits

### Vercel

1. Import your GitHub repository
2. Framework preset: Other
3. Build command: (none needed)
4. Output directory: `./`

## 🎓 Citation

If you use this demo website for your research, please cite:

```bibtex
@inproceedings{yourname2025mage,
  title={MAGE: Multi-scale Audio Generation Enhancement for Speech Enhancement},
  author={Your Name and Co-Author Name},
  booktitle={ICASSP 2025},
  year={2025}
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Contact

- **Author**: Your Name
- **Email**: your.email@university.edu
- **Project Link**: [https://github.com/hieugiaosu/MAGE](https://github.com/hieugiaosu/MAGE)
- **Demo Link**: [https://hieugiaosu.github.io/MAGE](https://hieugiaosu.github.io/MAGE)

## 🙏 Acknowledgments

- Built with vanilla HTML, CSS, and JavaScript
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)
- Inspired by modern academic research websites

---

**Note**: This is a template for a speech enhancement demo website. Replace the placeholder content with your actual research data, audio samples, and performance metrics.
