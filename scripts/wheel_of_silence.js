let silenceChallenges = []; // Array to store challenges
let currentLanguage = 'en'; // Default language for headers

// Fetch silence challenges from JSON
const fetchSilenceChallenges = async () => {
  try {
    const response = await fetch('silence_challenges.json');
    silenceChallenges = await response.json();
    console.log('Silence Challenges Loaded:', silenceChallenges); // Debug
  } catch (error) {
    console.error('Failed to fetch silence challenges:', error);
  }
};

// Display modal with challenge header
const showModal = (value) => {
  const modal = document.getElementById('myModal');
  const headline = document.getElementById('modal-headline');
  const closeBtn = document.getElementsByClassName('close')[0];

  // Find the challenge by number
  const challenge = silenceChallenges.find((c) => c.number === value);

  if (challenge) {
    headline.innerText = challenge.challenge; // Display challenge header
  } else {
    headline.innerText = 'Challenge not found';
  }

  // Show modal
  modal.style.display = 'block';

  // Close modal
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
};

// Initialize the wheel
const initWheel = () => {
  const wheel = document.getElementById('wheel');
  const spinBtn = document.getElementById('spin-btn');
  const finalValue = document.getElementById('final-value');

  // Wheel data
  const rotationValues = silenceChallenges.map((_, index) => ({
    minDegree: index * (360 / silenceChallenges.length),
    maxDegree: (index + 1) * (360 / silenceChallenges.length) - 1,
    value: index + 1,
  }));

  // Spin logic
  spinBtn.addEventListener('click', () => {
    spinBtn.disabled = true;
    finalValue.innerHTML = `<p>Spinning...</p>`;
    const randomIndex = Math.floor(Math.random() * silenceChallenges.length);
    const selectedValue = silenceChallenges[randomIndex].number;

    // Simulate spinning and display modal
    setTimeout(() => {
      finalValue.innerHTML = `<p>${silenceChallenges[randomIndex].challenge}</p>`;
      showModal(selectedValue);
      spinBtn.disabled = false;
    }, 2000);
  });
};

// Load challenges and initialize the wheel on page load
document.addEventListener('DOMContentLoaded', async () => {
  await fetchSilenceChallenges();
  initWheel();
});
