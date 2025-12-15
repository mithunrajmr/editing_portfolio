# Mithun Raj | Professional Video Editor & Motion Designer

![Portfolio Preview](assets/images/Screenshot.png)

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

### [Live Demo](https://mithunrajedit.netlify.app)

</div>

---

## 🎨 Overview

A visually rich, high-performance personal portfolio website designed for a video editor and motion designer. The site features a **futuristic, glassmorphism-inspired interface** with fluid animations, dynamic content loading, and a strong focus on visual storytelling.

## ✨ Key Features

- **🎬 Dynamic YouTube Integration:** Automatically fetches and displays latest videos using YouTube Data API.
- **📱 Fully Responsive:** Optimized for all devices from wide-screen desktops to mobile phones.
- **⚡ Smooth Animations:** Detailed scroll-based reveals, parallax effects, and custom animated cursor.
- **🔍 Smart Filtering:** Categorize work (Reels, Gameplay, Highlights) with instant filtering.
- **💎 Glassmorphism UI:** Modern aesthetic with blur effects and floating elements.
- **📧 Integrated Contact:** Functional contact form powered by Netlify Forms.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API:** YouTube Data API v3
- **Deployment:** Netlify

---

## 🚀 Getting Started

### 1. Clone & Run
Clone the repository and open `index.html` via a local server (like Live Server in VS Code).

```bash
git clone https://github.com/mithunrajmr/editing_portfolio.git
```

### 2. Configuration (`portfolio-data.js`)
To display your own videos, edit `assets/portfolio-data.js`:

```javascript
const portfolioData = [
    { videoId: "YOUR_VIDEO_ID", category: "reels" }, // Category must match filter buttons
    { videoId: "Check_This_Out", category: "gameplay" }
];
```

### 3. Contact Form
The form is pre-configured for **Netlify Forms**. No backend code is required! Just deploy and test.

```html
<form name="contact" netlify> ... </form>
```

---

## 📂 Project Structure

```bash
/
├── index.html          # Main structure
├── style.css           # Styling & Animations
├── script.js           # Logic & API handling
├── assets/
│   ├── portfolio-data.js # Video content config
│   ├── images/         # Assets & Previews
│   └── videos/         # Background loops
```

---

<p align="center">Made with ❤️ by Mithun Raj</p>