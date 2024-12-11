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


let currentLanguage = 'bg'; // Default language is Bulgarian

// Handle language toggle
document.getElementById('btn-bulgarian').addEventListener('click', () => {
  currentLanguage = 'bg';
  updateLanguageButtons();
});

document.getElementById('btn-english').addEventListener('click', () => {
  currentLanguage = 'en';
  updateLanguageButtons();
});

function updateLanguageButtons() {
  document.getElementById('btn-bulgarian').classList.toggle('active', currentLanguage === 'bg');
  document.getElementById('btn-english').classList.toggle('active', currentLanguage === 'en');
}

// Show modal with the correct language
const showModal = (value) => {
  const modal = document.getElementById("myModal");
  const headline = document.getElementById("modal-headline");
  const image = document.getElementById("modal-image");

  const challenge = challengeData.find(challenge => challenge.number === value);

  if (challenge) {
    headline.innerText = challenge.challenge[currentLanguage];
    image.src = `assets/${challenge.image}`;
    image.alt = challenge.challenge[currentLanguage];
  } else {
    headline.innerText = "Challenge not found";
    image.src = "";
    image.alt = "";
  }

  modal.style.display = "block";

  const closeBtn = document.getElementsByClassName("close")[0];
  closeBtn.onclick = () => (modal.style.display = "none");
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
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

  
  // Update valueGenerator function to call showModal
  const valueGenerator = (angleValue) => {
    for (let i of rotationValues) {
      if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
        finalValue.innerHTML = `<p>Value: ${i.value}</p>`;
        showModal(i.value);
        spinBtn.disabled = false;
        break;
      }
    }
  };
  
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


