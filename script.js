/**
 * FlowState - Focus Timer with Binaural Beats
 * An addictive productivity app with XP, levels, achievements, and streaks
 * 
 * Features:
 * - XP & Level system with progression
 * - Daily challenges
 * - Achievements system
 * - Binaural beats with ambient sounds
 * - Session history
 * - Streak tracking
 * - Satisfying micro-interactions
 */

// ============================================
// App State
// ============================================
const state = {
    // Timer state
    duration: 25 * 60,
    timeRemaining: 25 * 60,
    isRunning: false,
    isPaused: false,
    timerInterval: null,
    messageInterval: null,
    
    // Audio state
    audioContext: null,
    leftOscillator: null,
    rightOscillator: null,
    leftGain: null,
    rightGain: null,
    masterGain: null,
    noiseNode: null,
    noiseGain: null,
    isAudioPlaying: false,
    volume: 0.2,
    baseFrequency: 432,
    binauralDifference: 10,
    ambientSound: 'none',
    
    // XP & Level system
    xp: 0,
    level: 1,
    xpToNextLevel: 100,
    
    // Stats
    sessionsToday: 0,
    minutesToday: 0,
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    lastSessionDate: null,
    focusScore: 0,
    
    // Daily challenge
    dailyChallengeTarget: 3,
    dailyChallengeCompleted: false,
    
    // Session history
    sessionHistory: [],
    
    // Achievements
    achievements: {},
    
    // Flags
    headphoneBannerDismissed: false
};

// ============================================
// Achievements Definition
// ============================================
const ACHIEVEMENTS = [
    { id: 'first_focus', name: 'First Focus', icon: '🎯', description: 'Complete your first session', condition: (s) => s.totalSessions >= 1 },
    { id: 'streak_3', name: '3 Day Streak', icon: '🔥', description: 'Maintain a 3 day streak', condition: (s) => s.currentStreak >= 3 },
    { id: 'streak_7', name: 'Week Warrior', icon: '⚔️', description: 'Maintain a 7 day streak', condition: (s) => s.currentStreak >= 7 },
    { id: 'sessions_5', name: 'Getting Started', icon: '🚀', description: 'Complete 5 sessions', condition: (s) => s.totalSessions >= 5 },
    { id: 'sessions_25', name: 'Focus Master', icon: '🧘', description: 'Complete 25 sessions', condition: (s) => s.totalSessions >= 25 },
    { id: 'sessions_100', name: 'Centurion', icon: '💯', description: 'Complete 100 sessions', condition: (s) => s.totalSessions >= 100 },
    { id: 'minutes_60', name: 'Hour Power', icon: '⏰', description: 'Focus for 60 minutes total', condition: (s) => s.totalMinutes >= 60 },
    { id: 'minutes_300', name: 'Deep Diver', icon: '🌊', description: 'Focus for 5 hours total', condition: (s) => s.totalMinutes >= 300 },
    { id: 'minutes_600', name: 'Time Lord', icon: '⌛', description: 'Focus for 10 hours total', condition: (s) => s.totalMinutes >= 600 },
    { id: 'level_5', name: 'Rising Star', icon: '⭐', description: 'Reach level 5', condition: (s) => s.level >= 5 },
    { id: 'level_10', name: 'Focus Legend', icon: '👑', description: 'Reach level 10', condition: (s) => s.level >= 10 },
    { id: 'daily_3', name: 'Triple Threat', icon: '🎪', description: 'Complete 3 sessions in one day', condition: (s) => s.sessionsToday >= 3 }
];

// ============================================
// Motivational Quotes
// ============================================
const quotes = [
    { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
    { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
    { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
    { text: "Where focus goes, energy flows.", author: "Tony Robbins" },
    { text: "Do not dwell in the past, do not dream of the future, concentrate on the present.", author: "Buddha" },
    { text: "Starve your distractions, feed your focus.", author: "Unknown" },
    { text: "The main thing is to keep the main thing the main thing.", author: "Stephen Covey" },
    { text: "Focus is more important than genius.", author: "Greg McKeown" },
    { text: "You can do anything, but not everything.", author: "David Allen" },
    { text: "Simplicity boils down to two steps: Identify the essential. Eliminate the rest.", author: "Leo Babauta" }
];

// Focus messages shown during sessions
const focusMessages = [
    "You're doing amazing! Keep it up! 💪",
    "Stay in the zone... you've got this! 🎯",
    "Deep breaths... deep focus... 🧘",
    "Every minute counts. You're crushing it! 🚀",
    "Flow state activated! 🌊",
    "Your future self will thank you! ⭐",
    "Distractions are temporary. Focus is forever! 🔥",
    "You're building something great! 🏗️",
    "Small steps lead to big wins! 🏆",
    "Stay present. Stay focused. Stay awesome! ✨"
];

// ============================================
// DOM Elements
// ============================================
const elements = {
    // Timer
    timerDisplay: document.getElementById('timerDisplay'),
    
    // Mini Timer Widget
    miniTimer: document.getElementById('miniTimer'),
    miniTimerHeader: document.getElementById('miniTimerHeader'),
    miniTimerClose: document.getElementById('miniTimerClose'),
    miniTimerDisplay: document.getElementById('miniTimerDisplay'),
    miniProgressRing: document.getElementById('miniProgressRing'),
    miniStartBtn: document.getElementById('miniStartBtn'),
    miniPauseBtn: document.getElementById('miniPauseBtn'),
    miniResetBtn: document.getElementById('miniResetBtn'),
    miniTimerStatus: document.getElementById('miniTimerStatus'),
    miniTimerToggle: document.getElementById('miniTimerToggle'),
    timerStatus: document.getElementById('timerStatus'),
    timerRing: document.getElementById('timerRing'),
    progressRing: document.getElementById('progressRing'),
    focusMessage: document.getElementById('focusMessage'),
    messageText: document.getElementById('messageText'),
    
    // Inputs
    taskInput: document.getElementById('taskInput'),
    customTime: document.getElementById('customTime'),
    binauralMode: document.getElementById('binauralMode'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue'),
    volumeIcon: document.getElementById('volumeIcon'),
    
    // Buttons
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    ambientBtns: document.querySelectorAll('.ambient-btn'),
    
    // XP & Level
    levelNumber: document.getElementById('levelNumber'),
    xpFill: document.getElementById('xpFill'),
    xpCurrent: document.getElementById('xpCurrent'),
    xpNeeded: document.getElementById('xpNeeded'),
    nextLevel: document.getElementById('nextLevel'),
    
    // Challenge
    dailyChallenge: document.getElementById('dailyChallenge'),
    challengeText: document.getElementById('challengeText'),
    challengeFill: document.getElementById('challengeFill'),
    challengeCount: document.getElementById('challengeCount'),
    
    // Stats
    sessionsToday: document.getElementById('sessionsToday'),
    minutesToday: document.getElementById('minutesToday'),
    focusScore: document.getElementById('focusScore'),
    streakCount: document.getElementById('streakCount'),
    
    // Achievements
    achievementsGrid: document.getElementById('achievementsGrid'),
    achievementCounter: document.getElementById('achievementCounter'),
    achievementPopup: document.getElementById('achievementPopup'),
    achievementIcon: document.getElementById('achievementIcon'),
    achievementName: document.getElementById('achievementName'),
    
    // XP Popup
    xpPopup: document.getElementById('xpPopup'),
    xpAmount: document.getElementById('xpAmount'),
    
    // History
    historyList: document.getElementById('historyList'),
    
    // Modals
    completeModal: document.getElementById('completeModal'),
    modalMessage: document.getElementById('modalMessage'),
    modalSessions: document.getElementById('modalSessions'),
    modalStreak: document.getElementById('modalStreak'),
    xpGained: document.getElementById('xpGained'),
    modalClose: document.getElementById('modalClose'),
    
    levelUpModal: document.getElementById('levelUpModal'),
    newLevel: document.getElementById('newLevel'),
    levelUpClose: document.getElementById('levelUpClose'),
    
    // Quote
    quoteText: document.getElementById('quoteText'),
    quoteAuthor: document.getElementById('quoteAuthor'),
    
    // Visual
    visualizer: document.getElementById('visualizer'),
    particles: document.getElementById('particles'),
    
    // Headphone banner
    headphoneBanner: document.getElementById('headphoneBanner'),
    headphoneClose: document.getElementById('headphoneClose')
};

// ============================================
// Initialization
// ============================================
function init() {
    loadState();
    checkStreak();
    updateAllUI();
    createParticles();
    setupEventListeners();
    setupMiniTimer();
    renderAchievements();
    renderHistory();
    showRandomQuote();
    updateProgressRing();
    updateMiniTimerUI();
    
    // Check if headphone banner was dismissed
    if (state.headphoneBannerDismissed) {
        elements.headphoneBanner.classList.add('hidden');
    }
    
    // Rotate quotes every 30 seconds
    setInterval(showRandomQuote, 30000);
}

// ============================================
// Particles Background
// ============================================
function createParticles() {
    const container = elements.particles;
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${15 + Math.random() * 20}s`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.width = `${2 + Math.random() * 4}px`;
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
    // Control buttons
    elements.startBtn.addEventListener('click', startTimer);
    elements.pauseBtn.addEventListener('click', pauseTimer);
    elements.resetBtn.addEventListener('click', resetTimer);
    elements.modalClose.addEventListener('click', closeModal);
    elements.levelUpClose.addEventListener('click', closeLevelUpModal);
    
    // Headphone banner
    elements.headphoneClose.addEventListener('click', () => {
        elements.headphoneBanner.classList.add('hidden');
        state.headphoneBannerDismissed = true;
        saveState();
    });
    
    // Preset buttons
    elements.presetBtns.forEach(btn => {
        btn.addEventListener('click', () => selectPreset(btn));
    });
    
    // Custom time input
    elements.customTime.addEventListener('input', handleCustomTime);
    elements.customTime.addEventListener('focus', () => {
        elements.presetBtns.forEach(btn => btn.classList.remove('active'));
    });
    
    // Binaural mode selection
    elements.binauralMode.addEventListener('change', (e) => {
        state.binauralDifference = parseInt(e.target.value);
        if (state.isAudioPlaying) {
            updateBinauralFrequency();
        }
        playClickSound();
    });
    
    // Ambient sound buttons
    elements.ambientBtns.forEach(btn => {
        btn.addEventListener('click', () => selectAmbientSound(btn));
    });
    
    // Volume control
    elements.volumeSlider.addEventListener('input', handleVolumeChange);
    elements.volumeIcon.addEventListener('click', toggleMute);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
    
    // Prevent accidental page close during session
    window.addEventListener('beforeunload', (e) => {
        if (state.isRunning) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// ============================================
// Timer Functions
// ============================================
function startTimer() {
    if (state.timeRemaining <= 0) return;
    
    state.isRunning = true;
    state.isPaused = false;
    
    // Update UI
    elements.startBtn.classList.add('hidden');
    elements.pauseBtn.classList.remove('hidden');
    elements.timerRing.classList.add('active');
    elements.visualizer.classList.add('active');
    elements.focusMessage.classList.remove('hidden');
    updateTimerStatus('Focus mode activated');
    
    // Show random focus message
    showFocusMessage();
    state.messageInterval = setInterval(showFocusMessage, 30000);
    
    // Start binaural beats
    startBinauralBeats();
    
    // Start ambient sound if selected
    if (state.ambientSound !== 'none') {
        startAmbientSound();
    }
    
    // Start countdown
    state.timerInterval = setInterval(() => {
        state.timeRemaining--;
        updateTimerDisplay();
        updateProgressRing();
        updateMiniTimerUI();
        
        if (state.timeRemaining <= 0) {
            completeSession();
        }
    }, 1000);
    
    playClickSound();
    updateMiniTimerUI();
}

function pauseTimer() {
    state.isRunning = false;
    state.isPaused = true;
    
    clearInterval(state.timerInterval);
    clearInterval(state.messageInterval);
    
    // Update UI
    elements.pauseBtn.classList.add('hidden');
    elements.startBtn.classList.remove('hidden');
    elements.startBtn.querySelector('.btn-text').textContent = 'Resume';
    elements.timerRing.classList.remove('active');
    elements.focusMessage.classList.add('hidden');
    updateTimerStatus('Paused');
    
    // Fade out audio
    fadeOutAudio();
    
    playClickSound();
    updateMiniTimerUI();
}

function resetTimer() {
    state.isRunning = false;
    state.isPaused = false;
    state.timeRemaining = state.duration;
    
    clearInterval(state.timerInterval);
    clearInterval(state.messageInterval);
    
    // Update UI
    elements.pauseBtn.classList.add('hidden');
    elements.startBtn.classList.remove('hidden');
    elements.startBtn.querySelector('.btn-text').textContent = 'Start Focus';
    elements.timerRing.classList.remove('active');
    elements.visualizer.classList.remove('active');
    elements.focusMessage.classList.add('hidden');
    updateTimerDisplay();
    updateProgressRing();
    updateTimerStatus('Ready to focus');
    
    // Stop audio
    stopBinauralBeats();
    
    playClickSound();
    updateMiniTimerUI();
}

function completeSession() {
    clearInterval(state.timerInterval);
    clearInterval(state.messageInterval);
    state.isRunning = false;
    
    // Calculate session stats
    const sessionMinutes = Math.round(state.duration / 60);
    const xpEarned = calculateXP(sessionMinutes);
    
    // Update stats
    state.sessionsToday++;
    state.minutesToday += sessionMinutes;
    state.totalSessions++;
    state.totalMinutes += sessionMinutes;
    state.lastSessionDate = new Date().toDateString();
    
    // Calculate focus score (based on session length)
    state.focusScore = Math.min(100, Math.round((state.minutesToday / 120) * 100));
    
    // Add XP
    addXP(xpEarned);
    
    // Check daily challenge
    checkDailyChallenge();
    
    // Add to history
    addToHistory(sessionMinutes, xpEarned);
    
    // Check achievements
    checkAchievements();
    
    // Update streak
    updateStreak();
    
    // Save state
    saveState();
    
    // Update UI
    updateAllUI();
    
    // Stop audio
    stopBinauralBeats();
    
    // Show completion modal
    showCompletionModal(sessionMinutes, xpEarned);
    
    // Play completion sound
    playCompletionSound();
    
    // Reset timer state
    elements.pauseBtn.classList.add('hidden');
    elements.startBtn.classList.remove('hidden');
    elements.startBtn.querySelector('.btn-text').textContent = 'Start Focus';
    elements.timerRing.classList.remove('active');
    elements.visualizer.classList.remove('active');
    elements.focusMessage.classList.add('hidden');
}

function selectPreset(btn) {
    elements.presetBtns.forEach(b => b.classList.remove('active'));
    elements.customTime.value = '';
    btn.classList.add('active');
    
    const minutes = parseInt(btn.dataset.time);
    state.duration = minutes * 60;
    state.timeRemaining = state.duration;
    
    updateTimerDisplay();
    updateProgressRing();
    updateMiniTimerUI();
    playClickSound();
}

function handleCustomTime() {
    const value = parseInt(elements.customTime.value);
    
    if (value && value > 0 && value <= 180) {
        elements.presetBtns.forEach(btn => btn.classList.remove('active'));
        state.duration = value * 60;
        state.timeRemaining = state.duration;
        updateTimerDisplay();
        updateProgressRing();
        updateMiniTimerUI();
    }
}

// ============================================
// Timer Display Updates
// ============================================
function updateTimerDisplay() {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    elements.timerDisplay.textContent = display;
    
    // Update page title
    if (state.isRunning) {
        document.title = `${display} - FlowState`;
    } else {
        document.title = 'FlowState - Deep Focus Timer';
    }
}

function updateProgressRing() {
    const circumference = 2 * Math.PI * 90;
    const progress = state.timeRemaining / state.duration;
    const offset = circumference * (1 - progress);
    
    elements.progressRing.style.strokeDasharray = circumference;
    elements.progressRing.style.strokeDashoffset = offset;
}

function updateTimerStatus(status) {
    elements.timerStatus.textContent = status;
}

function showFocusMessage() {
    const message = focusMessages[Math.floor(Math.random() * focusMessages.length)];
    elements.messageText.textContent = message;
}

// ============================================
// XP & Level System
// ============================================
function calculateXP(minutes) {
    // Base XP: 3 XP per minute
    let xp = minutes * 3;
    
    // Bonus for longer sessions
    if (minutes >= 45) xp += 25;
    else if (minutes >= 25) xp += 10;
    
    // Streak bonus
    if (state.currentStreak >= 7) xp = Math.round(xp * 1.5);
    else if (state.currentStreak >= 3) xp = Math.round(xp * 1.25);
    
    return xp;
}

function addXP(amount) {
    state.xp += amount;
    
    // Show XP popup
    showXPPopup(amount);
    
    // Check for level up
    while (state.xp >= state.xpToNextLevel) {
        state.xp -= state.xpToNextLevel;
        state.level++;
        state.xpToNextLevel = calculateXPForLevel(state.level);
        
        // Show level up modal after a delay
        setTimeout(() => showLevelUpModal(), 2000);
    }
    
    updateXPDisplay();
}

function calculateXPForLevel(level) {
    // XP required increases with level
    return Math.round(100 * Math.pow(1.3, level - 1));
}

function updateXPDisplay() {
    elements.levelNumber.textContent = state.level;
    elements.xpCurrent.textContent = state.xp;
    elements.xpNeeded.textContent = state.xpToNextLevel;
    elements.nextLevel.textContent = state.level + 1;
    
    const percentage = (state.xp / state.xpToNextLevel) * 100;
    elements.xpFill.style.width = `${percentage}%`;
}

function showXPPopup(amount) {
    elements.xpAmount.textContent = amount;
    elements.xpPopup.classList.add('show');
    
    setTimeout(() => {
        elements.xpPopup.classList.remove('show');
    }, 2000);
}

// ============================================
// Daily Challenge
// ============================================
function checkDailyChallenge() {
    if (!state.dailyChallengeCompleted && state.sessionsToday >= state.dailyChallengeTarget) {
        state.dailyChallengeCompleted = true;
        addXP(100); // Bonus XP for completing challenge
        elements.dailyChallenge.classList.add('completed');
    }
    
    updateChallengeDisplay();
}

function updateChallengeDisplay() {
    const progress = Math.min(state.sessionsToday, state.dailyChallengeTarget);
    const percentage = (progress / state.dailyChallengeTarget) * 100;
    
    elements.challengeFill.style.width = `${percentage}%`;
    elements.challengeCount.textContent = `${progress}/${state.dailyChallengeTarget}`;
}

// ============================================
// Achievements System
// ============================================
function checkAchievements() {
    let newAchievements = [];
    
    ACHIEVEMENTS.forEach(achievement => {
        if (!state.achievements[achievement.id] && achievement.condition(state)) {
            state.achievements[achievement.id] = {
                unlockedAt: new Date().toISOString()
            };
            newAchievements.push(achievement);
        }
    });
    
    // Show achievement popups one by one
    newAchievements.forEach((achievement, index) => {
        setTimeout(() => showAchievementPopup(achievement), index * 3000);
    });
    
    renderAchievements();
}

function showAchievementPopup(achievement) {
    elements.achievementIcon.textContent = achievement.icon;
    elements.achievementName.textContent = achievement.name;
    elements.achievementPopup.classList.add('show');
    
    playAchievementSound();
    
    setTimeout(() => {
        elements.achievementPopup.classList.remove('show');
    }, 3000);
}

function renderAchievements() {
    const unlockedCount = Object.keys(state.achievements).length;
    elements.achievementCounter.textContent = `${unlockedCount}/${ACHIEVEMENTS.length}`;
    
    elements.achievementsGrid.innerHTML = ACHIEVEMENTS.map(achievement => {
        const isUnlocked = state.achievements[achievement.id];
        return `
            <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}" title="${achievement.description}">
                <span class="icon">${achievement.icon}</span>
                <span class="name">${achievement.name}</span>
            </div>
        `;
    }).join('');
}

// ============================================
// Session History
// ============================================
function addToHistory(minutes, xp) {
    const session = {
        id: Date.now(),
        task: elements.taskInput.value || 'Focus session',
        minutes: minutes,
        xp: xp,
        timestamp: new Date().toISOString()
    };
    
    state.sessionHistory.unshift(session);
    
    // Keep only last 20 sessions
    if (state.sessionHistory.length > 20) {
        state.sessionHistory = state.sessionHistory.slice(0, 20);
    }
    
    renderHistory();
}

function renderHistory() {
    if (state.sessionHistory.length === 0) {
        elements.historyList.innerHTML = '<p class="history-empty">Complete your first session to see history</p>';
        return;
    }
    
    elements.historyList.innerHTML = state.sessionHistory.slice(0, 5).map(session => {
        const date = new Date(session.timestamp);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = isToday(date) ? 'Today' : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        
        return `
            <div class="history-item">
                <span class="history-icon">✅</span>
                <div class="history-info">
                    <div class="history-task">${escapeHtml(session.task)}</div>
                    <div class="history-meta">${session.minutes} min • ${dateStr} ${timeStr}</div>
                </div>
                <span class="history-xp">+${session.xp} XP</span>
            </div>
        `;
    }).join('');
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Streak Management
// ============================================
function updateStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (state.lastSessionDate === yesterday) {
        state.currentStreak++;
    } else if (state.lastSessionDate !== today) {
        state.currentStreak = 1;
    }
}

function checkStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // Reset daily stats if new day
    if (state.lastSessionDate && state.lastSessionDate !== today) {
        // Check if streak should be reset
        if (state.lastSessionDate !== yesterday) {
            state.currentStreak = 0;
        }
        
        state.sessionsToday = 0;
        state.minutesToday = 0;
        state.focusScore = 0;
        state.dailyChallengeCompleted = false;
        elements.dailyChallenge.classList.remove('completed');
    }
}

// ============================================
// Binaural Beats Audio
// ============================================
function startBinauralBeats() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (state.audioContext.state === 'suspended') {
        state.audioContext.resume();
    }
    
    // Create stereo panners
    const leftPanner = state.audioContext.createStereoPanner();
    const rightPanner = state.audioContext.createStereoPanner();
    leftPanner.pan.value = -1;
    rightPanner.pan.value = 1;
    
    // Create gain nodes
    state.leftGain = state.audioContext.createGain();
    state.rightGain = state.audioContext.createGain();
    state.masterGain = state.audioContext.createGain();
    
    state.leftGain.gain.value = 0;
    state.rightGain.gain.value = 0;
    state.masterGain.gain.value = state.volume;
    
    // Create oscillators
    state.leftOscillator = state.audioContext.createOscillator();
    state.rightOscillator = state.audioContext.createOscillator();
    
    state.leftOscillator.frequency.value = state.baseFrequency;
    state.rightOscillator.frequency.value = state.baseFrequency + state.binauralDifference;
    
    state.leftOscillator.type = 'sine';
    state.rightOscillator.type = 'sine';
    
    // Connect audio graph
    state.leftOscillator.connect(state.leftGain);
    state.leftGain.connect(leftPanner);
    leftPanner.connect(state.masterGain);
    
    state.rightOscillator.connect(state.rightGain);
    state.rightGain.connect(rightPanner);
    rightPanner.connect(state.masterGain);
    
    state.masterGain.connect(state.audioContext.destination);
    
    // Start oscillators
    state.leftOscillator.start();
    state.rightOscillator.start();
    
    // Smooth fade in over 5 seconds
    const now = state.audioContext.currentTime;
    state.leftGain.gain.linearRampToValueAtTime(1, now + 5);
    state.rightGain.gain.linearRampToValueAtTime(1, now + 5);
    
    state.isAudioPlaying = true;
}

function fadeOutAudio() {
    if (!state.isAudioPlaying || !state.audioContext) return;
    
    const now = state.audioContext.currentTime;
    
    if (state.leftGain) state.leftGain.gain.linearRampToValueAtTime(0, now + 2);
    if (state.rightGain) state.rightGain.gain.linearRampToValueAtTime(0, now + 2);
    if (state.noiseGain) state.noiseGain.gain.linearRampToValueAtTime(0, now + 2);
    
    setTimeout(() => {
        stopOscillators();
    }, 2000);
}

function stopOscillators() {
    if (state.leftOscillator) {
        state.leftOscillator.stop();
        state.leftOscillator = null;
    }
    if (state.rightOscillator) {
        state.rightOscillator.stop();
        state.rightOscillator = null;
    }
    if (state.noiseNode) {
        state.noiseNode.stop();
        state.noiseNode = null;
    }
    state.isAudioPlaying = false;
}

function stopBinauralBeats() {
    if (!state.audioContext) return;
    fadeOutAudio();
}

function updateBinauralFrequency() {
    if (!state.rightOscillator) return;
    
    const now = state.audioContext.currentTime;
    state.rightOscillator.frequency.linearRampToValueAtTime(
        state.baseFrequency + state.binauralDifference,
        now + 0.5
    );
}

// ============================================
// Ambient Sounds (Synthesized)
// ============================================
function selectAmbientSound(btn) {
    elements.ambientBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const newSound = btn.dataset.sound;
    
    // Stop current ambient if playing
    if (state.noiseNode) {
        state.noiseNode.stop();
        state.noiseNode = null;
    }
    
    state.ambientSound = newSound;
    
    // Start new ambient if timer is running
    if (state.isRunning && newSound !== 'none') {
        startAmbientSound();
    }
    
    playClickSound();
}

function startAmbientSound() {
    if (!state.audioContext || state.ambientSound === 'none') return;
    
    // Create noise for ambient sounds
    const bufferSize = 2 * state.audioContext.sampleRate;
    const noiseBuffer = state.audioContext.createBuffer(1, bufferSize, state.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Generate noise based on type
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    state.noiseNode = state.audioContext.createBufferSource();
    state.noiseNode.buffer = noiseBuffer;
    state.noiseNode.loop = true;
    
    // Create filter for different ambient sounds
    const filter = state.audioContext.createBiquadFilter();
    state.noiseGain = state.audioContext.createGain();
    
    switch (state.ambientSound) {
        case 'rain':
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            state.noiseGain.gain.value = 0.15;
            break;
        case 'fire':
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            state.noiseGain.gain.value = 0.1;
            break;
        case 'forest':
            filter.type = 'bandpass';
            filter.frequency.value = 2000;
            filter.Q.value = 0.5;
            state.noiseGain.gain.value = 0.08;
            break;
        case 'waves':
            filter.type = 'lowpass';
            filter.frequency.value = 600;
            state.noiseGain.gain.value = 0.12;
            break;
    }
    
    state.noiseNode.connect(filter);
    filter.connect(state.noiseGain);
    state.noiseGain.connect(state.masterGain);
    
    state.noiseNode.start();
}

// ============================================
// Volume Control
// ============================================
function handleVolumeChange(e) {
    const value = parseInt(e.target.value);
    state.volume = value / 100;
    
    elements.volumeValue.textContent = `${value}%`;
    
    if (value === 0) {
        elements.volumeIcon.textContent = '🔇';
    } else if (value < 50) {
        elements.volumeIcon.textContent = '🔉';
    } else {
        elements.volumeIcon.textContent = '🔊';
    }
    
    if (state.masterGain) {
        state.masterGain.gain.value = state.volume;
    }
}

function toggleMute() {
    if (state.volume > 0) {
        state.previousVolume = state.volume;
        state.volume = 0;
        elements.volumeSlider.value = 0;
        elements.volumeValue.textContent = '0%';
        elements.volumeIcon.textContent = '🔇';
    } else {
        state.volume = state.previousVolume || 0.2;
        elements.volumeSlider.value = state.volume * 100;
        elements.volumeValue.textContent = `${Math.round(state.volume * 100)}%`;
        elements.volumeIcon.textContent = '🔊';
    }
    
    if (state.masterGain) {
        state.masterGain.gain.value = state.volume;
    }
}

// ============================================
// Sound Effects
// ============================================
function playClickSound() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const oscillator = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(state.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    
    const now = state.audioContext.currentTime;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    oscillator.start(now);
    oscillator.stop(now + 0.1);
}

function playCompletionSound() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const oscillator = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(state.audioContext.destination);
    
    oscillator.type = 'sine';
    
    const now = state.audioContext.currentTime;
    
    // Pleasant ascending tone sequence
    oscillator.frequency.setValueAtTime(523.25, now);
    oscillator.frequency.setValueAtTime(659.25, now + 0.15);
    oscillator.frequency.setValueAtTime(783.99, now + 0.3);
    oscillator.frequency.setValueAtTime(1046.50, now + 0.45);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.8);
    
    oscillator.start(now);
    oscillator.stop(now + 0.8);
}

function playAchievementSound() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const oscillator = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(state.audioContext.destination);
    
    oscillator.type = 'sine';
    
    const now = state.audioContext.currentTime;
    
    // Magical achievement sound
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.setValueAtTime(1108.73, now + 0.1);
    oscillator.frequency.setValueAtTime(1318.51, now + 0.2);
    oscillator.frequency.setValueAtTime(1760, now + 0.3);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);
    
    oscillator.start(now);
    oscillator.stop(now + 0.5);
}

// ============================================
// Keyboard Shortcuts
// ============================================
function handleKeyboard(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    
    switch (e.code) {
        case 'Space':
            e.preventDefault();
            if (state.isRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
            break;
        case 'KeyR':
            resetTimer();
            break;
        case 'KeyM':
            toggleMute();
            break;
    }
}

// ============================================
// Modals
// ============================================
function showCompletionModal(minutes, xp) {
    elements.modalMessage.textContent = `You focused for ${minutes} minutes!`;
    elements.xpGained.textContent = `+${xp} XP`;
    elements.modalSessions.textContent = state.sessionsToday;
    elements.modalStreak.textContent = state.currentStreak;
    elements.completeModal.classList.remove('hidden');
}

function closeModal() {
    elements.completeModal.classList.add('hidden');
    
    // Reset timer for next session
    state.timeRemaining = state.duration;
    updateTimerDisplay();
    updateProgressRing();
    updateTimerStatus('Ready for another session?');
}

function showLevelUpModal() {
    elements.newLevel.textContent = state.level;
    elements.levelUpModal.classList.remove('hidden');
    playAchievementSound();
}

function closeLevelUpModal() {
    elements.levelUpModal.classList.add('hidden');
}

// ============================================
// Quotes
// ============================================
function showRandomQuote() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    
    elements.quoteText.style.opacity = 0;
    elements.quoteAuthor.style.opacity = 0;
    
    setTimeout(() => {
        elements.quoteText.textContent = `"${quote.text}"`;
        elements.quoteAuthor.textContent = `— ${quote.author}`;
        elements.quoteText.style.opacity = 1;
        elements.quoteAuthor.style.opacity = 1;
    }, 300);
}

// ============================================
// UI Updates
// ============================================
function updateAllUI() {
    updateTimerDisplay();
    updateXPDisplay();
    updateChallengeDisplay();
    updateStatsDisplay();
}

function updateStatsDisplay() {
    elements.sessionsToday.textContent = state.sessionsToday;
    elements.minutesToday.textContent = state.minutesToday;
    elements.focusScore.textContent = state.focusScore;
    elements.streakCount.textContent = state.currentStreak;
}

// ============================================
// State Persistence
// ============================================
function saveState() {
    const data = {
        xp: state.xp,
        level: state.level,
        xpToNextLevel: state.xpToNextLevel,
        sessionsToday: state.sessionsToday,
        minutesToday: state.minutesToday,
        totalSessions: state.totalSessions,
        totalMinutes: state.totalMinutes,
        currentStreak: state.currentStreak,
        lastSessionDate: state.lastSessionDate,
        focusScore: state.focusScore,
        dailyChallengeCompleted: state.dailyChallengeCompleted,
        achievements: state.achievements,
        sessionHistory: state.sessionHistory,
        headphoneBannerDismissed: state.headphoneBannerDismissed
    };
    localStorage.setItem('flowstate-data', JSON.stringify(data));
}

function loadState() {
    const saved = localStorage.getItem('flowstate-data');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(state, data);
    }
}

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', init);

// ============================================
// Mini Timer Draggable Widget
// ============================================
function setupMiniTimer() {
    const miniTimer = elements.miniTimer;
    const header = elements.miniTimerHeader;
    
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    // Make header draggable
    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDrag, { passive: false });
    
    function startDrag(e) {
        if (e.target === elements.miniTimerClose) return;
        
        isDragging = true;
        miniTimer.classList.add('dragging');
        
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        
        const rect = miniTimer.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        let currentX, currentY;
        
        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        let newX = initialX + deltaX;
        let newY = initialY + deltaY;
        
        // Keep within viewport
        const maxX = window.innerWidth - miniTimer.offsetWidth;
        const maxY = window.innerHeight - miniTimer.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        miniTimer.style.left = newX + 'px';
        miniTimer.style.top = newY + 'px';
        miniTimer.style.right = 'auto';
    }
    
    function stopDrag() {
        isDragging = false;
        miniTimer.classList.remove('dragging');
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
        
        // Save position
        saveMiniTimerPosition();
    }
    
    // Mini timer controls
    elements.miniStartBtn.addEventListener('click', () => {
        startTimer();
        updateMiniTimerUI();
    });
    
    elements.miniPauseBtn.addEventListener('click', () => {
        pauseTimer();
        updateMiniTimerUI();
    });
    
    elements.miniResetBtn.addEventListener('click', () => {
        resetTimer();
        updateMiniTimerUI();
    });
    
    // Close/minimize mini timer
    elements.miniTimerClose.addEventListener('click', () => {
        miniTimer.classList.add('hidden');
        elements.miniTimerToggle.classList.remove('hidden');
        if (state.isRunning) {
            elements.miniTimerToggle.classList.add('has-active');
        }
    });
    
    // Show mini timer
    elements.miniTimerToggle.addEventListener('click', () => {
        miniTimer.classList.remove('hidden');
        elements.miniTimerToggle.classList.add('hidden');
        elements.miniTimerToggle.classList.remove('has-active');
    });
    
    // Load saved position
    loadMiniTimerPosition();
}

function saveMiniTimerPosition() {
    const rect = elements.miniTimer.getBoundingClientRect();
    localStorage.setItem('flowstate-mini-pos', JSON.stringify({
        left: rect.left,
        top: rect.top
    }));
}

function loadMiniTimerPosition() {
    const saved = localStorage.getItem('flowstate-mini-pos');
    if (saved) {
        const pos = JSON.parse(saved);
        elements.miniTimer.style.left = pos.left + 'px';
        elements.miniTimer.style.top = pos.top + 'px';
        elements.miniTimer.style.right = 'auto';
    }
}

function updateMiniTimerUI() {
    // Update display
    elements.miniTimerDisplay.textContent = elements.timerDisplay.textContent;
    
    // Update progress ring
    const circumference = 2 * Math.PI * 26; // radius = 26
    const progress = state.timeRemaining / state.duration;
    const offset = circumference * (1 - progress);
    elements.miniProgressRing.style.strokeDasharray = circumference;
    elements.miniProgressRing.style.strokeDashoffset = offset;
    
    // Update buttons
    if (state.isRunning) {
        elements.miniStartBtn.classList.add('hidden');
        elements.miniPauseBtn.classList.remove('hidden');
        elements.miniTimer.classList.add('active');
        elements.miniTimerStatus.textContent = 'Focusing...';
    } else if (state.isPaused) {
        elements.miniStartBtn.classList.remove('hidden');
        elements.miniPauseBtn.classList.add('hidden');
        elements.miniTimer.classList.remove('active');
        elements.miniTimerStatus.textContent = 'Paused';
    } else {
        elements.miniStartBtn.classList.remove('hidden');
        elements.miniPauseBtn.classList.add('hidden');
        elements.miniTimer.classList.remove('active');
        elements.miniTimerStatus.textContent = 'Ready';
    }
    
    // Update toggle button pulse if minimized
    if (elements.miniTimer.classList.contains('hidden') && state.isRunning) {
        elements.miniTimerToggle.classList.add('has-active');
    } else {
        elements.miniTimerToggle.classList.remove('has-active');
    }
}
