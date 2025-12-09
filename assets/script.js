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

    // 1. Separate items
    const youtubeItems = portfolioData.filter(item => item.type === 'youtube');
    const imageItems = portfolioData.filter(item => item.type === 'image');

    // 2. Fetch YouTube Data if needed
    let fetchedYoutubeData = [];
    const YOUTUBE_API_KEY = 'AIzaSyDWaRy7eTZqcfSLoRvKugNZ9tcNS5qtGrc';
    const videoIds = youtubeItems.map(item => item.videoId).join(',');

    // Check session storage with "Smart Validation"
    const cachedData = sessionStorage.getItem('youtube_cache_data');
    const cachedIds = sessionStorage.getItem('youtube_cache_ids');

    // If cache exists AND the list of videos hasn't changed, use cache
    if (cachedData && cachedIds === videoIds) {
        console.log("Using cached YouTube data (Content unchanged).");
        fetchedYoutubeData = JSON.parse(cachedData);
    } else if (videoIds.length > 0) {
        console.log("Video list changed or cache empty. Fetching new data...");
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            // MERGE LOGIC: Iterate over LOCAL items
            fetchedYoutubeData = youtubeItems.map(localItem => {
                const apiItem = data.items.find(item => item.id === localItem.videoId);
                if (apiItem) {
                    return { ...localItem, snippet: apiItem.snippet };
                } else {
                    // Fallback for unlisted/private videos
                    // console.warn(`Video ${localItem.videoId} not returned by API (likely unlisted). Using fallback.`);
                    return {
                        ...localItem,
                        snippet: {
                            title: localItem.title || "Video",
                            thumbnails: { high: { url: `https://img.youtube.com/vi/${localItem.videoId}/maxresdefault.jpg` } }
                        }
                    };
                }
            });

            // Update Cache AND the ID list used to validate it
            sessionStorage.setItem('youtube_cache_data', JSON.stringify(fetchedYoutubeData));
            sessionStorage.setItem('youtube_cache_ids', videoIds);
        } catch (error) {
            console.error('Error fetching YouTube data:', error);
            // Fallback
            fetchedYoutubeData = youtubeItems.map(item => ({
                ...item,
                snippet: {
                    title: item.title || "Video Name",
                    thumbnails: { high: { url: `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg` } }
                }
            }));
        }
    }

    // 3. Prepare Image Data (Normalize structure)
    const normalizedImages = imageItems.map(item => ({
        ...item,
        snippet: {
            title: item.title,
            thumbnails: { high: { url: item.src } }
        }
    }));

    // 4. Merge and Display
    fetchedVideosData = [...fetchedYoutubeData, ...normalizedImages];

    // Initial Filter (default to All)
    currentFilteredVideos = fetchedVideosData;
    displayPage(1);
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

function populatePortfolio(items) {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return;

    items.forEach(item => {
        const snippet = item.snippet;
        // Use high res thumbnail, fallback to hqdefault via onerror in img tag
        const thumbnailUrl = snippet.thumbnails.high ? snippet.thumbnails.high.url : '';

        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        portfolioItem.dataset.type = item.type; // 'youtube' or 'image'
        portfolioItem.dataset.category = item.category;

        // Determine orientation
        let orientationClass = 'horizontal';
        if (snippet.thumbnails.high && snippet.thumbnails.high.width && snippet.thumbnails.high.height && snippet.thumbnails.high.width < snippet.thumbnails.high.height) {
            orientationClass = 'vertical';
        }
        portfolioItem.classList.add(orientationClass);

        if (item.type === 'youtube') {
            portfolioItem.dataset.videoId = item.videoId;
            portfolioItem.innerHTML = `
                <img src="${thumbnailUrl}" alt="${snippet.title}" class="thumbnail" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg'">
                <div class="item-overlay"><h3>${snippet.title}</h3></div>
                <div class="play-icon"></div>
            `;
            // Click -> Play Video
            portfolioItem.addEventListener('click', () => {
                playVideoInPlace(portfolioItem, item.videoId);
            });
        } else if (item.type === 'image') {
            portfolioItem.innerHTML = `
                <img src="${thumbnailUrl}" alt="${snippet.title}" class="thumbnail" loading="lazy">
                <div class="item-overlay"><h3>${snippet.title}</h3></div>
            `;
            // Click -> Open Lightbox
            portfolioItem.addEventListener('click', () => {
                openLightbox(thumbnailUrl);
            });
        }

        portfolioGrid.appendChild(portfolioItem);
    });
}

function setupPaginationControls() {
    const paginationContainer = document.querySelector('.pagination-container');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    const videosPerPage = getVideosPerPage();
    const totalPages = Math.ceil(currentFilteredVideos.length / videosPerPage);

    if (totalPages <= 1) return;

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&#10094;'; // Left Arrow
    prevButton.className = 'pagination-btn';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => displayPage(currentPage - 1));
    paginationContainer.appendChild(prevButton);

    // Page Indicator (e.g. "1 / 5")
    const pageIndicator = document.createElement('span');
    pageIndicator.textContent = `${currentPage} / ${totalPages}`;
    pageIndicator.style.color = 'var(--text-color)';
    pageIndicator.style.fontFamily = "'Montserrat', sans-serif";
    pageIndicator.style.fontWeight = '700';
    pageIndicator.style.margin = '0 15px';
    paginationContainer.appendChild(pageIndicator);

    // Next Button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&#10095;'; // Right Arrow
    nextButton.className = 'pagination-btn';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => displayPage(currentPage + 1));
    paginationContainer.appendChild(nextButton);
}

// --- LIGHTBOX FUNCTIONS ---
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

    if (lightbox && lightboxImg) {
        lightboxImg.src = imageSrc;
        lightbox.classList.add('active');

        // Close functions
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            lightboxImg.src = '';
        };

        if (closeBtn) closeBtn.onclick = closeLightbox;
        lightbox.onclick = (e) => {
            if (e.target === lightbox) closeLightbox();
        };

        document.onkeydown = (e) => {
            if (e.key === "Escape") closeLightbox();
        };
    }
}

function playVideoInPlace(element, videoId) {
    // Disable hover effects/transforms which block fullscreen
    element.classList.add('video-playing');

    element.innerHTML = `<div id="player-${videoId}"></div>`;
    new YT.Player(`player-${videoId}`, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 1,
            'rel': 0,
            'fs': 1,
            'playsinline': 0
        },
        events: {
            'onReady': (event) => {
                const iframe = event.target.getIframe();
                iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                iframe.allowFullscreen = true;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {

    const loader = document.getElementById('loader');
    if (loader) {
        const hideLoader = () => setTimeout(() => loader.classList.add('hidden'), 2000);

        // If the page is already loaded, hide immediately
        if (document.readyState === 'complete') {
            hideLoader();
        } else {
            // Otherwise wait for load
            window.addEventListener('load', hideLoader);
            // Backup safety timer (5 seconds max)
            setTimeout(hideLoader, 5000);
        }
    }

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
    if (bgVideoElement) {
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

    // Service Cards Tilt
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

    // Initialize Portfolio Logic
    initializePortfolioScripts();
});

function initializePortfolioScripts() {
    // 1. Showreel Logic
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

    // 2. Clear previous state if any to avoid duplicates
    fetchedVideosData = [];
    currentFilteredVideos = [];

    // 3. Initialize Grid & Data
    fetchYouTubeVideos();

    // 4. Attach Filter Listeners
    const filterButtons = document.querySelectorAll('.filter-btn');
    // console.warn("No filter buttons found!");

    filterButtons.forEach(button => {
        // Remove old listeners by cloning
        const newBtn = button.cloneNode(true);
        button.parentNode.replaceChild(newBtn, button);

        newBtn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            newBtn.classList.add('active');

            const filter = newBtn.dataset.filter;
            currentPage = 1; // Reset to page 1 on filter
            currentFilteredVideos = (filter === 'all')
                ? fetchedVideosData
                : fetchedVideosData.filter(video => video.category === filter);

            // console.log(`Filter: ${filter}, Items found: ${currentFilteredVideos.length}`);

            displayPage(1);
        });
    });
}
