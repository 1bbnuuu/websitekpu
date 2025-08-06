function showInfo() {
    const modal = document.getElementById('infoModal');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.querySelector('div').classList.remove('scale-90');
}

function hideInfo() {
    const modal = document.getElementById('infoModal');
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.querySelector('div').classList.add('scale-90');
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideInfo();
    }
});

// Close modal on outside click
document.getElementById('infoModal').addEventListener('click', function(e) {
    if (e.target === this) {
        hideInfo();
    }
});

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
function toggleFullscreen() {
    const container = document.documentElement;
    const icon = document.getElementById('fullscreenIcon');
    
    if (!document.fullscreenElement) {
        container.requestFullscreen().then(() => {
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`;
        }).catch(err => {
            console.error('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>`;
        });
    }
}

function toggleHelp() {
    const modal = document.getElementById('helpModal');
    if (modal.style.opacity === '0' || modal.style.opacity === '') {
        modal.classList.remove('pointer-events-none');
        modal.style.opacity = '1';
    } else {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.classList.add('pointer-events-none');
        }, 300);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key.toLowerCase()) {
        case 'r':
            e.preventDefault();
            refreshIframe();
            break;
        case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
        case 'h':
            e.preventDefault();
            toggleHelp();
            break;
        case 'escape':
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                const modal = document.getElementById('helpModal');
                if (modal.style.opacity === '1') {
                    toggleHelp();
                }
            }
            break;
    }
});

// Handle fullscreen change
document.addEventListener('fullscreenchange', function() {
    const icon = document.getElementById('fullscreenIcon');
    if (document.fullscreenElement) {
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`;
    } else {
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>`;
    }
});

// Close help modal when clicking outside
document.getElementById('helpModal').addEventListener('click', function(e) {
    if (e.target === this) {
        toggleHelp();
    }
});