import { characterProperties } from './characterProperties.js';

export class SidebarManager {
  constructor(gameContext) {
    this.gameContext = gameContext; // Uloženie referencie na KarakGameFlow
    this._sidebar = this._createSidebar();
  }
  
    _createSidebar() {
      const sidebar = document.createElement('div');
      sidebar.style.position = 'absolute';
      sidebar.style.left = '0';
      sidebar.style.top = '0';
      sidebar.style.width = '20%';
      sidebar.style.height = '100%';
      sidebar.style.backgroundColor = '#800000';
      document.body.appendChild(sidebar);
      return sidebar;
    }

    createCharacterCard(playerName, characterName, playerId) {
      const character = characterProperties[characterName];
      const imagePath = character.avatarImage;

      const container = document.createElement('div');
      container.classList.add('player-card');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.width = '100%';
      container.style.backgroundImage = "url('../textures/specials/card_texture.png')";
      container.style.border = '2px solid black';
      this._sidebar.appendChild(container);

      const contentContainer = document.createElement('div');
      contentContainer.style.display = 'flex';
      contentContainer.style.flexDirection = 'row';
      container.appendChild(contentContainer);
  
      // left panel
      const leftPanel = document.createElement('div');
      leftPanel.style.flex = '1';
      leftPanel.style.display = 'flex';
      leftPanel.style.flexDirection = 'column';
      leftPanel.style.justifyContent = 'center';
      leftPanel.style.alignItems = 'center';
      contentContainer.appendChild(leftPanel);
  
      // Text 1 and Text 2
      const textElement1 = document.createElement('div');
      textElement1.textContent = playerName;
      textElement1.style.color = 'gold';
      leftPanel.appendChild(textElement1);
  
      const textElement2 = document.createElement('div');
      textElement2.textContent = characterName;
      textElement2.style.color = 'gold';
      leftPanel.appendChild(textElement2);
  
      // Avatar
      const avatar = document.createElement('div');
      avatar.style.width = '60px';
      avatar.style.height = '60px';      
      avatar.style.borderRadius = '50%';
      avatar.style.overflow = 'hidden';
      avatar.style.border = '2px solid black';
      avatar.style.backgroundImage = `url('${imagePath}')`;
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      avatar.id = 'avatar';
      leftPanel.appendChild(avatar);
  
      // Right panel
      const rightPanel = document.createElement('div');
      rightPanel.style.flex = '1';
      rightPanel.style.display = 'grid';
      rightPanel.style.gridTemplateColumns = '1fr 1fr 1fr'; // 3 columns
      rightPanel.style.gridGap = '5px';
      rightPanel.style.padding = '5px';
      contentContainer.appendChild(rightPanel);
  
      // Creating 6 squares
      const inventoryItems = ['W1', 'W2', 'S1', 'S2', 'S3', 'K']; // Identifikátory pre inventárne sloty
      inventoryItems.forEach((item) => {
        const itemElement = document.createElement('div');
        itemElement.textContent = item;
        itemElement.addEventListener('click', () => {
            // Priamy prístup k aktuálnym dátam hráča cez gameContext
            const player = this.gameContext.players.find(p => p.userData.id === playerId);
            if (player) {
                console.log(`Klikol si na "${item}" hráča s id ${playerId} a menom ${player.userData.playerName}, s postavou ${player.userData.characterName}, ktorý má počet životov: ${player.userData.lives} a počet pohybov: ${player.userData.moves}.`);
            } else {
                console.log("Hráč nenájdený."); // Pre prípad, že by sa hráč nenašiel
            }
        });
        itemElement.style.width = '50px';
        itemElement.style.height = '50px';
        itemElement.style.backgroundColor = 'green';
        itemElement.style.display = 'flex';
        itemElement.style.alignItems = 'center';
        itemElement.style.justifyContent = 'center';
        itemElement.style.color = 'gold';
        itemElement.textContent = item;
        rightPanel.appendChild(itemElement);
      });

      const healthCircleContainer = document.createElement('div');
      healthCircleContainer.style.display = 'flex';
      healthCircleContainer.style.justifyContent = 'space-around';
      healthCircleContainer.style.alignItems = 'center';
      healthCircleContainer.style.width = '100%';
      healthCircleContainer.style.marginTop = '3px';
      healthCircleContainer.style.marginBottom = '3px';
  
      container.appendChild(healthCircleContainer);
  
      for (let i = 0; i < 5; i++) {
          const healthCircle = document.createElement('div');
          healthCircle.style.width = '10px';
          healthCircle.style.height = '10px';
          healthCircle.style.borderRadius = '50%'; // circle
          healthCircle.style.border = '1px solid black';
          healthCircle.style.backgroundImage = "url('../textures/specials/life_token_front.jpg')";
          healthCircle.style.backgroundSize = 'cover';
          healthCircle.style.backgroundPosition = 'center';
          healthCircle.id = `healthCircle-${i}`; // ID for each circle
  
          healthCircleContainer.appendChild(healthCircle);
      }
    }

    createMultipleCharacterCards(characters) {
      characters.forEach((character, index) => {
          // Predpokladáme, že index + 1 je ID hráča
          this.createCharacterCard(character.playerName, character.characterName, index + 1);
      });
  }

    // Method for updating the content of the sidebar, if needed
    updateSidebarContent(content) {
      this._sidebar.innerHTML = content;
    }
  }
  