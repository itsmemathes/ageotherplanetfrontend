// --- Configuration & Data ---
const planets = [
    { name: "Mercury", period: 0.2408, gravity: 0.38, icon: "🪙", fact: "A year is only 88 Earth days!" },
    { name: "Venus", period: 0.6152, gravity: 0.91, icon: "✨", fact: "A day on Venus is longer than a year!" },
    { name: "Earth", period: 1.0, gravity: 1.0, icon: "🌍", fact: "The only known planet with life!" },
    { name: "Mars", period: 1.8808, gravity: 0.38, icon: "🔴", fact: "Home of Olympus Mons, largest volcano." },
    { name: "Jupiter", period: 11.862, gravity: 2.34, icon: "🌩️", fact: "Could fit 1,300 Earths inside!" },
    { name: "Saturn", period: 29.447, gravity: 1.06, icon: "🪐", fact: "Its density is so low, it would float in water." },
    { name: "Uranus", period: 84.016, gravity: 0.92, icon: "❄️", fact: "Rotates on its side like a rolling ball." },
    { name: "Neptune", period: 164.79, gravity: 1.19, icon: "🌊", fact: "Has supersonic winds up to 1,200 mph." }
];

// --- State Management ---
const state = {
    dob: null,
    theme: 'dark',
    mode: 'orbital', // 'orbital' or 'gravity'
    antigravity: false,
    selectedPlanet: "Earth" // Default focus
};

// --- DOM Elements ---
const els = {
    dob: document.getElementById('dob'),
    btnCalc: document.getElementById('calculate-btn'),
    btnReset: document.getElementById('reset-btn'), // New Reset Button
    btnTheme: document.getElementById('theme-btn'),
    btnGravity: document.getElementById('gravity-mode-btn'),
    btnQuiz: document.getElementById('quiz-btn'), // Quiz Button

    // Quiz Elements
    quizModal: document.getElementById('quiz-modal'),
    closeQuiz: document.getElementById('close-quiz'),
    quizQuestion: document.getElementById('quiz-question'),
    quizOptions: document.getElementById('quiz-options'),
    quizFeedback: document.getElementById('quiz-feedback'),
    btnNextQ: document.getElementById('next-question-btn'),
    scoreVal: document.getElementById('score-val'),

    results: document.getElementById('result-section'),

    // Dynamic Hero Elements
    heroCard: document.getElementById('earth-card'),
    heroIcon: document.querySelector('#earth-card .stat-icon'),
    heroTitle: document.querySelector('#earth-card h3'),
    heroValue: document.getElementById('earth-age-display'),
    heroSub: document.getElementById('earth-exact-display'),
    heroBadge: document.querySelector('.earth-badge'),

    nextBirthday: document.getElementById('next-birthday-display'),
    grid: document.getElementById('planet-grid'),
    avatar: document.getElementById('avatar-display'),
    body: document.body,
    container: document.getElementById('main-container')
};

// --- Quiz Data ---
const questions = [
    { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
    { q: "Which planet has the most gravity?", a: ["Earth", "Sun", "Jupiter", "Neptune"], correct: 2 },
    { q: "One year on Mercury is equal to?", a: ["88 Earth days", "365 Earth days", "12 Years", "24 Hours"], correct: 0 },
    { q: "Which planet is famous for its beautiful rings?", a: ["Uranus", "Saturn", "Mars", "Pluto"], correct: 1 },
    { q: "Which planet is closest to the Sun?", a: ["Venus", "Earth", "Mercury", "Mars"], correct: 2 },
    { q: "Where would you weigh the least?", a: ["Jupiter", "Earth", "Mars", "Mercury"], correct: 2 }, // Mars/Mercury have same gravity 0.38, but usually Mars is the answer in quizzes
    { q: "Which is the largest planet in our solar system?", a: ["Earth", "Saturn", "Jupiter", "Uranus"], correct: 2 },
    { q: "What is the Great Red Spot on Jupiter?", a: ["A volcano", "A storm", "A crater", "A lake"], correct: 1 }
];

let currentQ = 0;
let score = 0;

// --- Initialization ---
window.addEventListener('scroll', () => { /* prevent scroll issues in physics mode */ });
init();

function init() {
    loadPreferences();
    setupEventListeners();
}

function setupEventListeners() {
    els.btnCalc.addEventListener('click', calculateAll);
    els.btnReset.addEventListener('click', resetCalculator); // Add Reset Listener
    els.btnTheme.addEventListener('click', toggleTheme);
    els.btnGravity.addEventListener('click', togglePhysics);

    // Quiz Listeners
    els.btnQuiz.addEventListener('click', openQuiz);
    els.closeQuiz.addEventListener('click', closeQuiz);
    els.btnNextQ.addEventListener('click', nextQuestion);
    window.addEventListener('click', (e) => {
        if (e.target === els.quizModal) closeQuiz();
    });
}

// --- Core Logic ---

function loadPreferences() {
    const savedDob = localStorage.getItem('user_dob');
    const savedTheme = localStorage.getItem('user_theme');

    if (savedDob) {
        els.dob.value = savedDob;
        state.dob = new Date(savedDob);
        // Auto calculate on load if data exists
        calculateAll();
    }

    if (savedTheme) {
        state.theme = savedTheme;
        applyTheme();
    }
}

function savePreferences() {
    if (els.dob.value) {
        localStorage.setItem('user_dob', els.dob.value);
    } else {
        localStorage.removeItem('user_dob');
    }
    localStorage.setItem('user_theme', state.theme);
}

function resetCalculator() {
    els.dob.value = '';
    state.dob = null;
    savePreferences();

    els.results.classList.add('hidden');
    els.avatar.textContent = "👨‍🚀"; // Reset avatar

    // Optional: Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    savePreferences();
}

function applyTheme() {
    if (state.theme === 'light') {
        els.body.classList.add('light-mode');
        els.btnTheme.textContent = '🌑';
    } else {
        els.body.classList.remove('light-mode');
        els.btnTheme.textContent = '☀️';
    }
}

function calculateAll() {
    const dobValue = els.dob.value;
    if (!dobValue) return alert("Please select a date!");

    state.dob = new Date(dobValue);
    savePreferences();

    const now = new Date();
    if (state.dob > now) return alert("Future babies not allowed! 👶");

    // Earth Calculations (Base)
    const diffMs = now - state.dob;
    const earthYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

    updateAvatar(earthYears);
    updateDisplay(earthYears);

    els.results.classList.remove('hidden');
    els.results.scrollIntoView({ behavior: 'smooth' });
}


function getExactAge(dob, now) {
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    if (days < 0) {
        months--;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    return { years, months, days };
}

function getDaysToNextBirthday(dob) {
    const now = new Date();
    let nextBday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());

    if (now > nextBday) {
        nextBday.setFullYear(now.getFullYear() + 1);
    }

    const diffTime = Math.abs(nextBday - now);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function updateAvatar(age) {
    let icon = "👶";
    if (age > 4) icon = "👦";
    if (age > 13) icon = "👱";
    if (age > 20) icon = "👨‍🚀"; // Space explorer prime!
    if (age > 60) icon = "👴";
    if (age > 90) icon = "👽"; // Ancient alien
    els.avatar.textContent = icon;
}

function updateDisplay(earthYears) {
    // 1. Render Hero Section (Selected Planet)
    const currentObj = planets.find(p => p.name === state.selectedPlanet);
    renderHeroCard(currentObj, earthYears);

    // 2. Render Grid (All OTHER planets)
    const otherPlanets = planets.filter(p => p.name !== state.selectedPlanet);
    renderGrid(otherPlanets, earthYears);
}

function renderHeroCard(p, earthYears) {
    // Calculate stats for the hero planet
    let ageVal, ageSub;

    // Default to Orbital Mode (Scientific)
    const planetAge = (earthYears / p.period).toFixed(2);
    ageVal = `${planetAge} Years`;
    ageSub = `1 Year = ${p.period} Earth Years`;

    // Next birthday (Universal calculation)
    const oneDay = 1000 * 60 * 60 * 24;
    const planetYearInDays = p.period * 365.25;
    const ageInDays = (new Date() - state.dob) / oneDay;
    const daysUntilNextBirthday = Math.ceil(planetYearInDays - (ageInDays % planetYearInDays));

    // Update Text
    els.heroIcon.textContent = p.icon;
    els.heroTitle.textContent = `${p.name} Age`;
    els.heroValue.textContent = ageVal;
    els.heroSub.textContent = ageSub;
    els.heroBadge.textContent = p.name === 'Earth' ? "You are here 🌍" : `Selected: ${p.name}`;

    // Update Global Birthday Card
    els.nextBirthday.textContent = `${daysUntilNextBirthday} Days`;
}

function renderGrid(planetList, earthYears) {
    els.grid.innerHTML = '';

    planetList.forEach(p => {
        let ageDisplay = "";
        let subText = "";

        // Default to Orbital Mode (Scientific)
        const planetAge = (earthYears / p.period).toFixed(2);
        ageDisplay = `${planetAge} Years`;
        subText = `1 Year = ${p.period} Earth Years`;

        // Next Birthday
        const oneDay = 1000 * 60 * 60 * 24;
        const planetYearInDays = p.period * 365.25;
        const ageInDays = (new Date() - state.dob) / oneDay;
        const daysUntilNextBirthday = Math.ceil(planetYearInDays - (ageInDays % planetYearInDays));

        let birthdayText = `${daysUntilNextBirthday} days`;
        if (daysUntilNextBirthday > 60) {
            const months = (daysUntilNextBirthday / 30.44).toFixed(1);
            birthdayText = `${months} mo`;
        }

        const card = document.createElement('div');
        card.className = 'planet-card';
        card.innerHTML = `
            <div class="planet-icon">${p.icon}</div>
            <h2>${p.name}</h2>
            <div class="planet-age-main">${ageDisplay}</div>
            <div class="planet-details" style="display: block; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; margin-top: 10px;">
                <p style="font-size: 0.9rem; margin-bottom: 5px;">🎂 Next: <strong style="color: var(--accent-color);">${birthdayText}</strong></p>
                <div class="tooltip">
                    <strong>Fact:</strong> ${p.fact}<br>
                    <strong>Click to Highlight!</strong>
                </div>
            </div>
        `;

        // CLICK TO SWAP
        card.addEventListener('click', () => {
            // Animate Swap?
            state.selectedPlanet = p.name;
            updateDisplay(earthYears);
            // Scroll up slightly to show change
            els.heroCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        els.grid.appendChild(card);
    });
}

// --- Quiz Functions ---

function openQuiz() {
    els.quizModal.classList.remove('hidden');
    // small delay to allow display:flex to apply before opacity transition
    setTimeout(() => {
        els.quizModal.classList.add('show');
    }, 10);
    currentQ = 0;
    score = 0;
    els.scoreVal.textContent = "0";
    loadQuestion();
}

function closeQuiz() {
    els.quizModal.classList.remove('show');
    setTimeout(() => {
        els.quizModal.classList.add('hidden');
    }, 300); // Wait for transition
}

function loadQuestion() {
    if (currentQ >= questions.length) {
        // End of Quiz
        els.quizQuestion.innerHTML = `🎉 Quiz Completed! <br> Final Score: ${score}/${questions.length}`;
        els.quizOptions.innerHTML = "";
        els.quizFeedback.textContent = "";
        els.btnNextQ.classList.add('hidden');

        // Add Restart Button
        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn primary';
        restartBtn.textContent = "Play Again 🔄";
        restartBtn.onclick = () => {
            currentQ = 0; score = 0; els.scoreVal.textContent = "0"; loadQuestion();
        };
        els.quizOptions.appendChild(restartBtn);
        return;
    }

    const qData = questions[currentQ];
    els.quizQuestion.textContent = qData.q;
    els.quizOptions.innerHTML = "";
    els.quizFeedback.textContent = "";
    els.btnNextQ.classList.add('hidden');

    qData.a.forEach((opt, index) => {
        const btn = document.createElement('div');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(index, qData.correct, btn);
        els.quizOptions.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, correctIndex, btnElement) {
    if (els.quizFeedback.textContent !== "") return; // Prevent multiple clicks

    const options = document.querySelectorAll('.quiz-option');

    if (selectedIndex === correctIndex) {
        btnElement.classList.add('correct');
        score++;
        els.scoreVal.textContent = score;
        els.quizFeedback.textContent = "✅ Correct! Great job!";
        els.quizFeedback.style.color = "#2ecc71";
    } else {
        btnElement.classList.add('wrong');
        options[correctIndex].classList.add('correct'); // Show correct answer
        els.quizFeedback.textContent = "❌ Oops! Nice try.";
        els.quizFeedback.style.color = "#ff6b6b";
    }

    // Disable all options
    options.forEach(opt => opt.style.pointerEvents = 'none');

    els.btnNextQ.classList.remove('hidden');
}

function nextQuestion() {
    currentQ++;
    loadQuestion();
}

// --- Antigravity Physics Engine ---
let physicsLoop;
let elements = [];

function togglePhysics() {
    state.antigravity = !state.antigravity;

    if (state.antigravity) {
        enablePhysics();
        els.btnGravity.textContent = "🛑 Reset Gravity";
        els.btnGravity.style.background = "#ff6b6b";
    } else {
        disablePhysics();
        els.btnGravity.textContent = "🚫⚖️";
        els.btnGravity.style.background = "";
    }
}

function enablePhysics() {
    // Select all floating candidates
    const cards = document.querySelectorAll('.stat-card, .planet-card, header, .input-section, footer');
    elements = [];

    cards.forEach(el => {
        const rect = el.getBoundingClientRect();

        // Create physics object
        const obj = {
            el: el,
            x: rect.left,
            y: rect.top,
            vx: (Math.random() - 0.5) * 4, // Random velocity X
            vy: (Math.random() - 0.5) * 4, // Random velocity Y
            width: rect.width,
            height: rect.height,
            rot: 0,
            vRot: (Math.random() - 0.5) * 2
        };

        // Fix position to absolute so we can move it
        el.style.position = 'fixed';
        el.style.left = obj.x + 'px';
        el.style.top = obj.y + 'px';
        el.style.margin = 0;
        el.style.zIndex = 1000;
        el.classList.add('physics-enabled');

        elements.push(obj);
    });

    physicsLoop = requestAnimationFrame(updatePhysics);
}

function disablePhysics() {
    cancelAnimationFrame(physicsLoop);
    // Reload page to reset layout cleanly (simplest way to restore complex grid flow)
    location.reload();
}

function updatePhysics() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    elements.forEach(obj => {
        // Update position
        obj.x += obj.vx;
        obj.y += obj.vy;
        obj.rot += obj.vRot;

        // Wall collisions (bounce)
        if (obj.x <= 0 || obj.x + obj.width >= w) {
            obj.vx *= -1;
            obj.x = Math.max(0, Math.min(obj.x, w - obj.width));
        }
        if (obj.y <= 0 || obj.y + obj.height >= h) {
            obj.vy *= -1;
            obj.y = Math.max(0, Math.min(obj.y, h - obj.height));
        }

        // Apply visual
        obj.el.style.left = obj.x + 'px';
        obj.el.style.top = obj.y + 'px';
        obj.el.style.transform = `rotate(${obj.rot}deg)`;
    });

    if (state.antigravity) {
        physicsLoop = requestAnimationFrame(updatePhysics);
    }
}
