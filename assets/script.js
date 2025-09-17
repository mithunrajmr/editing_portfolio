let fetchedVideosData = [];
let currentFilteredVideos = [];
let currentPage = 1;

function onYouTubeIframeAPIReady() {
    fetchYouTubeVideos();
}

function getVideosPerPage() {
    return window.innerWidth <= 768 ? 2 : 6;
}

async function fetchYouTubeVideos() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return;
    const YOUTUBE_API_KEY = 'AIzaSyDWaRy7eTZqcfSLoRvKugNZ9tcNS5qtGrc';
    const cachedData = sessionStorage.getItem('youtube_portfolio_data');
    if (cachedData) {
        fetchedVideosData = JSON.parse(cachedData);
        currentFilteredVideos = fetchedVideosData;
        displayPage(1);
        return;
    }

    const videoIds = portfolioData.map(item => item.videoId).join(',');
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        fetchedVideosData = data.items.map(apiItem => {
            const localItem = portfolioData.find(local => local.videoId === apiItem.id);
            return { ...apiItem, category: localItem ? localItem.category : 'all' };
        });

        sessionStorage.setItem('youtube_portfolio_data', JSON.stringify(fetchedVideosData));
        currentFilteredVideos = fetchedVideosData;
        displayPage(1);
    } catch (error) {
        console.error('Error fetching YouTube data:', error);
        if (portfolioGrid) portfolioGrid.innerHTML = `<p>Error loading portfolio grid. Please check API key.</p>`;
    }
}

function displayPage(page) {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return; 

    currentPage = page;
    portfolioGrid.innerHTML = '';
    const videosPerPage = getVideosPerPage();
    const paginatedItems = currentFilteredVideos.slice((page - 1) * videosPerPage, page * videosPerPage);

    populatePortfolio(paginatedItems);
    setupPaginationControls();
}

function populatePortfolio(videos) {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return;
    
    videos.forEach(video => {
        const snippet = video.snippet;
        const thumbnail = snippet.thumbnails.high; 
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        portfolioItem.dataset.videoId = video.id;
        portfolioItem.dataset.category = video.category;
        portfolioItem.classList.add(thumbnail && thumbnail.width > thumbnail.height ? 'horizontal' : 'vertical');

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
    const paginationContainer = document.querySelector('.pagination-container');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    const pageCount = Math.ceil(currentFilteredVideos.length / getVideosPerPage());
    if (pageCount <= 1) return;

    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.className = 'pagination-btn';
        if (i === currentPage) button.classList.add('active');
        button.innerText = i;
        button.addEventListener('click', () => displayPage(i));
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

document.addEventListener('DOMContentLoaded', () => {
    
    const loader = document.getElementById('loader');
    if (loader) window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 2000));

    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const { clientX: posX, clientY: posY } = e;
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
        });
    }

    const navbar = document.getElementById('navbar');
    const heroSection = document.getElementById('hero');
    if (navbar && heroSection) {
        const navbarObserver = new IntersectionObserver(entries => {
            navbar.classList.toggle('visible', entries[0].intersectionRatio < 0.5);
        }, { threshold: [0.5] });
        navbarObserver.observe(heroSection);
    }
    
    const bgVideoElement = document.getElementById('bg-video');
    if(bgVideoElement) {
        const videoSources = ['assets/videos/bg1.mp4', 'assets/videos/bg2.mp4', 'assets/videos/bg3.mp4', 'assets/videos/bg4.mp4'];
        bgVideoElement.src = videoSources[Math.floor(Math.random() * videoSources.length)];
    }

    const typedTextSpan = document.querySelector('.typed-text');
    if (typedTextSpan) {
        const textArray = ["Video Editor", "Motion Designer", "Content Creator", "Gamer"];
        let textArrayIndex = 0, charIndex = 0;
        function type() {
            if (charIndex < textArray[textArrayIndex].length) {
                typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex++);
                setTimeout(type, 50);
            } else { setTimeout(erase, 1000); }
        }
        function erase() {
            if (charIndex > 0) {
                typedTextSpan.textContent = textArray[textArrayIndex].substring(0, --charIndex);
                setTimeout(erase, 30);
            } else { textArrayIndex = (textArrayIndex + 1) % textArray.length; setTimeout(type, 500); }
        }
        setTimeout(type, 2500);
    }
    
    const canvas = document.getElementById('blob-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        class Blob {
            constructor(color) { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.radius = Math.random() * 200 + 150; this.color = color; this.vx = (Math.random() - 0.5) * 1; this.vy = (Math.random() - 0.5) * 1; }
            update() { this.x += this.vx; this.y += this.vy; if (this.x < -this.radius || this.x > canvas.width + this.radius) this.vx *= -1; if (this.y < -this.radius || this.y > canvas.height + this.radius) this.vy *= -1; }
            draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); }
        }
        const blobs = [new Blob('rgba(0, 255, 255, 0.2)'), new Blob('rgba(148, 0, 211, 0.2)')];
        const animateBlobs = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); blobs.forEach(b => { b.update(); b.draw(); }); requestAnimationFrame(animateBlobs); };
        animateBlobs();
        window.addEventListener('resize', () => {
             canvas.width = window.innerWidth; canvas.height = window.innerHeight;
             if (document.querySelector('.portfolio-grid')) displayPage(currentPage);
        });
    }

    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: "-100px 0px" });
    document.querySelectorAll('section.hidden').forEach(el => sectionObserver.observe(el));
    
    // --- THIS IS THE MISSING CODE FOR SERVICE CARD ANIMATIONS ---
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length > 0) {
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
    }

    loadPortfolioIntoIndex();
});


async function loadPortfolioIntoIndex() {
    const placeholder = document.getElementById('portfolio-placeholder');
    if (!placeholder) return;

    try {
        const response = await fetch('portfolio.html');
        const htmlText = await response.text();
        const parser = new DOMParser();
        const portfolioDoc = parser.parseFromString(htmlText, 'text/html');
        const portfolioSection = portfolioDoc.querySelector('#portfolio');

        if (portfolioSection) {
            placeholder.replaceWith(portfolioSection);
            const newPortfolioSection = document.getElementById('portfolio');
            const sectionObserver = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    newPortfolioSection.classList.add('visible');
                    sectionObserver.unobserve(newPortfolioSection);
                }
            }, { rootMargin: "-100px 0px" });
            sectionObserver.observe(newPortfolioSection);

            initializePortfolioScripts();
        }
    } catch (error) {
        console.error("Error loading portfolio content:", error);
    }
}

function initializePortfolioScripts() {
    const showreelVideo = document.getElementById('showreel-video');
    const playOverlay = document.getElementById('showreel-play-overlay');

    if (showreelVideo && playOverlay) {
        // Show the play button by default when the page loads
        playOverlay.style.display = 'flex';

        // Toggle play/pause when the video container is clicked
        showreelVideo.parentElement.addEventListener('click', () => {
            if (showreelVideo.paused) {
                showreelVideo.play();
            } else {
                showreelVideo.pause();
            }
        });

        // Show overlay when video is paused
        showreelVideo.addEventListener('pause', () => {
            playOverlay.style.display = 'flex';
        });

        // Hide overlay when video is playing
        showreelVideo.addEventListener('play', () => {
            playOverlay.style.display = 'none';
        });
    }

    // Initialize YouTube API for the portfolio grid below
    if (typeof onYouTubeIframeAPIReady === 'function') {
        onYouTubeIframeAPIReady();
    }

    // Attach listeners for filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilteredVideos = (button.dataset.filter === 'all')
                ? fetchedVideosData
                : fetchedVideosData.filter(video => video.category === button.dataset.filter);
            displayPage(1);
        });
    });
}