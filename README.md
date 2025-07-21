# AlgoGuru - AI Hint Chrome Extension 🧠💡

AlgoGuru is a powerful browser extension designed for competitive programmers. It integrates directly with LeetCode and Codeforces problem pages to provide intelligent, AI-powered hints, helping users overcome challenges without revealing the entire solution.

![AlgoGuru in action](link-to-your-demo-gif-here.gif)
*(Suggestion: Record a short GIF of the extension working, add it to the repository, and replace the line above with the correct link.)*

---

## Features

- **On-Demand Hints:** Get hints exactly when you need them with a clean, floating button on the page.
- **AI-Powered:** Utilizes the Google Gemini API to generate high-quality, context-aware hints based on the problem's content, title, and tags.
- **Progressive Disclosure:** Hints are presented in an accordion UI, allowing you to reveal them one by one.
- **Platform Support:** Seamlessly works with both LeetCode and Codeforces.
- **Secure:** Your personal API key is stored locally and securely in your browser's storage, never shared.

---

## Installation

### 1. From Chrome Web Store (Coming Soon!)

*(Once your extension is published on the Chrome Web Store, you can add the direct installation link here.)*

### 2. Manual Installation (For Developers)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/geekysky/AlgoGuru.git](https://github.com/geekysky/AlgoGuru.git)
    ```
2.  **Open Chrome Extensions:** Open Google Chrome and navigate to `chrome://extensions`.
3.  **Enable Developer Mode:** Turn on the "Developer mode" switch in the top-right corner.
4.  **Load Unpacked:** Click the "Load unpacked" button and select the cloned `AlgoGuru` project folder.

---

## Configuration

For the extension to work, you need to add your own Google Gemini API key.

1.  **Get a free API key** from [Google AI Studio](https://aistudio.google.com/app/apikey). You may need to create a project and enable billing (a free tier is available).
2.  **Add the key to the extension:** Click the AlgoGuru icon in your Chrome toolbar to open the settings popup.
3.  Paste your API key and click "Save Key".

---

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Core Logic:** Chrome Extension APIs (Content Scripts, Background Scripts, Storage)
- **AI:** Google Gemini API
- **Web Scraping:** DOM Parsing

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
