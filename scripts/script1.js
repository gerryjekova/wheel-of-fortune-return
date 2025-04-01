const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");

// Redefine rotation values for a 20-section wheel
const rotationValues = [];
for (let i = 0; i < 20; i++) {
  rotationValues.push({
    minDegree: i * 18,
    maxDegree: (i + 1) * 18 - 1,
    value: i + 1
  });
}

// Define data for 20 equally sized sections
const data = new Array(20).fill(1);  // All sections are equally likely

// Define background colors for each piece
const pieColors = [];
for (let i = 0; i < 20; i++) {
  pieColors.push(i % 2 === 0 ? "#8b35bc" : "#b163da");
}

// Create the chart
let myChart = new Chart(wheel, {
  plugins: [ChartDataLabels],
  type: "pie",
  data: {
    labels: Array.from({ length: 20 }, (_, i) => i + 1),
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