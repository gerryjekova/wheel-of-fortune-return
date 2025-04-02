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
const shortFinishSound = new Audio('sounds/nai-golemiq-pedal.mp3');

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

  // Добави този код към script1.js или combined-wheel.js

// Звукови ефекти
const popSound = new Audio('sounds/pop.mp3');
const clickSound = new Audio('sounds/click.mp3');

// Функция за възпроизвеждане на звук при кликване на бутон
function playButtonSound(sound) {
  // Спиране на звука ако вече се възпроизвежда
  sound.pause();
  sound.currentTime = 0;
  // Възпроизвеждане на звука
  sound.play().catch(error => {
    console.error('Грешка при възпроизвеждане на звука:', error);
  });
}

// Добавяне на звуков ефект към бутона за въртене
spinBtn.addEventListener('click', function() {
  playButtonSound(popSound);
  // Останалият код за въртене остава непроменен
});

// Добавяне на звуков ефект към бутоните на таймера
document.addEventListener('DOMContentLoaded', function() {
  // Бутони на таймера
  if (startTimerBtn) startTimerBtn.addEventListener('click', () => playButtonSound(clickSound));
  if (pauseTimerBtn) pauseTimerBtn.addEventListener('click', () => playButtonSound(clickSound));
  if (resetTimerBtn) resetTimerBtn.addEventListener('click', () => playButtonSound(clickSound));
  
  // Бутони за гласуване
  const voteButtons = document.querySelectorAll('.vote-btn, #add-truth, #add-dare, #select-winner, #reset-vote, #truth-tab, #dare-tab');
  voteButtons.forEach(button => {
    button.addEventListener('click', () => playButtonSound(clickSound));
  });
  
  // Добавяне на звук към динамично създадени бутони
  document.body.addEventListener('click', function(event) {
    // Проверка дали кликнатият елемент е бутон
    if (event.target.tagName === 'BUTTON' && !event.target.classList.contains('sound-added')) {
      playButtonSound(clickSound);
      event.target.classList.add('sound-added');
    }
  });
});
  
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

// Добави този код към script1.js или combined-wheel.js

// Интерактивни елементи
document.addEventListener('DOMContentLoaded', function() {
  // Звуци
  const popSound = new Audio('sounds/pop.mp3');
  const notificationSound = new Audio('sounds/notification.mp3');
  const subscribeSound = new Audio('sounds/subscribe.mp3');
  
  // Функция за възпроизвеждане на звуци
  function playSound(sound) {
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(error => console.error('Error playing sound:', error));
  }
  
  // 1. Клипове - видео плейър
  const clips = document.querySelectorAll('.clip');
  const videoModal = document.getElementById('video-modal');
  const videoPlayer = document.getElementById('video-player');
  const closeVideo = document.querySelector('.close-video');
  
  if (clips && videoModal && videoPlayer) {
    clips.forEach(clip => {
      clip.addEventListener('click', function() {
        const videoId = this.getAttribute('data-video');
        videoPlayer.innerHTML = `
          <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
          frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen></iframe>
        `;
        videoModal.style.display = 'flex';
        playSound(popSound);
      });
    });
    
    if (closeVideo) {
      closeVideo.addEventListener('click', function() {
        videoModal.style.display = 'none';
        videoPlayer.innerHTML = '';
        playSound(popSound);
      });
    }
    
    // Закриване на модала при клик извън съдържанието
    videoModal.addEventListener('click', function(event) {
      if (event.target === videoModal) {
        videoModal.style.display = 'none';
        videoPlayer.innerHTML = '';
        playSound(popSound);
      }
    });
  }
  
  // 2. Абонамент и гласуване
  const subscribeBtn = document.getElementById('subscribe-btn');
  const voteBtn = document.getElementById('vote-btn');
  const subCount = document.getElementById('sub-count');
  const pollOptions = document.querySelectorAll('.poll-option');
  
  if (subscribeBtn && subCount) {
    let subscribers = 1337;
    
    subscribeBtn.addEventListener('click', function() {
      subscribers++;
      subCount.textContent = subscribers.toLocaleString();
      showNotification('Благодаря за абонамента! <span style="color:#ff00c8">♥</span>');
      playSound(subscribeSound);
      
      // Анимация на бутона
      this.classList.add('subscribed');
      setTimeout(() => {
        this.classList.remove('subscribed');
      }, 1000);
    });
  }
  
  if (voteBtn && pollOptions) {
    voteBtn.addEventListener('click', function() {
      // Избор на случайна опция
      const randomOption = Math.floor(Math.random() * pollOptions.length);
      
      // Обновяване на проценти
      const newPercentages = generateRandomPercentages(pollOptions.length);
      
      pollOptions.forEach((option, index) => {
        const progressBar = option.querySelector('.option-progress');
        const percentage = option.querySelector('.option-percentage');
        
        // Анимирана промяна на лентата за напредък
        progressBar.style.transition = 'width 1s ease-in-out';
        progressBar.style.width = `${newPercentages[index]}%`;
        percentage.textContent = `${newPercentages[index]}%`;
      });
      
      showNotification('Благодаря за гласуването!');
      playSound(popSound);
    });
  }
  
  // 3. Стрелка към ElevenLabs бот
  const elevenLabsWidget = document.querySelector('elevenlabs-convai');
  const arrowContainer = document.querySelector('.arrow-container');
  
  if (elevenLabsWidget && arrowContainer) {
    // Позициониране на стрелката към бота
    function positionArrow() {
      const botElement = document.querySelector('.convaiButton');
      if (botElement) {
        const botRect = botElement.getBoundingClientRect();
        arrowContainer.style.position = 'absolute';
        arrowContainer.style.bottom = '80px';
        arrowContainer.style.right = '20px';
      }
    }
    
    // Проверка за ботa на всеки 500ms докато не се зареди
    const arrowInterval = setInterval(() => {
      const botElement = document.querySelector('.convaiButton');
      if (botElement) {
        clearInterval(arrowInterval);
        positionArrow();
        
        // Изчезване на стрелката след клик върху бота
        botElement.addEventListener('click', function() {
          arrowContainer.style.display = 'none';
        });
      }
    }, 500);
    
    // Актуализиране на позицията при промяна на размера на прозореца
    window.addEventListener('resize', positionArrow);
  }
  
  // 4. Система за уведомления
  function showNotification(message) {
    const notificationElement = document.getElementById('notification-message');
    if (notificationElement) {
      notificationElement.innerHTML = message;
      notificationSound.play().catch(error => console.error('Error playing notification sound:', error));
      
      // Визуален ефект на банера
      const banner = document.querySelector('.notification-banner');
      if (banner) {
        banner.classList.add('highlight');
        setTimeout(() => {
          banner.classList.remove('highlight');
        }, 2000);
      }
    }
  }
  
  // 5. Промени в съобщенията на банера на всеки 15 секунди
  const notificationMessages = [
    'Абонирай се за да получиш достъп до ексклузивни емотикони!',
    'Ново видео всеки вторник и четвъртък!',
    'Последвай ме в социалните мрежи за новини и ъпдейти!',
    'Пиши в чата за да участваш в следващото предизвикателство!',
    'Не забравяй да натиснеш звънчето за известия!'
  ];
  
  let messageIndex = 0;
  setInterval(() => {
    const notificationElement = document.getElementById('notification-message');
    if (notificationElement) {
      messageIndex = (messageIndex + 1) % notificationMessages.length;
      notificationElement.textContent = notificationMessages[messageIndex];
    }
  }, 15000);
  
  // Помощни функции
  function generateRandomPercentages(count) {
    // Генериране на случайни числа, сумата на които е 100
    let percentages = [];
    let remaining = 100;
    
    for (let i = 0; i < count - 1; i++) {
      const max = remaining - (count - i - 1);
      const value = i === 0 ? Math.floor(Math.random() * (max - 10)) + 10 : Math.floor(Math.random() * max);
      percentages.push(value);
      remaining -= value;
    }
    
    percentages.push(remaining);
    return percentages;
  }
});

// Добавяне на CSS за подсветка на уведомленията
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');
  style.textContent = `
    .notification-banner.highlight {
      background: rgba(255, 0, 200, 0.4) !important;
      transform: scale(1.05);
      transition: all 0.3s ease;
    }
    
    .subscribed {
      transform: scale(1.1) !important;
      background: linear-gradient(45deg, #00ff00, #3b80ff) !important;
    }
  `;
  document.head.appendChild(style);
});

// Този код добавя допълнителна интеграция с ElevenLabs бота
// Добави го в края на script1.js или combined-wheel.js

// ElevenLabs бот интеграция
document.addEventListener('DOMContentLoaded', function() {
  // Проверка за наличие на ElevenLabs бот
  const checkForBot = setInterval(() => {
    const botElement = document.querySelector('elevenlabs-convai');
    const convaiButton = document.querySelector('.convaiButton');
    
    if (botElement && convaiButton) {
      clearInterval(checkForBot);
      setupBotIntegration(botElement, convaiButton);
    }
  }, 500);

  function setupBotIntegration(botElement, convaiButton) {
    // 1. Добавяне на забавни реплики, които ботът може да каже
    const funnyPhrases = [
      "Здрасти! Нуждаеш се от помощ или просто искаш да си говорим?",
      "Кажи нещо интересно! Скучно ми е!",
      "Знаеш ли, че мога да имитирам гласове? Опитай ме!",
      "Попитай ме нещо забавно!",
      "Хей, аз съм тук за да те забавлявам между предизвикателствата!",
      "Харесваш ли ми гласа? Мога да говоря и с други!"
    ];

    // 2. Стилизиране на бота с забавен вид
    const style = document.createElement('style');
    style.textContent = `
      .convaiButton {
        animation: pulse-border 2s infinite !important;
        transition: all 0.3s ease !important;
      }
      
      .convaiButton:hover {
        transform: scale(1.1) !important;
      }
      
      @keyframes pulse-border {
        0% {
          box-shadow: 0 0 0 0 rgba(255, 0, 200, 0.7) !important;
        }
        70% {
          box-shadow: 0 0 0 10px rgba(255, 0, 200, 0) !important;
        }
        100% {
          box-shadow: 0 0 0 0 rgba(255, 0, 200, 0) !important;
        }
      }
      
      .convaiButton::after {
        content: '🎙️ Говори с мен!';
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 0, 200, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 14px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }
      
      .convaiButton:hover::after {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);

    // 3. Интеграция с колелото - когато колелото спира, ботът може да каже нещо забавно
    function getRandomPhrase() {
      return funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)];
    }

    // 4. Подготовка за интеграция с API на ElevenLabs (ако има такъв)
    // Това е примерен код, който трябва да се адаптира според документацията им
    function triggerBotMessage(message) {
      // Проверка дали съществува метод за програмно изпращане на съобщения
      // Ако няма такъв метод, може да се използва визуално подсещане
      const botContainer = document.querySelector('.convaiButton');
      
      if (botContainer) {
        // Визуално подсещане
        const notification = document.createElement('div');
        notification.className = 'bot-notification';
        notification.textContent = message;
        notification.style.cssText = `
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 0, 200, 0.8);
          color: white;
          padding: 8px 15px;
          border-radius: 5px;
          font-size: 14px;
          white-space: nowrap;
          z-index: 1000;
          animation: fade-in-out 4s forwards;
        `;
        
        const keyframes = `
          @keyframes fade-in-out {
            0% { opacity: 0; top: -40px; }
            10% { opacity: 1; top: -60px; }
            80% { opacity: 1; top: -60px; }
            100% { opacity: 0; top: -40px; }
          }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = keyframes;
        document.head.appendChild(styleElement);
        
        botContainer.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
          styleElement.remove();
        }, 4000);
      }
    }

    // 5. Слушател за събития от колелото
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) {
      let wheelStopListener = null;
      
      spinBtn.addEventListener('click', function() {
        // Изчистване на предишния слушател, ако има такъв
        if (wheelStopListener) {
          document.removeEventListener('wheelStop', wheelStopListener);
        }
        
        // Създаване на нов слушател
        wheelStopListener = function() {
          // Малко забавяне, за да може първо да се покаже предизвикателството
          setTimeout(() => {
            triggerBotMessage(getRandomPhrase());
          }, 2000);
        };
        
        // Добавяне на нов слушател за събитието "wheelStop"
        document.addEventListener('wheelStop', wheelStopListener, { once: true });
      });
      
      // Промяна на valueGenerator функцията за да включва събитие при спиране
      const originalValueGenerator = window.valueGenerator;
      window.valueGenerator = function(angleValue) {
        // Извикване на оригиналната функция
        if (originalValueGenerator) {
          originalValueGenerator(angleValue);
        }
        
        // Генериране на събитие за спиране на колелото
        const wheelStopEvent = new CustomEvent('wheelStop');
        document.dispatchEvent(wheelStopEvent);
      };
    }
    
    // 6. Интеграция с гласуването
    const voteBtn = document.getElementById('vote-btn');
    if (voteBtn) {
      voteBtn.addEventListener('click', function() {
        setTimeout(() => {
          triggerBotMessage("Благодаря за гласуването! Мнението ти е важно!");
        }, 500);
      });
    }
    
    // 7. Интеграция с абонамента
    const subscribeBtn = document.getElementById('subscribe-btn');
    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', function() {
        setTimeout(() => {
          triggerBotMessage("Уау! Благодаря за абонамента! Ти си най-добрият!");
        }, 500);
      });
    }
  }
});

// ЕТО ТОЗИ КОД ПРАВИ БУКВАЛНО ВСИЧКИ БУТОНИ В СТРАНИЦАТА ДА ИЗДАВАТ ЗВУК
// КОПИРАЙ ГО В НАЧАЛОТО НА ТВОЯ SCRIPT1.JS ИЛИ COMBINED-WHEEL.JS ФАЙЛ

document.addEventListener('DOMContentLoaded', function() {
  // Зареждане на звуците
  const popSound = new Audio('sounds/pop.mp3');
  const clickSound = new Audio('sounds/click.mp3');
  
  // Функция за възпроизвеждане на звук
  function playButtonSound(sound) {
    // Спиране на звука ако вече се възпроизвежда
    sound.pause();
    sound.currentTime = 0;
    // Възпроизвеждане на звука
    sound.play().catch(error => {
      console.error('Грешка при възпроизвеждане на звука:', error);
    });
  }
  
  // БУКВАЛНО СЛАГАМ ЗВУК НА ВСЕКИ БУТОН В HTML ДОКУМЕНТА
  function addSoundsToAllButtons() {
    // Вземи ВСИЧКИ бутони на страницата
    const allButtons = document.querySelectorAll('button');
    
    // Добави звуци към ВСЕКИ ЕДИН бутон
    allButtons.forEach(button => {
      // Провери дали бутонът вече има звуков ефект
      if (!button.classList.contains('sound-added')) {
        // Добави звук на бутона за въртене
        if (button.id === 'spin-btn') {
          button.addEventListener('click', function() {
            playButtonSound(popSound);
          });
        } 
        // Добави звук на всички други бутони
        else {
          button.addEventListener('click', function() {
            playButtonSound(clickSound);
          });
        }
        
        // Маркирай бутона, че вече има звук
        button.classList.add('sound-added');
      }
    });
    
    console.log('Звуци добавени към ВСИЧКИ бутони!');
  }
  
  // Изпълни функцията веднага
  addSoundsToAllButtons();
  
  // Добави слушател за динамично добавени бутони (например от гласуването)
  // Това ще хване ВСЕКИ нов бутон, който се добавя след зареждане на страницата
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(function(node) {
          // Проверка за нови бутони
          if (node.nodeType === 1) {
            if (node.tagName === 'BUTTON' && !node.classList.contains('sound-added')) {
              // Добави звук към новия бутон
              node.addEventListener('click', function() {
                playButtonSound(clickSound);
              });
              node.classList.add('sound-added');
            }
            
            // Проверка за бутони вътре в добавения възел
            const buttonsInNode = node.querySelectorAll('button:not(.sound-added)');
            if (buttonsInNode.length) {
              buttonsInNode.forEach(button => {
                button.addEventListener('click', function() {
                  playButtonSound(clickSound);
                });
                button.classList.add('sound-added');
              });
            }
          }
        });
      }
    });
  });
  
  // Наблюдавай целия документ за промени
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Добави звуци отново след 1 секунда, за да хване всички закъснели бутони
  setTimeout(addSoundsToAllButtons, 1000);
  // И отново след 3 секунди
  setTimeout(addSoundsToAllButtons, 3000);
});