const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");

// Redefine rotation values for a 14-section wheel
const rotationValues = [];
for (let i = 0; i < 14; i++) {
  rotationValues.push({
    minDegree: i * 18,
    maxDegree: (i + 1) * 18 - 1,
    value: i + 1
  });
}

// Define data for 14 equally sized sections
const data = new Array(14).fill(1);  // All sections are equally likely

// Define background colors for each piece
const pieColors = [];
for (let i = 0; i < 14; i++) {
  pieColors.push(i % 2 === 0 ? "#8b35bc" : "#b163da");
}

// Create the chart
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

// Update showModal to use fetched data
const showModal = (value) => {
  const modal = document.getElementById("myModal");
  const headline = document.getElementById("modal-headline");
  const image = document.getElementById("modal-image");

  // Find the challenge by its number
  const challenge = challengeData.find(challenge => challenge.number === value);

  if (challenge) {
    headline.innerText = challenge.challenge; // Set the headline text
    image.src = `${challenge.image}`;  // Set the correct image path
    image.alt = challenge.challenge;         // Optional: set alt text
  } else {
    headline.innerText = "Challenge not found";
    image.src = ""; // Clear the image if challenge not found
    image.alt = "";
  }

  // Display the modal
  modal.style.display = "block";

  // Close modal on click
  const closeBtn = document.getElementsByClassName("close")[0];
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };
  window.onclick = function (event) {
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

  let randomIndex = Math.floor(Math.random() * 14); // Random section
  let randomDegree = rotationValues[randomIndex].minDegree + 8; // Center of the section
  let arrowOffset = 90; // Align middle-right with the arrow
  let finalRotation = 360 * 5 + (arrowOffset - randomDegree); // 5 full rotations + alignment

  // Apply rotation using CSS keyframes
  wheel.style.setProperty("--final-rotation", `${finalRotation}deg`);
  wheel.style.animation = "rotate 4s ease-out";

  // After animation ends, display the result value and freeze the wheel
  setTimeout(() => {
    // Display the result value
    const resultValue = randomIndex + 1; // Result index +1 (1-based numbering)
    finalValue.innerHTML = `<p>Value: ${resultValue}</p>`;

    // Freeze the wheel by setting the final rotation directly
    wheel.style.animation = ""; // Stop the animation
    wheel.style.transform = `rotate(${finalRotation % 360}deg)`; // Apply the final rotation directly

    // Wait 2 seconds before showing the modal
    setTimeout(() => {
      showModal(resultValue); // Show the modal
      spinBtn.disabled = false;
    }, 1400); // 2-second delay for the modal
  }, 4000); // Match the animation duration
});


