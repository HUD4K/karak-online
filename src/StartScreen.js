class StartScreen {
    constructor(onStartCallback) {
        this.onStartCallback = onStartCallback;
        this.createStartScreen();
    }

    createStartScreen() {
        // Create start screen div
        this.startScreenDiv = document.createElement('div');
        this.startScreenDiv.style.position = 'fixed';
        this.startScreenDiv.style.top = '0';
        this.startScreenDiv.style.left = '0';
        this.startScreenDiv.style.width = '100vw';
        this.startScreenDiv.style.height = '100vh';
        this.startScreenDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        this.startScreenDiv.style.display = 'flex';
        this.startScreenDiv.style.justifyContent = 'center';
        this.startScreenDiv.style.alignItems = 'center';
        this.startScreenDiv.style.zIndex = '1000';

        const headingText = document.createElement('p');
        headingText.textContent = 'Add 2-5 players (by writing their names) to start the game';
        headingText.style.color = 'white';
        headingText.style.fontSize = '24px';
        headingText.style.textAlign = 'center';
        headingText.style.width = '100%';
        headingText.style.marginTop = '20px';
    
    
        // container for text fields and start button
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'flex-start';

        container.appendChild(headingText);

        // text field for player names
        this.playerNameInputs = [];
        for (let i = 0; i < 5; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Hráč ${i + 1}`;
            input.style.margin = '5px 0';
            input.style.width = '200px';
            input.style.fontSize = '16px';
            
            input.addEventListener('input', () => this.updateStartButtonState());
            this.playerNameInputs.push(input);
            container.appendChild(input);
        }

        this.startScreenDiv.appendChild(container);
  
        // Start button
        this.startButton = document.createElement('button');
        this.startButton.textContent = 'START';
        this.startScreenDiv.insertBefore(this.startButton, this.startScreenDiv.firstChild)
        this.startButton.style.marginLeft = '10px';

        container.appendChild(this.startButton);

        this.updateStartButtonState();

        // start screen added to the body
        document.body.appendChild(this.startScreenDiv);
    
        // Event for start button
        this.startButton.addEventListener('click', () => {
            const playerNames = this.playerNameInputs.map(input => input.value.trim()).filter(name => name.length > 0);
            this.playerNames = playerNames; // Save names to class property
            this.hideStartScreen();
            if (this.onStartCallback) {
                this.onStartCallback(playerNames);  // Exporting player names
            }
        });
    }

    updateStartButtonState() {
        // Check if at least 2 player names are filled
        const filledInputs = this.playerNameInputs.filter(input => input.value.trim().length > 0);
        this.startButton.disabled = filledInputs.length < 2;
    }
  
    hideStartScreen() {
      this.startScreenDiv.style.display = 'none';
    }
  }

  export default StartScreen;

