import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js';
import WorldInitializer from './worldInitializer.js';
import { InfoBoxManager } from './infoBoxManager.js';
import { cardProperties } from './cardProperties.js';
import { SidebarManager } from './sidebarManager.js';
import ButtonsManager from './ButtonsManager.js';
import StartScreen from './StartScreen.js';
import { characterProperties } from './characterProperties.js';
import { TilesFunctions } from './TilesFunctions.js';

console.log("      -_- ZAVRI DEV TOOLS CHUJU, EŠTE NEMÁM SSR -_- ");
console.log("       Serus Jožko");

class KarakGameFlow {
  constructor() {
    

    const startScreen = new StartScreen(playerNames => {
      this.initializeCharacters(playerNames);

      // Add event listener for mouse click after the start screen is closed
      window.addEventListener('click', (event) => this._onMouseClick(event), false);
    });

    this._worldInitializer = new WorldInitializer();
    const { renderer, camera, scene, controls } = this._worldInitializer.getWorldComponents();

    // initialized world components
    this._threejs = renderer;
    this._camera = camera;
    this._controls = controls;
    this._raycaster = this._worldInitializer.getRaycaster();
    this._mouse = this._worldInitializer.getMouseVector();

    this.totalCardsPlaced = 0,
    this.totalRedCardsPlaced = 0,
    this.isCardBeingPlaced = false,
    this.isRotating = false,
    this.currentPlayerId = 1,
    this.players = [],
    this.cardModel = null, // !
    this.infoBoxManager = new InfoBoxManager(),
    this.sidebarManager = new SidebarManager(),
    this.scene = scene

    this.buttonsManager = new ButtonsManager(this)


    this.tilesFunctions = new TilesFunctions(this);

    this.tilesFunctions._LoadCardModelOnce().then(model => {
      // save model and update state
      this.cardModel = model;
      this.tilesFunctions._AddInitialCard();  
    });
    
    
    this.buttonsManager.setupButtonEventListeners();
    this._Initialize();
  }

  _Initialize() {
    this._worldInitializer.LoadModel();
    this.tilesFunctions._createGrid();
  }

  getRandomCharacters(characterProperties, count) {
    const keys = Object.keys(characterProperties);
    const selectedKeys = [];

    while (selectedKeys.length < count) {
        const randomIndex = Math.floor(Math.random() * keys.length);
        const selectedKey = keys[randomIndex];
        if (!selectedKeys.includes(selectedKey)) {
            selectedKeys.push(selectedKey);
        }
    }

    return selectedKeys.map(key => ({ characterName: key, ...characterProperties[key] }));
  }

  initializeCharacters(playerNames) {
    // Random selection of n characters
    const selectedCharacters = this.getRandomCharacters(characterProperties, playerNames.length);

    // Combine player names with randomly selected characters
    const sampleCharacters = playerNames.map((name, index) => {
        return { playerName: name, characterName: selectedCharacters[index].characterName };
    });

    // setting up character offsets from the center of the card
    const offsets = [
        { x: -0.2, y: 0.2 },
        { x: 0.2, y: -0.2 },
        { x: 0.2, y: 0.2 },
        { x: -0.2, y: -0.2 },
        { x: 0.2, y: 0 }
    ];
    sampleCharacters.forEach((character, index) => {
        this._AddPlayer(character.characterName, index + 1, offsets[index]);
    });

    this.sidebarManager.createMultipleCharacterCards(sampleCharacters);
  }


  async _AddPlayer(characterName, id, offset) {
    const textureName = characterProperties[characterName].modelTexture;
    const defaultCoord = 0;
    const player = await this._LoadPlayerModel(textureName);
    const worldX = defaultCoord + offset.x;
    const worldZ = defaultCoord + offset.y;
    player.position.set(worldX, 0.15, worldZ);

    player.userData = {
        dimensionI: defaultCoord,
        dimensionJ: defaultCoord,
        id: id,
        offsetX: offset.x,
        offsetY: offset.y,
        moves: 4
    };

    this.scene.add(player);
    this.players.push(player);
}


  _LoadPlayerModel(textureName) {
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
  
    const characterTexture = textureLoader.load(textureName);
    
    return new Promise((resolve, reject) => {
      loader.load('../models3d/character.glb', (gltf) => {
        const player = gltf.scene;
  
        player.traverse((child) => {
          if (child.isMesh) {
            child.material.map = characterTexture;
            child.material.needsUpdate = true;
          }
        });
  
        resolve(player);
      }, undefined, reject);
    });
  }
 

  _findPlayerById(playerId) {
    return this.players.find(p => p.userData.id === playerId);
  }
  

  async _MovePlayerToPosition(playerId, newI, newJ) {
    const player = this._findPlayerById(playerId);
    if (player) {
      // Is new position different from the current one?
      if (player.userData.dimensionI === newI && player.userData.dimensionJ === newJ) {
          // If player is already on the target position, do nothing
          return;
      }
  
      const newWorldX = newI + player.userData.offsetX;
      const newWorldZ = newJ + player.userData.offsetY;
  
      await this._animatePlayerToPosition(player, newWorldX, newWorldZ);
  
      player.userData.dimensionI = newI;
      player.userData.dimensionJ = newJ;
      player.userData.moves--;
  
      if (player.userData.moves === 0) {
          this._changePlayer();
      }
  
      this.infoBoxManager.updateGameInfo(this.players, this.currentPlayerId, this.currentSquare, this.totalCardsPlaced, this.totalRedCardsPlaced);
    }
  }
  

  _animatePlayerToPosition(player, targetX, targetZ, duration = 400) {
    return new Promise((resolve) => {
      const startX = player.position.x;
      const startZ = player.position.z;
      const distanceX = targetX - startX;
      const distanceZ = targetZ - startZ;
  
      const startTime = performance.now();
  
      const animate = () => {
        const currentTime = performance.now();
        const progress = Math.min((currentTime - startTime) / duration, 1);
  
        player.position.x = startX + distanceX * progress;
        player.position.z = startZ + distanceZ * progress;
  
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
  
      animate();
    });
  }


  _changePlayer() {
    this.currentPlayerId = (this.currentPlayerId % this.players.length) + 1;
    const currentPlayer = this._findPlayerById(this.currentPlayerId);

    if (currentPlayer) {
        currentPlayer.userData.moves = 4; // Reset moves
        this.infoBoxManager.updateGameInfo(this.players, this.currentPlayerId, this.currentSquare, this.totalCardsPlaced, this.totalRedCardsPlaced);
    } else {
        console.error('Error: player with ID ' + this.currentPlayerId + ' does not exist.');
    }
}

  _setCardDirections(square, textureName) {
    const properties = cardProperties[textureName].properties;
    for (const prop in properties) {
      square.userData[prop] = properties[prop];
    }
  }

  async _addNewCard(intersectedObject) {
    this.isCardBeingPlaced = true;
  
    if (!this.cardModel) {
      console.error('Card model has not been loaded yet.');
      return;
    }
  
    const card = this.cardModel.clone();
  
    const selectedTexture = this.tilesFunctions._selectRandomTexture();
    if (!selectedTexture) {
      console.error('No more textures available');
      return;
    }
  
    const textureLoader = new THREE.TextureLoader();
    const cardTexture = textureLoader.load(`../textures/tiles/${selectedTexture}.jpg`);
  
    card.traverse((child) => {
      if (child.isMesh && child.material.name === 'topSurface') {
        // New material for each clone
        const newMaterial = new THREE.MeshStandardMaterial({
          map: cardTexture
        });
        child.material = newMaterial;
      }
    });
  
    card.position.set(intersectedObject.position.x, 10, intersectedObject.position.z);
    this.scene.add(card);
  
    await this.tilesFunctions._animateCardToPosition(card, 1, 600);
  
    this._setCardDirections(intersectedObject, selectedTexture);
    this.buttonsManager.showButtons(this._lastMouseX, this._lastMouseY);
  
    this._shakeScreen(200);
  
    // Not elegant, but works for now
    this.buttonsManager.setOkButtonOnClick(() => {
      setTimeout(() => this._shakeScreen(350), 170);
      this.tilesFunctions._animateCardToPosition(card, 0.15, 100);
      setTimeout(() => this._MovePlayerToPosition(this.currentPlayerId, intersectedObject.userData.dimensionI, intersectedObject.userData.dimensionJ), 50);
      this.buttonsManager.clearOkButtonOnClick(); // remove listener
    });
  
    intersectedObject.userData.isCard = true;
    this.totalCardsPlaced++;
    this.currentCard = card;

    this._checkCardCompatibility();
  }
  

  _onMouseClick(event) {
    if (this.isCardBeingPlaced) {
      return;
    }
    this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this._mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    this._raycaster.setFromCamera(this._mouse, this._camera);
  
    const intersects = this._raycaster.intersectObjects(this.scene.children);
  
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      if (intersectedObject.userData.dimensionI !== undefined) {
        // Get current player and current player square
        const currentPlayer = this._findPlayerById(this.currentPlayerId);

        const currentPlayerSquare = this.scene.children.find(obj => obj.userData && obj.userData.dimensionI === currentPlayer.userData.dimensionI && obj.userData.dimensionJ === currentPlayer.userData.dimensionJ);
    
        // Check if the clicked square is adjacent to the current player square
        const diffI = intersectedObject.userData.dimensionI - currentPlayerSquare.userData.dimensionI;
        const diffJ = intersectedObject.userData.dimensionJ - currentPlayerSquare.userData.dimensionJ;
        
        //console.log('diffI:', diffI, ' diffJ:', diffJ, ' playerEast:', currentPlayerSquare.userData.headingEast, ' playerWest:', currentPlayerSquare.userData.headingWest, ' playerNorth:', currentPlayerSquare.userData.headingNorth, ' playerSouth:', currentPlayerSquare.userData.headingSouth, ' cardEast:', intersectedObject.userData.headingEast, ' cardWest:', intersectedObject.userData.headingWest, ' cardNorth:', intersectedObject.userData.headingNorth, ' cardSouth:', intersectedObject.userData.headingSouth, ' isCard:', intersectedObject.userData.isCard, ' isRoom:', intersectedObject.userData.isRoom, ' isArena:', intersectedObject.userData.isArena, ' isChamber:', intersectedObject.userData.isChamber, ' isTeleport:', intersectedObject.userData.isTeleport, ' isHealingWell:', intersectedObject.userData.isHealingWell, ' monsterId:', intersectedObject.userData.monsterId, ' itemId:', intersectedObject.userData.itemId, ' isCompatible:', this.buttonsManager.isOkButtonDisabled());

        // Chceck directions, disable illegal move
        if ((diffI === 1 && diffJ === 0 && currentPlayerSquare.userData.headingEast && (!intersectedObject.userData.isCard || intersectedObject.userData.headingWest)) || 
          (diffI === -1 && diffJ === 0 && currentPlayerSquare.userData.headingWest && (!intersectedObject.userData.isCard || intersectedObject.userData.headingEast)) ||
          (diffJ === 1 && diffI === 0 && currentPlayerSquare.userData.headingSouth && (!intersectedObject.userData.isCard || intersectedObject.userData.headingNorth)) ||
          (diffJ === -1 && diffI === 0 && currentPlayerSquare.userData.headingNorth && (!intersectedObject.userData.isCard || intersectedObject.userData.headingSouth))) {
          
          this._lastMouseX = event.clientX;
          this._lastMouseY = event.clientY;
          
          this.currentSquare = intersectedObject;
          this.infoBoxManager.updateGameInfo(this.players, this.currentPlayerId, this.currentSquare, this.totalCardsPlaced, this.totalRedCardsPlaced);
    
          if (!intersectedObject.userData.isCard) {
            this._addNewCard(intersectedObject);
          } else {
            this._MovePlayerToPosition(this.currentPlayerId, intersectedObject.userData.dimensionI, intersectedObject.userData.dimensionJ);
          }
        }
      }
    }    
  }


  
  _shakeScreen(duration) {
    const body = document.body;
    body.style.overflow = 'hidden'; // disable scrolling
    const startTime = Date.now();
  
    const shake = () => {
      const elapsedTime = Date.now() - startTime;
      const relativeTime = elapsedTime / duration;
  
      if (relativeTime < 1) {
        const x = (Math.random() - 0.5) * 12;
        const y = (Math.random() - 0.5) * 12;
        body.style.transform = `translate(${x}px, ${y}px)`;
  
        requestAnimationFrame(shake);
      } else {
        body.style.transform = 'translate(0px, 0px)';
      }
    };
  
    shake();
  }
  

  _updateCardDirections(square) {
    // temporary variable
    const originalNorth = square.userData.headingNorth;
  
    // update directions after rotation
    square.userData.headingNorth = square.userData.headingEast;
    square.userData.headingEast = square.userData.headingSouth;
    square.userData.headingSouth = square.userData.headingWest;
    square.userData.headingWest = originalNorth;
  }


  _rotateCurrentCard(duration = 300) {
    if (this.currentCard && !this.isRotating) {
        this.isRotating = true;

        this.buttonsManager.disableOkButton();
        this.buttonsManager.disableRotateButton();

        const startRotation = this.currentCard.rotation.y;
        const endRotation = startRotation + Math.PI / 2;
        const startTime = performance.now();

        const animateRotation = () => {
            const currentTime = performance.now();
            const progress = Math.min((currentTime - startTime) / duration, 1);

            this.currentCard.rotation.y = startRotation + (endRotation - startRotation) * progress;

            if (progress < 1) {
                requestAnimationFrame(animateRotation);
            } else {
                this.isRotating = false;
                this._updateCardDirections(this.currentSquare); 
                this._checkCardCompatibility();
                this.buttonsManager.enableRotateButton();
            }
        };

        animateRotation();
    }
}


  _checkCardCompatibility() {
    const currentPlayer = this._findPlayerById(this.currentPlayerId);
    const currentPlayerSquare = this.scene.children.find(obj => obj.userData && obj.userData.dimensionI === currentPlayer.userData.dimensionI && obj.userData.dimensionJ === currentPlayer.userData.dimensionJ);
  
    const newCardSquare = this.currentSquare;

    let isCompatible = false;

    const deltaI = newCardSquare.userData.dimensionI - currentPlayerSquare.userData.dimensionI;
    const deltaJ = newCardSquare.userData.dimensionJ - currentPlayerSquare.userData.dimensionJ;    
  
    if (deltaI === 1 && currentPlayerSquare.userData.headingEast && newCardSquare.userData.headingWest) {
      isCompatible = true;
    } else if (deltaI === -1 && currentPlayerSquare.userData.headingWest && newCardSquare.userData.headingEast) {
      isCompatible = true;
    } else if (deltaJ === 1 && currentPlayerSquare.userData.headingSouth && newCardSquare.userData.headingNorth) {
      isCompatible = true;
    } else if (deltaJ === -1 && currentPlayerSquare.userData.headingNorth && newCardSquare.userData.headingSouth) {
      isCompatible = true;
    }

    if (isCompatible) {
      this.buttonsManager.enableOkButton();
    }
    else {
      this.buttonsManager.disableOkButton();
    }
  }

}

export default KarakGameFlow;

window.addEventListener('DOMContentLoaded', () => {
  const _APP = new KarakGameFlow(); // create instance
});


