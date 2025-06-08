// Inject CSS styles
const styles = `
  #game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    font-family: Arial, sans-serif;
    background-color: #f8f9fa;
    height: 100%;
    text-align: center;
    box-sizing: border-box;
    padding: 20px;
  }
  h1 { color: #333; }
  #score { font-size: 1.5rem; margin: 10px; }
  #pps { font-size: 1rem; color: #555; margin-bottom: 20px; }
  button { background-color: #007bff; color: white; border: none; padding: 10px 20px; margin: 5px; border-radius: 5px; cursor: pointer; font-size: 1rem; }
  button:hover { background-color: #0056b3; }
  #click-button { background-color: #28a745; }
  #click-button:hover { background-color: #218838; }
  .upgrades { display: flex; flex-direction: column; align-items: center; }
  .upgrade { border: 1px solid #ccc; padding: 10px; margin: 5px; width: 220px; border-radius: 5px; background-color: #fff; }
  .upgrade-name { font-weight: bold; }
  .upgrade-details { font-size: 0.9rem; margin: 5px 0; color: #333; }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Main game logic
const container = document.getElementById('game-container');
let score = 0;
let pps = 0; // points per second
const upgrades = [
  { name: 'Helper', baseCost: 10, cost: 10, increment: 1, count: 0 },
  { name: 'Robot', baseCost: 100, cost: 100, increment: 5, count: 0 }
];

if (container) {
  // Create title and displays
  const title = document.createElement('h1');
  title.textContent = 'Vanilla JS Clicker Game';

  const scoreDisplay = document.createElement('p');
  scoreDisplay.id = 'score';
  scoreDisplay.textContent = 'Points: 0';

  const ppsDisplay = document.createElement('p');
  ppsDisplay.id = 'pps';
  ppsDisplay.textContent = 'Points per second: 0';

  // Create main click button
  const clickButton = document.createElement('button');
  clickButton.id = 'click-button';
  clickButton.textContent = 'Click Me!';

  // Create upgrade section
  const upgradesContainer = document.createElement('div');
  upgradesContainer.className = 'upgrades';

  upgrades.forEach((upgrade, index) => {
    const upgradeDiv = document.createElement('div');
    upgradeDiv.className = 'upgrade';

    const nameEl = document.createElement('div');
    nameEl.className = 'upgrade-name';
    nameEl.textContent = upgrade.name;

    const detailsEl = document.createElement('div');
    detailsEl.className = 'upgrade-details';
    detailsEl.textContent = `Cost: ${upgrade.cost} | Owned: ${upgrade.count}`;

    const buyButton = document.createElement('button');
    buyButton.textContent = `Buy ${upgrade.name}`;
    buyButton.addEventListener('click', () => {
      if (score >= upgrade.cost) {
        score -= upgrade.cost;
        upgrade.count++;
        pps += upgrade.increment;
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count));
        updateDisplays();
        if (typeof window.sendDataToGameLab === 'function') {
          window.sendDataToGameLab({
            event: 'buy',
            upgrade: upgrade.name,
            count: upgrade.count,
            newScore: score,
            pps,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    upgradeDiv.appendChild(nameEl);
    upgradeDiv.appendChild(detailsEl);
    upgradeDiv.appendChild(buyButton);
    upgradesContainer.appendChild(upgradeDiv);
  });

  // Append all elements to container
  container.appendChild(title);
  container.appendChild(scoreDisplay);
  container.appendChild(ppsDisplay);
  container.appendChild(clickButton);
  container.appendChild(upgradesContainer);

  // Click event handler
  clickButton.addEventListener('click', () => {
    score++;
    updateDisplays();
    if (typeof window.sendDataToGameLab === 'function') {
      window.sendDataToGameLab({
        event: 'click',
        newScore: score,
        pps,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Update display helper
  function updateDisplays() {
    scoreDisplay.textContent = 'Points: ' + score;
    ppsDisplay.textContent = 'Points per second: ' + pps;
    upgrades.forEach((upgrade, i) => {
      const upgradeDiv = upgradesContainer.children[i];
      const details = upgradeDiv.querySelector('.upgrade-details');
      details.textContent = `Cost: ${upgrade.cost} | Owned: ${upgrade.count}`;
    });
  }

  // Auto-increment loop
  setInterval(() => {
    if (pps > 0) {
      score += pps;
      updateDisplays();
      if (typeof window.sendDataToGameLab === 'function') {
        window.sendDataToGameLab({
          event: 'autoClick',
          added: pps,
          newScore: score,
          pps,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, 1000);
}