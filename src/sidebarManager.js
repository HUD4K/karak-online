import { characterProperties } from './characterProperties.js';

export class SidebarManager {
    constructor() {
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

    createCharacterCard(playerName, characterName) {
      const character = characterProperties[characterName];
      const imagePath = character.avatarImage;

      const container = document.createElement('div');
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
      const squareNames = ['W1', 'W2', 'S1', 'S2', 'S3', 'K'];
      squareNames.forEach((name, index) => {
        const square = document.createElement('div');
        square.style.width = '50px';
        square.style.height = '50px';
        square.style.backgroundColor = 'green';
        square.style.display = 'flex';
        square.style.alignItems = 'center';
        square.style.justifyContent = 'center';
        square.style.color = 'gold';
        square.textContent = name;
        square.id = `square-${index}`; // ID for each square
        rightPanel.appendChild(square);
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
      characters.forEach(character => {
          this.createCharacterCard(character.playerName, character.characterName);
      });
    }

    // Method for updating the content of the sidebar, if needed
    updateSidebarContent(content) {
      this._sidebar.innerHTML = content;
    }
  }
  