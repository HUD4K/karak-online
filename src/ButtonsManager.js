
class ButtonsManager {
    constructor(gameFlowContext) {
      this.gameFlowContext = gameFlowContext; // Save reference to main class of game
      this._rotateButton = null;
      this._okButton = null;
  
      this.initializeButtons();
    }
  
    initializeButtons() {
      // rotate button
      this._rotateButton = document.createElement('button');
      this._rotateButton.style.position = 'absolute';
      this._rotateButton.style.width = '40px'; 
      this._rotateButton.style.height = '40px';
      this._rotateButton.style.backgroundImage = 'url("../textures/buttons/rotateButton.jpg")';
      this._rotateButton.style.backgroundSize = 'cover';
      this._rotateButton.style.borderRadius = '50%';
      this._rotateButton.style.display = 'none'; // Preset to hide
      this._rotateButton.style.filter = 'brightness(1)';
      document.body.appendChild(this._rotateButton);
    
      // OK button
      this._okButton = document.createElement('button');
      this._okButton.style.position = 'absolute';
      this._okButton.style.width = '40px';
      this._okButton.style.height = '40px';
      this._okButton.style.backgroundImage = 'url("../textures/buttons/placeButton.jpg")';
      this._okButton.style.backgroundSize = 'cover';
      this._okButton.style.borderRadius = '50%';
      this._okButton.style.display = 'none';
      this._okButton.style.filter = 'brightness(1)';
      document.body.appendChild(this._okButton);
  
  
      this._rotateButton.addEventListener('mouseover', () => {
        if (!this._rotateButton.disabled) {
          this._rotateButton.style.filter = 'brightness(1.2)';
        }
      });
      
      this._rotateButton.addEventListener('mouseout', () => {
        if (!this._rotateButton.disabled) {
          this._rotateButton.style.filter = 'brightness(1)';
        }
      });
      
      this._okButton.addEventListener('mouseover', () => {
        if (!this._okButton.disabled) {
          this._okButton.style.filter = 'brightness(1.2)';
        }
      });
      
      this._okButton.addEventListener('mouseout', () => {
        if (!this._okButton.disabled) {
          this._okButton.style.filter = 'brightness(1)';
        }
      });
    }
    
    setupButtonEventListeners() {
      this._rotateButton.addEventListener('click', (event) => {
        event.stopPropagation();
        this.gameFlowContext._rotateCurrentCard();
      });
  
      this._okButton.addEventListener('click', (event) => {
        event.stopPropagation();
        this.hideButtonsAndReset();
      });
    }
  
    showButtons(x, y) {
      this._rotateButton.style.left = `${x}px`;
      this._rotateButton.style.top = `${y}px`;
      this._rotateButton.style.display = 'block';
  
      this._okButton.style.left = `${x + 50}px`;
      this._okButton.style.top = `${y}px`;
      this._okButton.style.display = 'block';
    }
  
    hideButtons() {
      if (this._rotateButton) {
        this._rotateButton.style.display = 'none';
      }
      if (this._okButton) {
        this._okButton.style.display = 'none';
      }
      this.gameFlowContext.isCardBeingPlaced = false;
    }
  
    hideButtonsAndReset() {
      this.hideButtons();
      if (this.gameFlowContext.currentCard) {
        //this.gameFlowContext.currentCard.position.y = 0.16;
        this.gameFlowContext.currentCard = null;
      }
    }
  
    enableRotateButton() {
      if (this._rotateButton) {
        this._rotateButton.disabled = false;
        this._rotateButton.style.filter = 'brightness(1)';
      }
    }
  
    disableRotateButton() {
      if (this._rotateButton) {
        this._rotateButton.disabled = true;
        this._rotateButton.style.filter = 'brightness(0.5)';
      }
    }
  
    enableOkButton() {
      if (this._okButton) {
        this._okButton.disabled = false;
        this._okButton.style.filter = 'brightness(1)';
      }
    }
  
    disableOkButton() {
      if (this._okButton) {
        this._okButton.disabled = true;
        this._okButton.style.filter = 'brightness(0.5)';
      }
    }
  
    setOkButtonOnClick(handler) {
      if (this._okButton) {
        this._okButton.onclick = handler;
      }
    }
  
    clearOkButtonOnClick() {
      if (this._okButton) {
        this._okButton.onclick = null;
      }
    }
  
    isOkButtonDisabled() {
      return this._okButton ? this._okButton.disabled : false;
    }
  
  }

export default ButtonsManager;