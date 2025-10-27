<div align="center">

# 🎬 TXJS — Twitter/X Video Downloader (CLI)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-CLI-lightgrey)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Maintained](https://img.shields.io/badge/maintained-yes-success)

A fast and modern **command-line video downloader** for Twitter (X).  
Paste a tweet link, choose a quality (audio/video), and download instantly — with a progress bar, FFmpeg integration, and smart naming.

</div>

---

## ⚙️ Features

- 🚀 Fetch videos from Twitter/X without API keys (using vxtwitter API)
- 📦 Download with progress bar and speed tracking
- 🎧 Export as:
  - MP4 (with audio)
  - MP4 (silent video)
  - MP3 (audio only)
- 🧠 Auto file naming:
  ```
  TXJS-<TweetID>_<Quality>_<Type>.mp4
  ```
  Example: `TXJS-1234567890987654321_720p_Sesli.mp4`
- 🧹 Automatically cleans temporary files after completion

---

## 🛠️ Requirements

- **Node.js 18+**
- **FFmpeg** must be installed on your system:
  - macOS → `brew install ffmpeg`
  - Ubuntu/Debian → `sudo apt install ffmpeg`
  - Windows → `winget install ffmpeg`

---

## 📦 Installation

Clone or download the project, then install dependencies:

```bash
npm install
```

---

## ▶️ Usage

Run TXJS from your terminal:

```bash
node twitter-x.js
```

Then:

1. Paste a valid tweet link (e.g. `https://x.com/user/status/1234567890`)
2. Choose your preferred video quality
3. Choose the output type:
   - 🎧 Audio Only (MP3)
   - 🎬 Video with Audio (MP4)
   - 🔇 Silent Video (MP4)
4. Watch the progress bar and wait until the download finishes.

Downloaded files are saved in your system’s **Downloads** folder.

---

## 🧩 Dependencies

| Package | Purpose |
|----------|----------|
| [prompts](https://www.npmjs.com/package/prompts) | Interactive CLI input |
| [cli-progress](https://www.npmjs.com/package/cli-progress) | Progress bar |
| [node-fetch](https://www.npmjs.com/package/node-fetch) | HTTP requests |
| [ffmpeg-static](https://www.npmjs.com/package/ffmpeg-static) | Cross-platform FFmpeg binary |
| [child_process](https://nodejs.org/api/child_process.html) | Used to spawn FFmpeg process |

---

## ⚠️ Disclaimer

This tool is for **educational and personal use only**.  
Downloading or redistributing copyrighted material without permission may violate Twitter’s Terms of Service and copyright laws.  
Use responsibly.

---

## 💡 Example Output

```
√ Tweet link: https://x.com/user/status/1234567890987654321
🔍 Fetching tweet data...
√ Select quality: 1080p (20.3 MB)
√ Choose mode: 🎬 Video with Audio (MP4)

⬇️  Downloading...
TXJS | █████████████████████████████ 100% | 20.3/20.3 MB | 6.2 MB/s

✅ Done → C:\Users\Administrator\Downloads\TXJS-1234567890987654321_1080p_Sesli.mp4
```

---

## 🧠 Author

**EmirhanOlgn**  
🧩 Powered by Node.js + FFmpeg  
💙 Built for simplicity and performance.
