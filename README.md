# Mithun Raj - Personal Portfolio Website

A visually rich, animated, and interactive personal portfolio website for a video editor and motion designer. The site is designed to be futuristic, elegant, and engaging, with a strong focus on motion and micro-interactions.

**Live Demo:** [https://mithunrajedit.netlify.app](https://mithunrajedit.netlify.app)

![Portfolio Screenshot](https://mithunrajmr.netlify.app/assets/images/Screenshot.png) 

---

## Features

-   **Fully Responsive Design:** Looks great on desktops, tablets, and mobile devices.
-   **Animated Hero Section:** Features a dynamic video background, self-drawing SVG text, and an animated subtitle.
-   **Glassmorphism Sticky Navbar:** A semi-transparent navigation bar that appears gracefully as the user scrolls down.
-   **Custom Animated Cursor:** An interactive cursor that enhances the user experience.
-   **Scroll-based Animations:** All sections and their content fade and slide into view as the user scrolls.
-   **Dynamic YouTube Portfolio:**
    -   Automatically fetches your latest videos and thumbnails from YouTube using the YouTube Data API.
    -   Videos are displayed in a responsive, multi-column grid.
    -   Category filtering allows visitors to sort projects (e.g., Gameplay, Reels).
    -   Click-to-play functionality embeds and plays videos directly on the page.
    -   Pagination system limits the grid to 6 items per page (2 on mobile) with navigation.
-   **Interactive Elements:**
    -   3D tilt effect on service cards.
    -   "Active float" animation on the profile image.
    -   Working contact form powered by Netlify Forms.

---

## Tech Stack

-   **Frontend:** HTML5, CSS3 (with CSS Grid & Flexbox), JavaScript (ES6+)
-   **APIs:** YouTube Data API v3
-   **Hosting & Forms:** Netlify

---

## Setup and Configuration

To get this project running on your own, follow these steps.

### 1. Local Development

-   Clone or download the project files.
-   It is highly recommended to use a local server to run the project. The **Live Server** extension for Visual Studio Code is a great option.
-   Open the `index.html` file with your local server.

### 2. Configure the Portfolio (Required)

-   Open the `portfolio-data.js` file.
-   This file contains an array of objects. Each object represents a video.
-   Replace the placeholder `videoId`s with the IDs of your own public YouTube videos.
-   Assign a `category` to each video. This must match the `data-filter` values of the buttons in `index.html` (e.g., `gameplay`, `reels`, `highlights`).

    ```javascript
    // portfolio-data.js
    const portfolioData = [
        { videoId: "YOUR_VIDEO_ID_HERE", category: "reels" },
        { videoId: "ANOTHER_VIDEO_ID", category: "gameplay" },
        // ...and so on
    ];
    ```

### 3. Configure the Contact Form

-   The contact form in `index.html` is set up to work automatically with Netlify.
-   The line `<form class="contact-form" name="contact" netlify>` handles everything.
-   After you deploy your site to Netlify, send one test message from your live site to activate the form. Submissions will then appear in your Netlify dashboard and be forwarded to your email.

---

## Folder Structure
/
├── index.html
├── style.css
├── script.js
├── portfolio-data.js
└── assets/
├── images/
│   └── my_pic.jpg
├── videos/
│   ├── bg1.mp4
│   └── ... (other background videos)
└── favicon.ico