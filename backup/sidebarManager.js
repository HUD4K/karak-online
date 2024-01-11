import { cardProperties } from './characterProperties.js';

export class SidebarManager {
    constructor() {
      this._sidebar = this._createSidebar();
    }
  
    _createSidebar() {
      const sidebar = document.createElement('div');
      sidebar.style.position = 'absolute';
      sidebar.style.left = '0';
      sidebar.style.top = '0';
      sidebar.style.width = '20%'; // Približne 1/5 šírky obrazovky
      sidebar.style.height = '100%'; // Celá výška obrazovky
      sidebar.style.backgroundColor = '#800000'; // Bordová farba
      document.body.appendChild(sidebar);
      return sidebar;
    }

    createCharacterCard(playerName, characterName) {
      const character = cardProperties[characterName];
      const imagePath = character.avatarImage;

      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.width = '100%'; // Orámovaný obdĺžnik bude vypĺňať celú šírku sidebaru
      container.style.backgroundImage = "url('../textures/specials/card_texture.png')";
      container.style.border = '2px solid black'; // Orámovanie obdĺžnika
      this._sidebar.appendChild(container);

      const contentContainer = document.createElement('div'); // Nový kontajner pre hlavný obsah
      contentContainer.style.display = 'flex';
      contentContainer.style.flexDirection = 'row'; // Pôvodná štruktúra
      container.appendChild(contentContainer);
  
      // Ľavý panel pre text a avatar
      const leftPanel = document.createElement('div');
      leftPanel.style.flex = '1';
      leftPanel.style.display = 'flex';
      leftPanel.style.flexDirection = 'column';
      leftPanel.style.justifyContent = 'center';
      leftPanel.style.alignItems = 'center';
      contentContainer.appendChild(leftPanel);
  
      // Text 1 a Text 2
      const textElement1 = document.createElement('div');
      textElement1.textContent = playerName;
      leftPanel.appendChild(textElement1);
  
      const textElement2 = document.createElement('div');
      textElement2.textContent = characterName;
      leftPanel.appendChild(textElement2);
  
      // Avatar
      const avatar = document.createElement('div');
      avatar.style.width = '60px'; // veľkosť avatara
      avatar.style.height = '60px';      
      avatar.style.borderRadius = '50%'; // Kruhový tvar
      avatar.style.overflow = 'hidden'; // Rezanie obrázka do kruhu
      avatar.style.border = '2px solid black'; // Orámovanie avatara
      avatar.style.backgroundImage = `url('${imagePath}')`; // Nastavenie obrázka avatara
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      avatar.id = 'avatar'; // Identifikátor pre avatar
      leftPanel.appendChild(avatar);
  
      // Pravý panel pre štvorce
      const rightPanel = document.createElement('div');
      rightPanel.style.flex = '1';
      rightPanel.style.display = 'grid';
      rightPanel.style.gridTemplateColumns = '1fr 1fr 1fr'; // Dva stĺpce
      rightPanel.style.gridGap = '5px'; // Medzera medzi štvorcami
      rightPanel.style.padding = '5px'; // Padding v pravom paneli
      contentContainer.appendChild(rightPanel);
  
      // Vytvorenie šiestich štvorcov
      const squareNames = ['W1', 'W2', 'S1', 'S2', 'K', 'T'];
      squareNames.forEach((name, index) => {
        const square = document.createElement('div');
        square.style.width = '50px'; // Šírka štvorca
        square.style.height = '50px'; // Výška štvorca
        square.style.backgroundColor = 'green'; // Zelená farba
        square.style.display = 'flex';
        square.style.alignItems = 'center';
        square.style.justifyContent = 'center';
        square.textContent = name;
        square.id = `square-${index}`; // Jedinečný identifikátor pre každý štvorec
        rightPanel.appendChild(square);
      });

      const healthCircleContainer = document.createElement('div');
      healthCircleContainer.style.display = 'flex';
      healthCircleContainer.style.justifyContent = 'space-around'; // Rozloženie kruhov rovnomerne
      healthCircleContainer.style.alignItems = 'center';
      healthCircleContainer.style.width = '100%'; // Šírka cez celú kartu
      healthCircleContainer.style.marginTop = '3px';
      healthCircleContainer.style.marginBottom = '3px';
  
      container.appendChild(healthCircleContainer);
  
      for (let i = 0; i < 5; i++) {
          const healthCircle = document.createElement('div');
          healthCircle.style.width = '10px'; // Priemer kruhu
          healthCircle.style.height = '10px';
          healthCircle.style.borderRadius = '50%'; // Kruhový tvar
          healthCircle.style.border = '1px solid black'; // Orámovanie kruhu
          healthCircle.style.backgroundImage = "url('../textures/specials/life_token_front.jpg')"; // Obrázok v kruhu
          healthCircle.style.backgroundSize = 'cover';
          healthCircle.style.backgroundPosition = 'center';
          healthCircle.id = `healthCircle-${i}`; // Jedinečný identifikátor pre každý kruh
  
          healthCircleContainer.appendChild(healthCircle);
      }
    }

    createMultipleCharacterCards(characters) {
      characters.forEach(character => {
          this.createCharacterCard(character.playerName, character.characterName);
      });
  }

    // Metóda na aktualizáciu obsahu sidebaru, ak je to potrebné
    updateSidebarContent(content) {
      this._sidebar.innerHTML = content;
    }
  }
  