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

const distractions = [
    {desc: 'SMS od znajomego', energy: 0, focus: -5, extraHour: 1},
    {desc: 'Scrollowanie telefonu', energy: -5, focus: -10, extraHour: 0},
];

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
    } catch (e) {
        return;
    }
    updateStatsDisplay();
    updateTimeDisplay();
    updateTaskList();
}

window.onload = () => {
    updateStatsDisplay();
    updateTimeDisplay();
    updateTaskList();
};
