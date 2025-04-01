// Променете началото на JavaScript файла с този код:

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");

// Предефиниране на стойностите на въртене за колело с 14 секции
const rotationValues = [];
// За 14 секции, всяка секция е с размер 360/14 = 25.7 градуса приблизително
const sectionSize = 360 / 14;
for (let i = 0; i < 14; i++) {
  rotationValues.push({
    minDegree: i * sectionSize,
    maxDegree: (i + 1) * sectionSize - 1,
    value: i + 1
  });
}

// Данни за 14 равни секции
const data = new Array(14).fill(1);  // Всички секции са еднакво вероятни

// Дефиниране на фонови цветове за всяка част
const pieColors = [];
for (let i = 0; i < 14; i++) {
  pieColors.push(i % 2 === 0 ? "#8b35bc" : "#b163da");
}

// Създаване на диаграмата
let myChart = new Chart(wheel, {
  plugins: [ChartDataLabels],
  type: "pie",
  data: {
    labels: Array.from({ length: 14 }, (_, i) => i + 1),
    datasets: [{ backgroundColor: pieColors, data: data }]
  },
  options: {
    responsive: true,
    animation: { duration: 0 },
    plugins: {
      tooltip: false,
      legend: { display: false },
      datalabels: {
        color: "#ffffff",
        formatter: (_, context) => context.chart.data.labels[context.dataIndex],
        font: { size: 18 }
      }
    }
  }
});

let challengeData = [];

// Function to fetch challenge data from JSON file
async function fetchChallenges() {
  try {
    const response = await fetch('data/challenges.json');
    challengeData = await response.json();
  } catch (error) {
    console.error("Failed to fetch challenges:", error);
  }
}

// Call fetchChallenges on page load
document.addEventListener("DOMContentLoaded", fetchChallenges);

// Функция за показване на предизвикателството в секцията вместо в модален прозорец
const showChallenge = (value) => {
  const challengeSection = document.getElementById("challenge-section");
  const headline = document.getElementById("challenge-headline");
  const image = document.getElementById("challenge-image");

  // Намиране на предизвикателството по номера му
  const challenge = challengeData.find(challenge => challenge.number === value);

  if (challenge) {
    headline.innerText = challenge.challenge;
    image.src = `${challenge.image}`;
    image.alt = challenge.challenge;
    
    // Показване на секцията с предизвикателството
    challengeSection.style.display = "block";
    
    // Настройка на таймера според предизвикателството
    setupTimer(value);
  } else {
    headline.innerText = "Предизвикателството не е намерено";
    image.src = "";
    image.alt = "";
    
    // Скриване на таймера, ако няма предизвикателство
    timerContainer.style.display = 'none';
  }
};

// Актуализирана функция valueGenerator
const valueGenerator = (angleValue) => {
  for (let i of rotationValues) {
    if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
      finalValue.innerHTML = `<p>Стойност: ${i.value}</p>`;
      showChallenge(i.value);
      spinBtn.disabled = false;
      break;
    }
  }
};

fetch('data/challenges.json')
  .then(response => response.json())
  .then(data => console.log(data));

fetch('data/challenges.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
    // additional logic to use the data
  })
  .catch(error => console.error('Error fetching challenges:', error));
  
// Spin logic
let count = 0;
let resultValue = 101;
spinBtn.addEventListener("click", () => {
  spinBtn.disabled = true;
  finalValue.innerHTML = `<p>Good Luck!</p>`;
  let randomDegree = Math.floor(Math.random() * 360);
  let rotationInterval = setInterval(() => {
    myChart.options.rotation += resultValue;
    myChart.update();
    if (myChart.options.rotation >= 360) {
      count += 1;
      resultValue -= 5;
      myChart.options.rotation = 0;
    } else if (count > 15 && myChart.options.rotation === randomDegree) {
      valueGenerator(randomDegree);
      clearInterval(rotationInterval);
      count = 0;
      resultValue = 101;
    }
  }, 10);
});

// Звукови файлове
const tickSound = new Audio('sounds/tick.mp3');
const finishSound = new Audio('sounds/finish.mp3');
const shortFinishSound = new Audio('sounds/short-finish.mp3');

// Променливи за таймера
let timer;
let timerRunning = false;
let totalSeconds = 0;
let originalSeconds = 0;
let isMultiTimer = false;
let multiTimerCount = 0;
let maxMultiTimers = 10;

// Извличане на елементите за таймера
const timerContainer = document.getElementById('timer-container');
const timerDisplay = document.getElementById('timer-display');
const timerTitle = document.getElementById('timer-title');
const startTimerBtn = document.getElementById('start-timer');
const pauseTimerBtn = document.getElementById('pause-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const multiTimerInfo = document.getElementById('multi-timer-info');
const timerCountDisplay = document.getElementById('timer-count');

// Функция за конвертиране на секунди в mm:ss формат
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Функция за старт на таймера
function startTimer() {
  if (!timerRunning) {
    timerRunning = true;
    timer = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds--;
        timerDisplay.textContent = formatTime(totalSeconds);
        
        // Пускане на тиктакащ звук на всеки 5 секунди
        if (totalSeconds % 5 === 0 && totalSeconds > 0) {
          tickSound.play();
        }
        
        // Когато таймерът достигне 0
        if (totalSeconds === 0) {
          clearInterval(timer);
          timerRunning = false;
          
          if (isMultiTimer && multiTimerCount < maxMultiTimers) {
            // Пускане на краткия звуков сигнал за 1-минутния таймер
            shortFinishSound.play();
            
            // Увеличаване на брояча и актуализиране на дисплея
            multiTimerCount++;
            timerCountDisplay.textContent = `Таймер: ${multiTimerCount + 1}/${maxMultiTimers}`;
            
            // Ако все още не сме достигнали максимума, стартирайте следващия таймер
            if (multiTimerCount < maxMultiTimers) {
              totalSeconds = 60; // 1 минута за всеки от 10-те таймера за рисуване
              startTimer();
            } else {
              // Достигнахме максималния брой таймери
              finishSound.play();
              multiTimerInfo.style.display = 'none';
              timerTitle.textContent = 'Всички таймери завършени!';
            }
          } else {
            // Пускане на финалния звуков сигнал за обикновения таймер
            finishSound.play();
            timerTitle.textContent = 'Времето изтече!';
          }
        }
      }
    }, 1000);
  }
}

// Функция за пауза на таймера
function pauseTimer() {
  clearInterval(timer);
  timerRunning = false;
}

// Функция за рестартиране на таймера
function resetTimer() {
  clearInterval(timer);
  timerRunning = false;
  totalSeconds = originalSeconds;
  timerDisplay.textContent = formatTime(totalSeconds);
  timerTitle.textContent = 'Време:';
  
  if (isMultiTimer) {
    multiTimerCount = 0;
    timerCountDisplay.textContent = `Таймер: 1/${maxMultiTimers}`;
  }
}

// Добавяне на слушатели за събитията за бутоните на таймера
startTimerBtn.addEventListener('click', startTimer);
pauseTimerBtn.addEventListener('click', pauseTimer);
resetTimerBtn.addEventListener('click', resetTimer);

// Функция за настройка на таймера според предизвикателството
function setupTimer(challengeNumber) {
  // Показване на контейнера на таймера
  timerContainer.style.display = 'block';
  
  // Рестартиране на всички таймер променливи
  clearInterval(timer);
  timerRunning = false;
  multiTimerCount = 0;
  
  // Настройка според номера на предизвикателството
  // Предизвикателство #3 е "Бързи Рисунки с Теми от Чата" с 10 таймера по 1 минута
  if (challengeNumber === 3) {
    isMultiTimer = true;
    totalSeconds = 60; // 1 минута
    originalSeconds = totalSeconds;
    timerTitle.textContent = 'Време за рисуване:';
    multiTimerInfo.style.display = 'block';
    timerCountDisplay.textContent = `Таймер: 1/${maxMultiTimers}`;
  } else {
    // Всички други предизвикателства използват 10-минутен таймер
    isMultiTimer = false;
    totalSeconds = 600; // 10 минути
    originalSeconds = totalSeconds;
    timerTitle.textContent = 'Време за предизвикателство:';
    multiTimerInfo.style.display = 'none';
  }
  
  // Актуализиране на дисплея на таймера
  timerDisplay.textContent = formatTime(totalSeconds);
}

// JavaScript за системата за гласуване
// Добави това в края на script1.js

// Актуализирай функцията setupTimer за да добави логика за истина или предизвикателство
function setupTimer(challengeNumber) {
  // Скриване на контейнерите за гласуване по подразбиране
  if (document.getElementById('vote-container')) {
    document.getElementById('vote-container').style.display = 'none';
  }
  
  // Показване на контейнера на таймера
  timerContainer.style.display = 'block';
  
  // Рестартиране на всички таймер променливи
  clearInterval(timer);
  timerRunning = false;
  multiTimerCount = 0;
  
  // Настройка според номера на предизвикателството
  if (challengeNumber === 2) {
    // 60-секундни рисунки с теми от чата - 10 мин
    isMultiTimer = true;
    totalSeconds = 60; // 1 минута
    originalSeconds = totalSeconds;
    timerTitle.textContent = 'Време за рисуване:';
    multiTimerInfo.style.display = 'block';
    timerCountDisplay.textContent = `Таймер: 1/10`;
    maxMultiTimers = 10;
  } else if (challengeNumber === 4 || challengeNumber === 9) {
    // Истина или предизвикателство - показване на системата за гласуване
    if (document.getElementById('vote-container')) {
      document.getElementById('vote-container').style.display = 'block';
      timerContainer.style.display = 'none'; // Скриване на таймера
    }
  } else if (challengeNumber === 12) {
    // Мисля рандом рап песни - 5 мин
    isMultiTimer = false;
    totalSeconds = 300; // 5 минути
    originalSeconds = totalSeconds;
    timerTitle.textContent = 'Време за рап:';
    multiTimerInfo.style.display = 'none';
  } else if (challengeNumber === 15) {
    // Караоке - 3 мин
    isMultiTimer = false;
    totalSeconds = 180; // 3 минути
    originalSeconds = totalSeconds;
    timerTitle.textContent = 'Време за караоке:';
    multiTimerInfo.style.display = 'none';
  } else if (challengeNumber === 17) {
    // Имитирай случаен акцент - 5 мин
    isMultiTimer = false;
    totalSeconds = 300; // 5 минути
    originalSeconds = totalSeconds;
    timerTitle.textContent = 'Време за акцент:';
    multiTimerInfo.style.display = 'none';
  } else if (challengeNumber === 5 || challengeNumber === 11 || challengeNumber === 13 || challengeNumber === 16 || challengeNumber === 18) {
    // Предизвикателства без таймер
    timerContainer.style.display = 'none';
  } else {
    // Всички други предизвикателства използват 10-минутен таймер
    isMultiTimer = false;
    totalSeconds = 600; // 10 минути
    originalSeconds = totalSeconds;
    timerTitle.textContent = 'Време за предизвикателство:';
    multiTimerInfo.style.display = 'none';
  }
  
  // Актуализиране на дисплея на таймера
  timerDisplay.textContent = formatTime(totalSeconds);
}

// Заменете кода за инициализиране на системата за гласуване с този:

// Инициализиране на системата за гласуване при зареждане на страницата
document.addEventListener('DOMContentLoaded', function() {
  // Проверка дали HTML елементите за гласуване съществуват
  if (!document.getElementById('vote-container')) return;
  
  const truthTab = document.getElementById('truth-tab');
  const dareTab = document.getElementById('dare-tab');
  const truthPanel = document.getElementById('truth-panel');
  const darePanel = document.getElementById('dare-panel');
  const addTruthBtn = document.getElementById('add-truth');
  const addDareBtn = document.getElementById('add-dare');
  const newTruthInput = document.getElementById('new-truth');
  const newDareInput = document.getElementById('new-dare');
  const truthOptions = document.getElementById('truth-options');
  const dareOptions = document.getElementById('dare-options');
  const selectWinnerBtn = document.getElementById('select-winner');
  const resetVoteBtn = document.getElementById('reset-vote');
  
  // Масиви за съхранение на опциите
  let truthsList = [];
  let daresList = [];
  
  // Смяна между таб панелите
  truthTab.addEventListener('click', function() {
    truthTab.classList.add('active');
    dareTab.classList.remove('active');
    truthPanel.style.display = 'block';
    darePanel.style.display = 'none';
  });
  
  dareTab.addEventListener('click', function() {
    dareTab.classList.add('active');
    truthTab.classList.remove('active');
    darePanel.style.display = 'block';
    truthPanel.style.display = 'none';
  });
  
  // Добавяне на нова истина
  addTruthBtn.addEventListener('click', function() {
    const text = newTruthInput.value.trim();
    if (text) {
      addTruthOption(text);
      newTruthInput.value = '';
    }
  });
  
  // Добавяне на ново предизвикателство
  addDareBtn.addEventListener('click', function() {
    const text = newDareInput.value.trim();
    if (text) {
      addDareOption(text);
      newDareInput.value = '';
    }
  });
  
  // Enter клавиш за инпут полетата
  newTruthInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addTruthBtn.click();
    }
  });
  
  newDareInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addDareBtn.click();
    }
  });
  
  // Функция за добавяне на опция за истина
  function addTruthOption(text) {
    const id = 'truth-' + Date.now();
    const option = {
      id: id,
      text: text,
      votes: 0
    };
    
    truthsList.push(option);
    renderTruthOptions();
  }
  
  // Функция за добавяне на опция за предизвикателство
  function addDareOption(text) {
    const id = 'dare-' + Date.now();
    const option = {
      id: id,
      text: text,
      votes: 0
    };
    
    daresList.push(option);
    renderDareOptions();
  }
  
  // Рендериране на опциите за истина
  function renderTruthOptions() {
    truthOptions.innerHTML = '';
    truthsList.forEach(option => {
      const optionEl = document.createElement('div');
      optionEl.className = 'option-item';
      if (option.winner) {
        optionEl.classList.add('winner');
      }
      
      optionEl.innerHTML = `
        <span class="option-text">${option.text}</span>
        <span class="vote-count">${option.votes}</span>
        <button class="vote-btn" data-id="${option.id}">+1</button>
      `;
      
      truthOptions.appendChild(optionEl);
    });
    
    // Добавяне на event listeners за бутоните за гласуване
    truthOptions.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-id');
        const option = truthsList.find(o => o.id === id);
        if (option) {
          option.votes++;
          renderTruthOptions();
        }
      });
    });
  }
  
  // Рендериране на опциите за предизвикателство
  function renderDareOptions() {
    dareOptions.innerHTML = '';
    daresList.forEach(option => {
      const optionEl = document.createElement('div');
      optionEl.className = 'option-item';
      if (option.winner) {
        optionEl.classList.add('winner');
      }
      
      optionEl.innerHTML = `
        <span class="option-text">${option.text}</span>
        <span class="vote-count">${option.votes}</span>
        <button class="vote-btn" data-id="${option.id}">+1</button>
      `;
      
      dareOptions.appendChild(optionEl);
    });
    
    // Добавяне на event listeners за бутоните за гласуване
    dareOptions.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-id');
        const option = daresList.find(o => o.id === id);
        if (option) {
          option.votes++;
          renderDareOptions();
        }
      });
    });
  }
  
  // Избор на победител
  selectWinnerBtn.addEventListener('click', function() {
    if (truthPanel.style.display !== 'none') {
      // Избор на победител от истините
      if (truthsList.length > 0) {
        truthsList.forEach(option => option.winner = false);
        const winner = truthsList.reduce((prev, current) => 
          (prev.votes > current.votes) ? prev : current
        );
        winner.winner = true;
        renderTruthOptions();
      }
    } else {
      // Избор на победител от предизвикателствата
      if (daresList.length > 0) {
        daresList.forEach(option => option.winner = false);
        const winner = daresList.reduce((prev, current) => 
          (prev.votes > current.votes) ? prev : current
        );
        winner.winner = true;
        renderDareOptions();
      }
    }
  });
  
  // Изчистване на всички опции
  resetVoteBtn.addEventListener('click', function() {
    truthsList = [];
    daresList = [];
    renderTruthOptions();
    renderDareOptions();
  });
  
  // Добавяне на примерни опции
  addTruthOption('Кое е най-неловкото нещо, което ти се е случвало на живо?');
  addTruthOption('Имаш ли тайни, които не си споделял/а с никого?');
  addTruthOption('Какво е най-лошото нещо, което си правил/а когато никой не те вижда?');
  
  addDareOption('Имитирай известна личност за 1 минута');
  addDareOption('Изпей припева на песента, която в момента е #1 в класациите');
  addDareOption('Танцувай с швейцарска пръчка за 30 секунди');
});