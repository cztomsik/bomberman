// Boot sequence
window.addEventListener('load', () => {
    const bootScreen = document.getElementById('bootScreen');
    const loginScreen = document.getElementById('loginScreen');

    // Hide boot screen after 2.5 seconds
    setTimeout(() => {
        bootScreen.classList.add('hidden');
        setTimeout(() => {
            bootScreen.style.display = 'none';
            loginScreen.classList.add('active');
        }, 500);
    }, 2500);
});

// Login functionality
const loginButton = document.getElementById('loginButton');
const loginPassword = document.getElementById('loginPassword');
const loginScreen = document.getElementById('loginScreen');
const menuBar = document.getElementById('menuBar');
const dock = document.getElementById('dock');

function login() {
    loginScreen.classList.remove('active');
    menuBar.style.display = 'flex';
    dock.style.display = 'flex';
}

loginButton.addEventListener('click', login);
loginPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

// Lock screen functionality
const lockScreen = document.getElementById('lockScreen');

function showLockScreen() {
    lockScreen.classList.add('active');
    updateLockScreen();
}

function hideLockScreen() {
    lockScreen.classList.remove('active');
}

function updateLockScreen() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.querySelector('.lock-time').textContent = `${hours}:${minutes}`;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    document.querySelector('.lock-date').textContent = `${dayName}, ${monthName} ${date}`;
}

lockScreen.addEventListener('click', hideLockScreen);

// Apple menu functionality
document.querySelector('.apple-menu').addEventListener('click', () => {
    const menu = confirm('Choose an action:\nOK = Lock Screen\nCancel = Stay');
    if (menu) {
        showLockScreen();
    }
});

// App configurations
const apps = {
    finder: {
        title: '📁 Finder',
        content: `
            <div class="finder-content">
                <div class="finder-item">📄 Documents</div>
                <div class="finder-item">🖼️ Pictures</div>
                <div class="finder-item">🎵 Music</div>
                <div class="finder-item">🎬 Videos</div>
                <div class="finder-item">⬇️ Downloads</div>
            </div>
        `,
        width: 400,
        height: 400
    },
    photos: {
        title: '🖼️ Photos',
        content: `
            <div class="photos-content">
                <div class="photo-item">🌅</div>
                <div class="photo-item">🌄</div>
                <div class="photo-item">🏔️</div>
                <div class="photo-item">🏖️</div>
                <div class="photo-item">🌃</div>
                <div class="photo-item">🌉</div>
                <div class="photo-item">🎆</div>
                <div class="photo-item">🌠</div>
                <div class="photo-item">🎇</div>
            </div>
        `,
        width: 500,
        height: 450
    },
    mail: {
        title: '📧 Mail',
        content: `
            <div class="mail-content">
                <div class="mail-item">
                    <div class="mail-sender">Apple Store</div>
                    <div class="mail-subject">Your order has shipped</div>
                    <div class="mail-preview">Thank you for your purchase. Your items are on the way...</div>
                </div>
                <div class="mail-item">
                    <div class="mail-sender">Team Meeting</div>
                    <div class="mail-subject">Weekly sync - Tomorrow at 10 AM</div>
                    <div class="mail-preview">Don't forget about our weekly team meeting tomorrow...</div>
                </div>
                <div class="mail-item">
                    <div class="mail-sender">Newsletter</div>
                    <div class="mail-subject">This week's top stories</div>
                    <div class="mail-preview">Here are the most popular articles from this week...</div>
                </div>
            </div>
        `,
        width: 600,
        height: 400
    },
    calendar: {
        title: '📅 Calendar',
        content: `
            <div class="calendar-content">
                <div class="calendar-header">January 2025</div>
                <div class="calendar-day-label">Sun</div>
                <div class="calendar-day-label">Mon</div>
                <div class="calendar-day-label">Tue</div>
                <div class="calendar-day-label">Wed</div>
                <div class="calendar-day-label">Thu</div>
                <div class="calendar-day-label">Fri</div>
                <div class="calendar-day-label">Sat</div>
                ${Array.from({length: 31}, (_, i) => `<div class="calendar-day ${i === 0 ? 'today' : ''}">${i + 1}</div>`).join('')}
            </div>
        `,
        width: 500,
        height: 450
    },
    music: {
        title: '🎵 Music',
        content: `
            <div class="music-content">
                <div class="music-player">
                    <div class="music-artwork">🎵</div>
                    <div class="music-title">Awesome Song</div>
                    <div class="music-artist">Great Artist</div>
                    <div class="music-controls">
                        <div class="music-control-btn">⏮️</div>
                        <div class="music-control-btn">▶️</div>
                        <div class="music-control-btn">⏭️</div>
                    </div>
                </div>
                <div class="music-playlist">
                    <div class="playlist-item">🎵 Song 1 - Artist A</div>
                    <div class="playlist-item">🎵 Song 2 - Artist B</div>
                    <div class="playlist-item">🎵 Song 3 - Artist C</div>
                </div>
            </div>
        `,
        width: 450,
        height: 500
    },
    messages: {
        title: '💬 Messages',
        content: `
            <div class="messages-content">
                <div class="message-item received">Hey! How are you?</div>
                <div class="message-item">I'm doing great! Thanks for asking 😊</div>
                <div class="message-item received">That's wonderful to hear!</div>
                <div class="message-item">How about you?</div>
                <div class="message-item received">Pretty good, just working on some projects</div>
            </div>
        `,
        width: 500,
        height: 400
    },
    weather: {
        title: '🌤️ Weather',
        content: `
            <div class="weather-content">
                <div class="weather-icon">☀️</div>
                <div class="weather-temp">72°F</div>
                <div class="weather-description">Sunny and Clear</div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <div class="weather-detail-label">Humidity</div>
                        <div class="weather-detail-value">45%</div>
                    </div>
                    <div class="weather-detail">
                        <div class="weather-detail-label">Wind Speed</div>
                        <div class="weather-detail-value">12 mph</div>
                    </div>
                    <div class="weather-detail">
                        <div class="weather-detail-label">Pressure</div>
                        <div class="weather-detail-value">30.2 in</div>
                    </div>
                    <div class="weather-detail">
                        <div class="weather-detail-label">UV Index</div>
                        <div class="weather-detail-value">6</div>
                    </div>
                </div>
            </div>
        `,
        width: 450,
        height: 500
    },
    notes: {
        title: '📝 Notes',
        content: '<div class="notes-content"><textarea placeholder="Start typing..."></textarea></div>',
        width: 500,
        height: 400
    },
    calculator: {
        title: '🔢 Calculator',
        content: `
            <div class="calculator-content">
                <div class="calculator-display">0</div>
                <button class="calculator-button">7</button>
                <button class="calculator-button">8</button>
                <button class="calculator-button">9</button>
                <button class="calculator-button operator">/</button>
                <button class="calculator-button">4</button>
                <button class="calculator-button">5</button>
                <button class="calculator-button">6</button>
                <button class="calculator-button operator">*</button>
                <button class="calculator-button">1</button>
                <button class="calculator-button">2</button>
                <button class="calculator-button">3</button>
                <button class="calculator-button operator">-</button>
                <button class="calculator-button">0</button>
                <button class="calculator-button">.</button>
                <button class="calculator-button">=</button>
                <button class="calculator-button operator">+</button>
            </div>
        `,
        width: 350,
        height: 450
    },
    browser: {
        title: '🌐 Browser',
        content: `
            <div class="browser-content">
                <div class="browser-bar">
                    <input type="text" placeholder="Search or enter website..." value="https://example.com">
                </div>
                <div class="browser-frame">
                    <h2>Welcome to WebOS Browser</h2>
                    <p>This is a simple browser window. In a real implementation, you would load web content here.</p>
                </div>
            </div>
        `,
        width: 700,
        height: 500
    },
    terminal: {
        title: '💻 Terminal',
        content: `
            <div class="terminal-content">
                <div>WebOS Terminal v1.0</div>
                <div>Type 'help' for available commands</div>
                <div style="margin-top: 10px;">$ <span style="animation: blink 1s infinite;">_</span></div>
            </div>
        `,
        width: 600,
        height: 400
    },
    appstore: {
        title: '🛍️ App Store',
        content: `
            <div class="appstore-content">
                <div class="appstore-featured">
                    <div class="appstore-featured-title">FEATURED</div>
                    <div class="appstore-featured-name">Amazing App</div>
                    <div class="appstore-featured-desc">The best app you'll ever use</div>
                </div>
                <div class="appstore-list">
                    <div class="appstore-item">
                        <div class="appstore-item-icon">🎮</div>
                        <div class="appstore-item-info">
                            <div class="appstore-item-name">Super Game</div>
                            <div class="appstore-item-desc">An amazing gaming experience</div>
                        </div>
                    </div>
                    <div class="appstore-item">
                        <div class="appstore-item-icon">📚</div>
                        <div class="appstore-item-info">
                            <div class="appstore-item-name">Reading App</div>
                            <div class="appstore-item-desc">Read books on the go</div>
                        </div>
                    </div>
                    <div class="appstore-item">
                        <div class="appstore-item-icon">🎨</div>
                        <div class="appstore-item-info">
                            <div class="appstore-item-name">Design Studio</div>
                            <div class="appstore-item-desc">Create stunning designs</div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        width: 550,
        height: 600
    },
    settings: {
        title: '⚙️ Settings',
        content: `
            <div class="settings-content">
                <div class="settings-item">
                    <h3>Display</h3>
                    <p>Adjust brightness, resolution, and display settings</p>
                </div>
                <div class="settings-item">
                    <h3>Sound</h3>
                    <p>Configure audio output and volume settings</p>
                </div>
                <div class="settings-item">
                    <h3>Network</h3>
                    <p>Manage WiFi and network connections</p>
                </div>
            </div>
        `,
        width: 500,
        height: 400
    }
};

// Window management
let windowCounter = 0;
let activeWindows = [];
let highestZIndex = 100;

// Clock update
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        clockEl.textContent = `${hours}:${minutes}`;
    }
}

updateClock();
setInterval(updateClock, 1000);

// Create window
function createWindow(appName) {
    const app = apps[appName];
    if (!app) return;

    const windowId = `window-${windowCounter++}`;
    const window = document.createElement('div');
    window.className = 'window';
    window.id = windowId;
    window.style.width = `${app.width}px`;
    window.style.height = `${app.height}px`;
    window.style.zIndex = ++highestZIndex;

    // Center window with slight offset for each new window
    const offsetX = (activeWindows.length * 30) % 200;
    const offsetY = (activeWindows.length * 30) % 150;
    window.style.left = `${window.innerWidth / 2 - app.width / 2 + offsetX}px`;
    window.style.top = `${window.innerHeight / 2 - app.height / 2 + offsetY}px`;

    window.innerHTML = `
        <div class="window-header">
            <div class="window-controls">
                <div class="window-control close" onclick="closeWindow('${windowId}')"></div>
                <div class="window-control minimize" onclick="minimizeWindow('${windowId}')"></div>
                <div class="window-control maximize" onclick="maximizeWindow('${windowId}')"></div>
            </div>
            <div class="window-title">${app.title}</div>
            <div style="width: 52px;"></div>
        </div>
        <div class="window-content">
            ${app.content}
        </div>
    `;

    document.getElementById('desktop').appendChild(window);
    activeWindows.push({ id: windowId, appName });

    // Make window draggable
    makeDraggable(window);

    // Setup calculator if it's the calculator app
    if (appName === 'calculator') {
        setupCalculator(window);
    }

    // Bring window to front on click
    window.addEventListener('mousedown', () => {
        bringToFront(windowId);
    });

    return window;
}

// Make window draggable
function makeDraggable(window) {
    const header = window.querySelector('.window-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    header.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('window-control')) return;

        isDragging = true;
        initialX = e.clientX - window.offsetLeft;
        initialY = e.clientY - window.offsetTop;

        bringToFront(window.id);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        window.style.left = `${currentX}px`;
        window.style.top = `${currentY}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// Bring window to front
function bringToFront(windowId) {
    const window = document.getElementById(windowId);
    if (window) {
        window.style.zIndex = ++highestZIndex;
    }
}

// Close window
function closeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (window) {
        window.remove();
        activeWindows = activeWindows.filter(w => w.id !== windowId);
    }
}

// Minimize window
function minimizeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (window) {
        window.classList.add('minimized');
    }
}

// Maximize window
function maximizeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;

    if (window.dataset.maximized === 'true') {
        // Restore
        window.style.width = window.dataset.originalWidth;
        window.style.height = window.dataset.originalHeight;
        window.style.left = window.dataset.originalLeft;
        window.style.top = window.dataset.originalTop;
        window.dataset.maximized = 'false';
    } else {
        // Maximize
        window.dataset.originalWidth = window.style.width;
        window.dataset.originalHeight = window.style.height;
        window.dataset.originalLeft = window.style.left;
        window.dataset.originalTop = window.style.top;

        const desktop = document.getElementById('desktop');
        window.style.width = `${desktop.clientWidth - 20}px`;
        window.style.height = `${desktop.clientHeight - 20}px`;
        window.style.left = '10px';
        window.style.top = '10px';
        window.dataset.maximized = 'true';
    }
}

// Calculator functionality
function setupCalculator(window) {
    const display = window.querySelector('.calculator-display');
    const buttons = window.querySelectorAll('.calculator-button');
    let currentValue = '0';
    let previousValue = '';
    let operation = '';
    let shouldResetDisplay = false;

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;

            if (value >= '0' && value <= '9' || value === '.') {
                if (shouldResetDisplay) {
                    currentValue = value;
                    shouldResetDisplay = false;
                } else {
                    currentValue = currentValue === '0' ? value : currentValue + value;
                }
                display.textContent = currentValue;
            } else if (value === '=') {
                if (previousValue && operation) {
                    currentValue = calculate(previousValue, currentValue, operation);
                    display.textContent = currentValue;
                    previousValue = '';
                    operation = '';
                    shouldResetDisplay = true;
                }
            } else {
                if (previousValue && operation && !shouldResetDisplay) {
                    currentValue = calculate(previousValue, currentValue, operation);
                    display.textContent = currentValue;
                }
                previousValue = currentValue;
                operation = value;
                shouldResetDisplay = true;
            }
        });
    });
}

function calculate(a, b, op) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);

    switch(op) {
        case '+': return (numA + numB).toString();
        case '-': return (numA - numB).toString();
        case '*': return (numA * numB).toString();
        case '/': return (numA / numB).toString();
        default: return b;
    }
}

// Spotlight search
const spotlight = document.getElementById('spotlight');
const spotlightBtn = document.getElementById('spotlightBtn');
const spotlightInput = document.getElementById('spotlightInput');
const spotlightResults = document.getElementById('spotlightResults');

spotlightBtn.addEventListener('click', () => {
    spotlight.classList.toggle('active');
    if (spotlight.classList.contains('active')) {
        spotlightInput.focus();
    }
});

spotlight.addEventListener('click', (e) => {
    if (e.target === spotlight) {
        spotlight.classList.remove('active');
    }
});

spotlightInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (!query) {
        spotlightResults.innerHTML = '';
        return;
    }

    const results = Object.keys(apps).filter(appName =>
        appName.toLowerCase().includes(query) ||
        apps[appName].title.toLowerCase().includes(query)
    );

    spotlightResults.innerHTML = results.map(appName => `
        <div class="spotlight-result" onclick="openFromSpotlight('${appName}')">
            <div class="spotlight-result-icon">${apps[appName].title.split(' ')[0]}</div>
            <div class="spotlight-result-text">
                <div class="spotlight-result-title">${apps[appName].title}</div>
                <div class="spotlight-result-subtitle">Application</div>
            </div>
        </div>
    `).join('');
});

function openFromSpotlight(appName) {
    createWindow(appName);
    spotlight.classList.remove('active');
    spotlightInput.value = '';
    spotlightResults.innerHTML = '';
}

// Notification center
const notificationCenter = document.getElementById('notificationCenter');
const notificationBtn = document.getElementById('notificationBtn');

notificationBtn.addEventListener('click', () => {
    notificationCenter.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!notificationCenter.contains(e.target) && e.target !== notificationBtn) {
        notificationCenter.classList.remove('active');
    }
});

// Desktop icons
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('dblclick', () => {
        const appName = icon.dataset.app;
        if (appName) {
            createWindow(appName);
        }
    });
});

// Dock item click handlers
document.querySelectorAll('.dock-item').forEach(item => {
    item.addEventListener('click', () => {
        const appName = item.dataset.app;
        if (appName) {
            // Check if window already exists
            const existingWindow = activeWindows.find(w => w.appName === appName);
            if (existingWindow) {
                const window = document.getElementById(existingWindow.id);
                if (window.classList.contains('minimized')) {
                    window.classList.remove('minimized');
                }
                bringToFront(existingWindow.id);
            } else {
                createWindow(appName);
            }
        }
    });
});
