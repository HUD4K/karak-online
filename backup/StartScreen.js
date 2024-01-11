class StartScreen {
    constructor(onStartCallback) {
        this.onStartCallback = onStartCallback;
        this.createStartScreen();
    }

    createStartScreen() {
        // Vytvorenie a štýlovanie elementu pre štartovaciu obrazovku
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


        // Kontajner pre textové polia a tlačidlo
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'flex-start';

        // Vytvorenie textových polí pre mená hráčov
        this.playerNameInputs = [];
        for (let i = 0; i < 5; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Hráč ${i + 1}`;
            input.style.margin = '5px 0'; // Zväčšenie medzery medzi poliami
            input.style.width = '200px'; // Väčšia šírka textového poľa
            input.style.fontSize = '16px'; // Väčšie písmo
            // Prípadné ďalšie štýly
            this.playerNameInputs.push(input);
            container.appendChild(input);
        }

        this.startScreenDiv.appendChild(container);
  
        // Vytvorenie a štýlovanie tlačidla START
        this.startButton = document.createElement('button');
        this.startButton.textContent = 'START';
        this.startScreenDiv.insertBefore(this.startButton, this.startScreenDiv.firstChild)
        this.startButton.style.marginLeft = '10px';

        container.appendChild(this.startButton);

        // Pridanie celej štartovacej obrazovky do tela dokumentu
        document.body.appendChild(this.startScreenDiv);
    
        // Nastavenie udalosti pre kliknutie na tlačidlo
        this.startButton.addEventListener('click', () => {
            const playerNames = this.playerNameInputs
            .map(input => input.value.trim())
            .filter(name => name.length > 0);

            this.hideStartScreen();
            if (this.onStartCallback) {
            this.onStartCallback(playerNames);  // Exportovanie mien hráčov
            }
        });
    }
  
    hideStartScreen() {
      // Skrytie štartovacej obrazovky
      this.startScreenDiv.style.display = 'none';
    }
  }

  export default StartScreen; // Export triedy

