# Audio Samples Directory

This directory contains audio samples for the speech enhancement demo.

## Structure

```
audio/
└── samples/
    ├── clean_reference.wav
    ├── noisy_cafe_0db.wav
    ├── enhanced_cafe_0db.wav
    ├── noisy_cafe_5db.wav
    ├── enhanced_cafe_5db.wav
    ├── noisy_cafe_10db.wav
    ├── enhanced_cafe_10db.wav
    ├── noisy_cafe_15db.wav
    ├── enhanced_cafe_15db.wav
    ├── noisy_traffic_0db.wav
    ├── enhanced_traffic_0db.wav
    ├── noisy_traffic_5db.wav
    ├── enhanced_traffic_5db.wav
    ├── noisy_traffic_10db.wav
    ├── enhanced_traffic_10db.wav
    ├── noisy_traffic_15db.wav
    ├── enhanced_traffic_15db.wav
    ├── noisy_office_0db.wav
    ├── enhanced_office_0db.wav
    ├── noisy_office_5db.wav
    ├── enhanced_office_5db.wav
    ├── noisy_office_10db.wav
    ├── enhanced_office_10db.wav
    ├── noisy_office_15db.wav
    ├── enhanced_office_15db.wav
    ├── noisy_babble_0db.wav
    ├── enhanced_babble_0db.wav
    ├── noisy_babble_5db.wav
    ├── enhanced_babble_5db.wav
    ├── noisy_babble_10db.wav
    ├── enhanced_babble_10db.wav
    ├── noisy_babble_15db.wav
    ├── enhanced_babble_15db.wav
    ├── noisy_white_0db.wav
    ├── enhanced_white_0db.wav
    ├── noisy_white_5db.wav
    ├── enhanced_white_5db.wav
    ├── noisy_white_10db.wav
    ├── enhanced_white_10db.wav
    ├── noisy_white_15db.wav
    └── enhanced_white_15db.wav
```

## File Naming Convention

- `clean_reference.wav`: Original clean speech sample
- `noisy_{noise_type}_{snr}db.wav`: Speech with added noise at specified SNR
- `enhanced_{noise_type}_{snr}db.wav`: Speech enhanced by MAGE model

## Noise Types

- **cafe**: Cafe/restaurant ambient noise
- **traffic**: Traffic and road noise
- **office**: Office chatter and keyboard noise
- **babble**: Multi-speaker babble noise
- **white**: White noise

## SNR Levels

- **0db**: Very noisy condition
- **5db**: Noisy condition
- **10db**: Moderate noise
- **15db**: Light noise

## Audio Format

- **Format**: WAV (16-bit PCM)
- **Sample Rate**: 16 kHz
- **Duration**: ~5-10 seconds each
- **Channels**: Mono

## Usage

These audio files are referenced by the JavaScript demo code and will be automatically loaded when users interact with the demo controls. Make sure to replace these placeholder entries with your actual audio samples.

## Generating Samples

To generate your own samples:

1. Start with clean speech samples
2. Add different types of noise at various SNR levels
3. Process through your MAGE model to get enhanced versions
4. Save with the naming convention above
5. Ensure all files are in WAV format at 16kHz sample rate
