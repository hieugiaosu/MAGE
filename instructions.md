# Instruction for Building the Sample Audio Showcase Page

## 1️⃣ Overview
Build a **responsive showcase webpage** that presents sample audio from multiple experiments.  
The page should organize and compare results from different models so visitors can easily listen and evaluate audio quality.

---

## 2️⃣ Data Structure
- All audio files are stored in the `sample/` directory.  
- Each subfolder inside `sample` is an **experiment**.  
- Each experiment may include:
  - `noisy` audio (always present).
  - `clean` audio (if available) – serves as **ground truth**.
  - `MAGE` audio (our model).
  - Other model outputs.

> If an experiment folder is missing, simply skip it — new folders can be added later.

> **Do not display the raw filenames** of the audio files on the page. Use clean, human-friendly labels instead.

---

## 3️⃣ Display Rules

### Experiment Order
Render experiments in this sequence (skip any missing ones):
1. `librispeech`  
2. `dns_no_reverb`  
3. `dns_with_reverb`  
4. `dns_real_records`

---

### Audio Order (inside each experiment)
For every sample in an experiment, show the audio (if available) in the following order:
1. **Noisy**  
2. **Clean** – mark clearly as **Ground Truth**  
3. **MAGE** (our model)  
4. Other models (any logical order after the above).

Each audio item must include:
- A clear label (e.g., “Noisy,” “Ground Truth,” “MAGE,” “Model X”).  
- A play/pause control.

---

### Transcript
- If a `trans.txt` file exists inside the experiment folder, display its content next to the audio.  
- The transcript in the `clean` audio is the **reference ground truth**.

---

## 4️⃣ Layout & Design
- Use a **table** layout:
  - Each **row = one sample** inside an experiment.  
  - Columns = audio items (Noisy, Clean, MAGE, others).  
  - The first column can show the sample index or a short label.
- Each cell should contain:
  - The audio player  
  - A descriptive label (no filenames)  
  - Transcript (if available).
- Provide clear spacing, borders, or shading to separate rows and columns.

---

## 5️⃣ Responsiveness
- The page must work well on desktops, tablets, and phones:
  - On large screens → table rows with multiple columns.  
  - On small screens → stack items vertically within each row for clarity.
- Use accessible font sizes and large, easy-to-tap controls.

---

## 6️⃣ Comparison Features
- Make it easy to compare models:
  - Optional A/B switching or waveform side-by-side (optional).  
  - Emphasize the **Clean (Ground Truth)** audio as the baseline.

---

## 7️⃣ Style & UX
- Keep the design modern, clean, and professional.
- Highlight important elements:
  - Experiment title
  - “Ground Truth” label for clean audio
  - “MAGE (ours)” label for our model.

---

## 8️⃣ Summary of Priorities
1. Follow experiment order strictly.  
2. Show each sample as a table row, with audio items as columns.  
3. Mark **Clean** as “Ground Truth.”  
4. Avoid showing filenames.  
5. Make everything responsive and user-friendly.  
6. Provide clear comparisons between models.
