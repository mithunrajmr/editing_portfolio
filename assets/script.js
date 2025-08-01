const YOUTUBE_API_KEY = 'AIzaSyDWaRy7eTZqcfSLoRvKugNZ9tcNS5qtGrc';
let fetchedVideosData = []; 
let currentFilteredVideos = [];
let currentPage = 1;

const portfolioGrid = document.querySelector('.portfolio-grid');
const paginationContainer = document.querySelector('.pagination-container');

// This function is now global, so the YouTube API can call it
function onYouTubeIframeAPIReady() {
    fetchYouTubeVideos();
}

// Function to check screen size and determine items per page
function getVideosPerPage() {
    if (window.innerWidth <= 768) {
        return 2; // 2 videos per page on mobile
    } else {
        return 6; // 6 videos per page on desktop
    }
}

async function fetchYouTubeVideos() {
    // First, try to get data from the browser's session storage
    const cachedData = sessionStorage.getItem('youtube_portfolio_data');
    if (cachedData) {
        console.log("✅ Using cached data from sessionStorage.");
        fetchedVideosData = JSON.parse(cachedData);
        currentFilteredVideos = fetchedVideosData;
        displayPage(1);
        return; // Stop the function here and use the cached data
    }

    // If no cached data, proceed with the API call
    console.log("ℹ️ No cached data found. Fetching from YouTube API...");
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'PASTE_YOUR_API_KEY_HERE') {
        portfolioGrid.innerHTML = `<p style="text-align: center; width: 100%; color: #ff5555;">Error: YouTube API Key is missing.<br>Please add it to the top of script.js.</p>`;
        return;
    }

    const videoIds = portfolioData.map(item => item.videoId).join(',');
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("YouTube API Error:", data.error.message);
            portfolioGrid.innerHTML = `<p style="color: #ff5555;">Error: ${data.error.message}. Check your API Key and Google Cloud settings.</p>`;
            return;
        }
        
        fetchedVideosData = data.items.map(apiItem => {
            const localItem = portfolioData.find(local => local.videoId === apiItem.id);
            return { ...apiItem, category: localItem ? localItem.category : 'all' };
        });

        // Save the newly fetched data to session storage for next time
        console.log("✅ Saving fetched data to sessionStorage.");
        sessionStorage.setItem('youtube_portfolio_data', JSON.stringify(fetchedVideosData));
        
        currentFilteredVideos = fetchedVideosData;
        displayPage(1);

    } catch (error) {
        console.error('Network error while fetching YouTube data:', error);
        portfolioGrid.innerHTML = '<p>Error loading portfolio. Please try again later.</p>';
    }
}

function displayPage(page) {
    currentPage = page;
    portfolioGrid.innerHTML = '';

    const videosPerPage = getVideosPerPage();
    const startIndex = (page - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;
    const paginatedItems = currentFilteredVideos.slice(startIndex, endIndex);

    populatePortfolio(paginatedItems);
    setupPaginationControls();
}

function populatePortfolio(videos) {
    videos.forEach(video => {
        const snippet = video.snippet;
        const thumbnail = snippet.thumbnails.high; 

        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        portfolioItem.dataset.videoId = video.id;
        portfolioItem.dataset.category = video.category;

        if (thumbnail && thumbnail.width && thumbnail.height) {
            if (thumbnail.width > thumbnail.height) {
                portfolioItem.classList.add('horizontal');
            } else {
                portfolioItem.classList.add('vertical');
            }
        } else {
             portfolioItem.classList.add('horizontal');
        }

        portfolioItem.innerHTML = `
            <img src="${thumbnail.url}" alt="${snippet.title}" class="thumbnail">
            <div class="item-overlay"><h3>${snippet.title}</h3></div>
            <div class="play-icon"></div>
        `;
        portfolioGrid.appendChild(portfolioItem);
    });
    addPortfolioClickListeners();
}

function setupPaginationControls() {
    paginationContainer.innerHTML = '';
    const videosPerPage = getVideosPerPage();
    const pageCount = Math.ceil(currentFilteredVideos.length / videosPerPage);

    if (pageCount <= 1) return;

    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.className = 'pagination-btn';
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.innerText = i;
        button.addEventListener('click', () => {
            displayPage(i);
        });
        paginationContainer.appendChild(button);
    }
}

function addPortfolioClickListeners(){
    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.addEventListener('click', () => {
            const videoId = item.dataset.videoId;
            playVideoInPlace(item, videoId);
        });
    });
}

function playVideoInPlace(element, videoId) {
    element.innerHTML = `<div id="player-${videoId}"></div>`;
    new YT.Player(`player-${videoId}`, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: { 'autoplay': 1, 'controls': 1, 'rel': 0 }
    });
}

// All other event listeners and functions that need the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    
    // --- LOADER ---
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 500));

    // --- CURSOR ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    window.addEventListener('mousemove', (e) => {
        const { clientX: posX, clientY: posY } = e;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
    });

    // --- NAVBAR REVEAL ---
    const navbar = document.getElementById('navbar');
    const heroSection = document.getElementById('hero');
    const navbarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.intersectionRatio < 0.5) {
                navbar.classList.add('visible');
            } else {
                navbar.classList.remove('visible');
            }
        });
    }, { threshold: [0.5] });
    navbarObserver.observe(heroSection);
    
    // --- HERO & BACKGROUND ANIMATIONS ---
    const videoElement = document.getElementById('bg-video');
    const videoSources = ['assets/videos/bg1.mp4', 'assets/videos/bg2.mp4', 'assets/videos/bg3.mp4', 'assets/videos/bg4.mp4'];
    if(videoElement) {
        videoElement.src = videoSources[Math.floor(Math.random() * videoSources.length)];
        videoElement.play().catch(error => console.error("Video autoplay error:", error));
    }
    const typedTextSpan = document.querySelector('.typed-text');
    if (typedTextSpan) {
        const textArray = ["Video Editor", "Motion Designer", "Content Creator", "Gamer"];
        const typingDelay = 50, erasingDelay = 30, newTextDelay = 1000;
        let textArrayIndex = 0, charIndex = 0;
        function type() {
            if (charIndex < textArray[textArrayIndex].length) {
                typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex++);
                setTimeout(type, typingDelay);
            } else { setTimeout(erase, newTextDelay); }
        }
        function erase() {
            if (charIndex > 0) {
                typedTextSpan.textContent = textArray[textArrayIndex].substring(0, --charIndex);
                setTimeout(erase, erasingDelay);
            } else { textArrayIndex = (textArrayIndex + 1) % textArray.length; setTimeout(type, typingDelay + 500); }
        }
        setTimeout(type, 2500);
    }
    const canvas = document.getElementById('blob-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        class Blob {
            constructor(color) { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.radius = Math.random() * 200 + 150; this.color = color; this.vx = (Math.random() - 0.5) * 1; this.vy = (Math.random() - 0.5) * 1; }
            update() { this.x += this.vx; this.y += this.vy; if (this.x < -this.radius || this.x > canvas.width + this.radius) this.vx *= -1; if (this.y < -this.radius || this.y > canvas.height + this.radius) this.vy *= -1; }
            draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); }
        }
        const blobs = [new Blob('rgba(0, 255, 255, 0.2)'), new Blob('rgba(148, 0, 211, 0.2)')];
        function animateBlobs() { ctx.clearRect(0, 0, canvas.width, canvas.height); blobs.forEach(b => { b.update(); b.draw(); }); requestAnimationFrame(animateBlobs); }
        animateBlobs();
        window.addEventListener('resize', () => {
             canvas.width = window.innerWidth;
             canvas.height = window.innerHeight;
             // Refresh portfolio on resize to adjust pagination
             displayPage(currentPage);
        });
    }

    // --- PORTFOLIO FILTER BUTTONS ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.dataset.filter;
            
            currentFilteredVideos = (filter === 'all')
                ? fetchedVideosData
                : fetchedVideosData.filter(video => video.category === filter);
            
            displayPage(1);
        });
    });

    // --- SCROLL REVEAL FOR SECTIONS ---
    const hiddenElements = document.querySelectorAll('section.hidden');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: "-100px 0px" });
    hiddenElements.forEach(el => sectionObserver.observe(el));
    
    // --- OTHER INTERACTIVE ELEMENTS ---
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const rotateX = -y / 20; const rotateY = x / 20;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            card.style.boxShadow = `0 0 40px -10px ${x > 0 ? 'var(--primary-glow)' : 'var(--secondary-glow)'}`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'; card.style.boxShadow = 'none'; });
    });
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value !== "") input.classList.add('has-value');
            else input.classList.remove('has-value');
        });
    });
});