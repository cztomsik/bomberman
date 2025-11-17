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
                <div class="finder-toolbar">
                    <button class="finder-btn finder-back">◀ Back</button>
                    <button class="finder-btn finder-home">🏠 Home</button>
                    <button class="finder-btn finder-new-folder">📁 New Folder</button>
                    <button class="finder-btn finder-new-file">📄 New File</button>
                </div>
                <div class="finder-path">/ Home</div>
                <div class="finder-items"></div>
            </div>
        `,
        width: 500,
        height: 450
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
        content: `
            <div class="notes-content">
                <div class="notes-toolbar">
                    <input type="text" class="notes-filename" placeholder="Untitled" value="Untitled">
                    <button class="notes-btn notes-save">💾 Save</button>
                    <button class="notes-btn notes-new">📄 New</button>
                    <button class="notes-btn notes-export">⬇️ Export</button>
                    <select class="notes-list">
                        <option value="">-- Load File --</option>
                    </select>
                </div>
                <textarea class="notes-textarea" placeholder="Start typing..."></textarea>
            </div>
        `,
        width: 600,
        height: 450
    },
    calculator: {
        title: '🔢 Calculator',
        content: `
            <div class="calculator-content">
                <div class="calculator-display">0</div>
                <button class="calculator-button clear">C</button>
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
                    <button class="browser-nav-btn" data-action="back">◀</button>
                    <button class="browser-nav-btn" data-action="forward">▶</button>
                    <button class="browser-nav-btn" data-action="refresh">🔄</button>
                    <input type="text" class="browser-url" placeholder="Search or enter website..." value="https://www.wikipedia.org">
                    <button class="browser-nav-btn browser-go">Go</button>
                </div>
                <div class="browser-bookmarks">
                    <a href="#" class="bookmark" data-url="https://www.google.com">Google</a>
                    <a href="#" class="bookmark" data-url="https://www.wikipedia.org">Wikipedia</a>
                    <a href="#" class="bookmark" data-url="https://news.ycombinator.com">Hacker News</a>
                    <a href="#" class="bookmark" data-url="https://github.com">GitHub</a>
                </div>
                <div class="browser-frame">
                    <iframe src="about:blank" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
                </div>
            </div>
        `,
        width: 800,
        height: 600
    },
    terminal: {
        title: '💻 Terminal',
        content: `
            <div class="terminal-content">
                <div class="terminal-output">
                    <div>WebOS Terminal v1.0</div>
                    <div>Type 'help' for available commands</div>
                    <div>&nbsp;</div>
                </div>
                <div class="terminal-input-line">
                    <span class="terminal-prompt">user@webos:~$</span>
                    <input type="text" class="terminal-input" autofocus spellcheck="false">
                </div>
            </div>
        `,
        width: 700,
        height: 450
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

    // Setup browser if it's the browser app
    if (appName === 'browser') {
        setupBrowser(window);
    }

    // Setup terminal if it's the terminal app
    if (appName === 'terminal') {
        setupTerminal(window);
    }

    // Setup notes if it's the notes app
    if (appName === 'notes') {
        setupNotes(window);
    }

    // Setup finder if it's the finder app
    if (appName === 'finder') {
        setupFinder(window);
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

            if (value === 'C') {
                currentValue = '0';
                previousValue = '';
                operation = '';
                shouldResetDisplay = false;
                display.textContent = '0';
            } else if (value >= '0' && value <= '9' || value === '.') {
                if (shouldResetDisplay) {
                    currentValue = value;
                    shouldResetDisplay = false;
                } else {
                    currentValue = currentValue === '0' && value !== '.' ? value : currentValue + value;
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
        case '/': return numB !== 0 ? (numA / numB).toString() : 'Error';
        default: return b;
    }
}

// Browser functionality
function setupBrowser(windowEl) {
    const urlInput = windowEl.querySelector('.browser-url');
    const iframe = windowEl.querySelector('iframe');
    const goBtn = windowEl.querySelector('.browser-go');
    const navBtns = windowEl.querySelectorAll('.browser-nav-btn[data-action]');
    const bookmarks = windowEl.querySelectorAll('.bookmark');

    function navigateTo(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        urlInput.value = url;
        iframe.src = url;
    }

    goBtn.addEventListener('click', () => {
        navigateTo(urlInput.value);
    });

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            navigateTo(urlInput.value);
        }
    });

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'back') {
                try { iframe.contentWindow.history.back(); } catch(e) {}
            } else if (action === 'forward') {
                try { iframe.contentWindow.history.forward(); } catch(e) {}
            } else if (action === 'refresh') {
                iframe.src = iframe.src;
            }
        });
    });

    bookmarks.forEach(bookmark => {
        bookmark.addEventListener('click', (e) => {
            e.preventDefault();
            const url = bookmark.dataset.url;
            navigateTo(url);
        });
    });

    // Load initial page
    navigateTo(urlInput.value);
}

// Terminal functionality
function setupTerminal(windowEl) {
    const output = windowEl.querySelector('.terminal-output');
    const input = windowEl.querySelector('.terminal-input');
    const commandHistory = [];
    let historyIndex = -1;

    const commands = {
        help: () => `Available commands:
  help     - Show this help message
  clear    - Clear the terminal
  ls       - List files in current directory
  pwd      - Print working directory
  whoami   - Display current user
  date     - Show current date and time
  echo     - Print text to terminal
  cat      - Display file contents
  mkdir    - Create a directory
  touch    - Create a file
  calc     - Simple calculator (e.g., calc 2+2)
  uname    - System information
  uptime   - System uptime`,
        clear: () => {
            output.innerHTML = '';
            return '';
        },
        ls: () => `Documents/  Pictures/  Music/  Videos/  Downloads/
Desktop/    Projects/  .config/`,
        pwd: () => '/home/user',
        whoami: () => 'user',
        date: () => new Date().toString(),
        echo: (args) => args.join(' '),
        cat: (args) => {
            if (!args.length) return 'cat: missing file operand';
            const files = {
                'readme.txt': 'Welcome to WebOS Terminal!\nThis is a simulated terminal environment.',
                '.bashrc': '# WebOS bash configuration\nexport PATH=$PATH:/usr/local/bin\nalias ll="ls -la"',
                'notes.txt': 'Remember to check the browser and calculator apps!'
            };
            return files[args[0]] || `cat: ${args[0]}: No such file or directory`;
        },
        mkdir: (args) => args.length ? `Created directory: ${args[0]}` : 'mkdir: missing operand',
        touch: (args) => args.length ? `Created file: ${args[0]}` : 'touch: missing file operand',
        calc: (args) => {
            if (!args.length) return 'Usage: calc <expression>';
            try {
                const expr = args.join('').replace(/[^0-9+\-*/().]/g, '');
                return eval(expr).toString();
            } catch(e) {
                return 'Error: Invalid expression';
            }
        },
        uname: () => 'WebOS 1.0.0 x86_64',
        uptime: () => {
            const mins = Math.floor((Date.now() - window.bootTime) / 60000);
            return `up ${mins} minutes`;
        }
    };

    window.bootTime = window.bootTime || Date.now();

    function addOutput(text, isCommand = false) {
        const line = document.createElement('div');
        if (isCommand) {
            line.innerHTML = `<span style="color: #00ff00;">user@webos:~$</span> ${text}`;
        } else {
            line.textContent = text;
        }
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function processCommand(cmd) {
        const parts = cmd.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (!command) return;

        commandHistory.push(cmd);
        historyIndex = commandHistory.length;

        addOutput(cmd, true);

        if (commands[command]) {
            const result = commands[command](args);
            if (result) {
                result.split('\n').forEach(line => addOutput(line));
            }
        } else if (command) {
            addOutput(`${command}: command not found`);
        }
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            processCommand(input.value);
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                input.value = '';
            }
        }
    });

    input.focus();
}

// Notes functionality
function setupNotes(windowEl) {
    const textarea = windowEl.querySelector('.notes-textarea');
    const filenameInput = windowEl.querySelector('.notes-filename');
    const saveBtn = windowEl.querySelector('.notes-save');
    const newBtn = windowEl.querySelector('.notes-new');
    const exportBtn = windowEl.querySelector('.notes-export');
    const fileList = windowEl.querySelector('.notes-list');

    function updateFileList() {
        const files = JSON.parse(localStorage.getItem('webos_notes') || '{}');
        fileList.innerHTML = '<option value="">-- Load File --</option>';
        Object.keys(files).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            fileList.appendChild(option);
        });
    }

    saveBtn.addEventListener('click', () => {
        const filename = filenameInput.value.trim() || 'Untitled';
        const content = textarea.value;
        const files = JSON.parse(localStorage.getItem('webos_notes') || '{}');
        files[filename] = content;
        localStorage.setItem('webos_notes', JSON.stringify(files));
        filenameInput.value = filename;
        updateFileList();
        alert(`File "${filename}" saved!`);
    });

    newBtn.addEventListener('click', () => {
        filenameInput.value = 'Untitled';
        textarea.value = '';
    });

    exportBtn.addEventListener('click', () => {
        const filename = filenameInput.value.trim() || 'Untitled';
        const content = textarea.value;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    fileList.addEventListener('change', () => {
        const filename = fileList.value;
        if (filename) {
            const files = JSON.parse(localStorage.getItem('webos_notes') || '{}');
            if (files[filename]) {
                filenameInput.value = filename;
                textarea.value = files[filename];
            }
        }
    });

    updateFileList();
}

// Finder functionality with virtual file system
function setupFinder(windowEl) {
    const pathDisplay = windowEl.querySelector('.finder-path');
    const itemsContainer = windowEl.querySelector('.finder-items');
    const backBtn = windowEl.querySelector('.finder-back');
    const homeBtn = windowEl.querySelector('.finder-home');
    const newFolderBtn = windowEl.querySelector('.finder-new-folder');
    const newFileBtn = windowEl.querySelector('.finder-new-file');

    // Initialize virtual file system
    if (!window.virtualFS) {
        window.virtualFS = {
            'Home': {
                type: 'folder',
                children: {
                    'Documents': {
                        type: 'folder',
                        children: {
                            'readme.txt': { type: 'file', content: 'Welcome to WebOS!' },
                            'notes.txt': { type: 'file', content: 'My important notes...' }
                        }
                    },
                    'Pictures': {
                        type: 'folder',
                        children: {
                            'vacation.jpg': { type: 'file', content: '[Image: Beach sunset]' },
                            'family.png': { type: 'file', content: '[Image: Family photo]' }
                        }
                    },
                    'Music': {
                        type: 'folder',
                        children: {
                            'song.mp3': { type: 'file', content: '[Audio: Favorite song]' }
                        }
                    },
                    'Videos': {
                        type: 'folder',
                        children: {}
                    },
                    'Downloads': {
                        type: 'folder',
                        children: {
                            'installer.dmg': { type: 'file', content: '[Installer package]' }
                        }
                    }
                }
            }
        };
    }

    let currentPath = ['Home'];

    function getCurrentFolder() {
        let folder = window.virtualFS;
        for (const part of currentPath) {
            folder = folder[part].children || folder[part];
        }
        return folder;
    }

    function renderItems() {
        const folder = getCurrentFolder();
        itemsContainer.innerHTML = '';
        pathDisplay.textContent = '/ ' + currentPath.join(' / ');

        const items = Object.entries(folder).sort((a, b) => {
            if (a[1].type === 'folder' && b[1].type !== 'folder') return -1;
            if (a[1].type !== 'folder' && b[1].type === 'folder') return 1;
            return a[0].localeCompare(b[0]);
        });

        items.forEach(([name, item]) => {
            const el = document.createElement('div');
            el.className = 'finder-item';
            const icon = item.type === 'folder' ? '📁' : getFileIcon(name);
            el.innerHTML = `${icon} ${name}`;

            if (item.type === 'folder') {
                el.addEventListener('dblclick', () => {
                    currentPath.push(name);
                    renderItems();
                });
            } else {
                el.addEventListener('dblclick', () => {
                    alert(`File: ${name}\n\nContent:\n${item.content}`);
                });
            }

            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (confirm(`Delete "${name}"?`)) {
                    delete folder[name];
                    renderItems();
                }
            });

            itemsContainer.appendChild(el);
        });

        if (items.length === 0) {
            itemsContainer.innerHTML = '<div class="finder-empty">Folder is empty</div>';
        }
    }

    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'txt': '📄', 'md': '📄', 'doc': '📄',
            'jpg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'jpeg': '🖼️',
            'mp3': '🎵', 'wav': '🎵', 'flac': '🎵',
            'mp4': '🎬', 'mov': '🎬', 'avi': '🎬',
            'pdf': '📕', 'zip': '📦', 'dmg': '💿',
            'js': '📜', 'html': '🌐', 'css': '🎨'
        };
        return icons[ext] || '📄';
    }

    backBtn.addEventListener('click', () => {
        if (currentPath.length > 1) {
            currentPath.pop();
            renderItems();
        }
    });

    homeBtn.addEventListener('click', () => {
        currentPath = ['Home'];
        renderItems();
    });

    newFolderBtn.addEventListener('click', () => {
        const name = prompt('Enter folder name:');
        if (name && name.trim()) {
            const folder = getCurrentFolder();
            folder[name.trim()] = { type: 'folder', children: {} };
            renderItems();
        }
    });

    newFileBtn.addEventListener('click', () => {
        const name = prompt('Enter file name:');
        if (name && name.trim()) {
            const content = prompt('Enter file content:') || '';
            const folder = getCurrentFolder();
            folder[name.trim()] = { type: 'file', content: content };
            renderItems();
        }
    });

    renderItems();
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
