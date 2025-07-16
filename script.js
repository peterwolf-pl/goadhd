// Stan gracza
const playerState = {
    energy: 100,
    mood: 50,
    focus: 50,
};

// Czas gry
let currentHour = 8;
const days = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
let currentDayIndex = 0;
let tasksCompletedToday = 0;

// Lokacje i zadania
let currentLocation = 'Centrum miasta';
const tasks = [
    {name: 'Zakupy', location: 'Centrum miasta', duration: 2, energyCost: 10, moodEffect: 5, focusEffect: -5},
    {name: 'Praca w ogrodzie', location: 'Wieś', duration: 3, energyCost: 15, moodEffect: 10, focusEffect: -10},
    {name: 'Łowienie ryb', location: 'Port', duration: 4, energyCost: 20, moodEffect: 15, focusEffect: 5},
];

// ----------------- Zadanie wieloetapowe -----------------
// Przykładowy quest składający się z kilku etapów
const currentQuest = {
    title: 'Zbuduj karmnik',
    stages: [
        { desc: 'Znajdź materiały', done: false, mood: 5, focus: -5 },
        { desc: 'Złóż konstrukcję', done: false, mood: -5, focus: -10 },
        { desc: 'Zawieś karmnik', done: false, mood: 10, focus: 0 },
    ],
    currentStage: 0,
};

// Postaci niezależne i ich relacje z graczem
const npcs = {
    // Przykładowy sąsiad z neutralnym nastawieniem
    neighbor: { name: 'Sąsiad', relation: 50, mood: 'neutralny' }
};

const distractions = [
    {desc: 'SMS od znajomego', energy: 0, focus: -5, extraHour: 1},
    {desc: 'Scrollowanie telefonu', energy: -5, focus: -10, extraHour: 0},
];

// Aktualizacja widoku zadania wieloetapowego
function updateQuestDisplay() {
    const title = document.getElementById('questTitle');
    const list = document.getElementById('questStages');
    const progress = document.getElementById('questProgress');
    const status = document.getElementById('questStatus');

    title.innerText = currentQuest.title;
    list.innerHTML = '';
    currentQuest.stages.forEach((stage, idx) => {
        const li = document.createElement('li');
        li.innerText = stage.desc;
        if (stage.done) li.style.textDecoration = 'line-through';
        list.appendChild(li);
    });

    const doneCount = currentQuest.stages.filter(s => s.done).length;
    progress.max = currentQuest.stages.length;
    progress.value = doneCount;
    status.innerText = `${doneCount}/${currentQuest.stages.length} etapy ukończone`;

    document.getElementById('stageBtn').disabled = currentQuest.currentStage >= currentQuest.stages.length;
}

// Wykonanie bieżącego etapu
function doCurrentStage() {
    if (currentQuest.currentStage >= currentQuest.stages.length) return;

    const stage = currentQuest.stages[currentQuest.currentStage];
    stage.done = true;
    currentQuest.currentStage++;

    // Modyfikacja statystyk gracza zgodnie z etapem
    playerState.mood += stage.mood;
    playerState.focus += stage.focus;

    if (currentQuest.currentStage >= currentQuest.stages.length) {
        document.getElementById('questStatus').innerText = 'Zadanie ukończone!';
    }

    updateStatsDisplay();
    updateQuestDisplay();
}

function updateStatsDisplay() {
    document.getElementById('energy').innerText = playerState.energy;
    document.getElementById('mood').innerText = playerState.mood;
    document.getElementById('focus').innerText = playerState.focus;
}

function updateTimeDisplay() {
    document.getElementById('time').innerText = `${days[currentDayIndex]} ${currentHour}:00`;
}

function updateTaskList() {
    const content = document.getElementById('content');
    const locationTasks = tasks.filter(t => t.location === currentLocation);
    if (locationTasks.length === 0) {
        content.innerText = 'Brak zadań w tej lokacji.';
        return;
    }
    const list = document.createElement('ul');
    locationTasks.forEach((t, idx) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.innerText = t.name;
        btn.onclick = () => doTask(tasks.indexOf(t));
        li.appendChild(btn);
        list.appendChild(li);
    });
    content.innerHTML = '';
    content.appendChild(list);
}

function changeLocation(loc) {
    currentLocation = loc;
    updateTaskList();
}

function showNotification(msg) {
    const n = document.getElementById('notification');
    n.innerText = msg;
    n.style.display = 'block';
    setTimeout(() => n.style.display = 'none', 3000);
}

function doTask(index) {
    const task = tasks[index];
    playerState.energy -= task.energyCost;
    playerState.mood += task.moodEffect;
    playerState.focus += task.focusEffect;
    let duration = task.duration;

    if (Math.random() < 0.2) {
        const d = distractions[Math.floor(Math.random() * distractions.length)];
        playerState.energy += d.energy;
        playerState.focus += d.focus;
        duration += d.extraHour;
        document.getElementById('content').innerText = `Rozproszenie: ${d.desc}`;
        showNotification('Masz nową wiadomość');
    } else {
        document.getElementById('content').innerText = `Zadanie ${task.name} ukończone.`;
    }

    currentHour += duration;
    tasksCompletedToday++;
    if (currentHour > 23) {
        currentHour = currentHour % 24;
        currentDayIndex = (currentDayIndex + 1) % days.length;
        tasksCompletedToday = 0;
    }

    if (tasksCompletedToday >= 3) {
        showNotification('Zrobione!');
        tasksCompletedToday = 0;
    }

    updateStatsDisplay();
    updateTimeDisplay();
    updateTaskList();
}

function saveGame() {
    const gameState = {
        location: currentLocation,
        playerState,
        currentHour,
        currentDayIndex,
        npcs,
        currentQuest,
    };
    localStorage.setItem('ADHDGameState', JSON.stringify(gameState));
}

function loadGame() {
    const data = localStorage.getItem('ADHDGameState');
    if (!data) return;
    try {
        const game = JSON.parse(data);
        currentLocation = game.location;
        playerState.energy = game.playerState.energy;
        playerState.mood = game.playerState.mood;
        playerState.focus = game.playerState.focus;
        currentHour = game.currentHour;
        currentDayIndex = game.currentDayIndex;
        if (game.npcs) Object.assign(npcs, game.npcs); // przywróć relacje NPC
        if (game.currentQuest) Object.assign(currentQuest, game.currentQuest);
    } catch (e) {
        return;
    }
    updateStatsDisplay();
    updateTimeDisplay();
    updateTaskList();
    updateQuestDisplay();
}

// ----------------- Rozmowy z NPC -----------------

// Funkcja rozpoczynająca dialog z podaną postacią
function startDialogue(npcKey) {
    const npc = npcs[npcKey];
    const div = document.getElementById('npcDialogue');
    // Początkowa wypowiedź NPC
    div.innerHTML = `<p>${npc.name}: Cześć, co słychać?</p>`;

    // Przyciski odpowiedzi
    const polite = document.createElement('button');
    polite.innerText = '👋 Uprzejma odpowiedź';
    polite.onclick = () => respondToNpc(npcKey, true);

    const rude = document.createElement('button');
    rude.innerText = '😠 Opryskliwa odpowiedź';
    rude.onclick = () => respondToNpc(npcKey, false);

    div.appendChild(polite);
    div.appendChild(rude);
}

// Reakcja na odpowiedź gracza
function respondToNpc(npcKey, polite) {
    const npc = npcs[npcKey];
    const div = document.getElementById('npcDialogue');
    if (polite) {
        npc.relation += 10;
        playerState.mood += 5; // lepszy nastrój gracza
        div.innerHTML = `<p>${npc.name}: Miło mi z Tobą rozmawiać!</p>`;
    } else {
        npc.relation -= 10;
        playerState.mood -= 5;
        div.innerHTML = `<p>${npc.name}: Nie podoba mi się Twój ton...</p>`;
    }

    // Aktualizacja opisu nastawienia
    if (npc.relation > 70) {
        npc.mood = 'przyjacielski';
    } else if (npc.relation < 30) {
        npc.mood = 'wrogi';
    } else {
        npc.mood = 'neutralny';
    }

    div.innerHTML += `<p>Poziom relacji: ${npc.relation} (${npc.mood})</p>`;

    const again = document.createElement('button');
    again.innerText = 'Zakończ rozmowę';
    again.onclick = () => {
        div.innerHTML = '';
    };
    div.appendChild(again);

    updateStatsDisplay();
}

window.onload = () => {
    updateStatsDisplay();
    updateTimeDisplay();
    updateTaskList();
    updateQuestDisplay();
};
