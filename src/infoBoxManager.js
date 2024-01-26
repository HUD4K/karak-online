export class InfoBoxManager {
    constructor() {
      this._infoBox = this._createInfoBox();
    }
  
    _createInfoBox() {
      const infoBox = document.createElement('div');
      infoBox.style.position = 'absolute';
      infoBox.style.top = '10px';
      infoBox.style.right = '10px';
      infoBox.style.color = 'white';
      infoBox.style.backgroundColor = 'black';
      document.body.appendChild(infoBox);
      return infoBox;
    }
  
    updateGameInfo(players, currentPlayerId, currentSquare, totalCardsPlaced, totalRedCardsPlaced) {
      let infoText = '';
  
      // Player info
      players.forEach(player => {
        infoText += `Player ${player.userData.id}: ${player.userData.dimensionI}, ${player.userData.dimensionJ}, Moves: ${player.userData.moves}<br>`;
      });
  
      // Who is on turn
      infoText += `On turn: ${currentPlayerId}<br>`;
  
      
      // Card info
      if (currentSquare) {
        for (const [key, value] of Object.entries(currentSquare.userData)) {
          infoText += `${key}: ${value}<br>`;
        }
      }
  
      

      // Card count info
      infoText += `Card count: ${totalCardsPlaced}<br>`;
      infoText += `Red card count: ${totalRedCardsPlaced}`;
  
      this._infoBox.innerHTML = infoText;
    }
  }
  