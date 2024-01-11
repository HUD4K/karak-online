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
  
      // Informácie o hráčoch
      players.forEach(player => {
        infoText += `Player ${player.userData.id}: ${player.userData.suradnicaI}, ${player.userData.suradnicaJ}, Moves: ${player.userData.moves}<br>`;
      });
  
      // Informácie o tom, ktorý hráč je na rade
      infoText += `Hráč na rade: ${currentPlayerId}<br>`;
  
      // Informácie o karte
      if (currentSquare) {
        for (const [key, value] of Object.entries(currentSquare.userData)) {
          infoText += `${key}: ${value}<br>`;
        }
      }
  
      // Informácie o počte položených kariet
      infoText += `Počet kariet: ${totalCardsPlaced}<br>`;
      infoText += `Počet červených kariet: ${totalRedCardsPlaced}`;
  
      this._infoBox.innerHTML = infoText;
    }
  }
  