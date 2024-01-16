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


// Main class
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

    this.state = {
      totalCardsPlaced: 0,
      totalRedCardsPlaced: 0,
      isCardBeingPlaced: false,
      isRotating: false,
      currentPlayerId: 1,
      players: [],
      cardModel: null,
      infoBoxManager : new InfoBoxManager(),
      sidebarManager : new SidebarManager(),
      scene : scene
    };

    this.tilesFunctions = new TilesFunctions(this.state);

    this.tilesFunctions._LoadCardModelOnce().then(model => {
      // Uloženie modelu a aktualizácia stavu
      this.state.cardModel = model;
      this.tilesFunctions._AddInitialCard();  
    });
    
    this.buttonsManager = new ButtonsManager(this, this.state);
    this.buttonsManager.setupButtonEventListeners();
    this._Initialize();
  }

  _Initialize() {
    this._worldInitializer.LoadModel();
    this._createGrid();
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

    this.state.sidebarManager.createMultipleCharacterCards(sampleCharacters);
  }


  //funkcia na vytvorenie hraca:
  async _AddPlayer(characterName, id, offset) {
    const textureName = characterProperties[characterName].modelTexture;
    const defaultCoord = 5;
    const player = await this._LoadPlayerModel(textureName);
    const worldX = defaultCoord + offset.x;
    const worldZ = defaultCoord + offset.y;
    player.position.set(worldX, 0, worldZ);

    player.userData = {
        suradnicaI: defaultCoord,
        suradnicaJ: defaultCoord,
        id: id,
        offsetX: offset.x,
        offsetY: offset.y,
        moves: 4
    };

    this.state.scene.add(player);
    this.state.players.push(player);
}

  //funkcia na vytvorenie základnej mriežky:
  _createGrid() {
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 11; j++) {
            // Vytvorenie jednej bunky mriežky ako 2D štvorec
            const geometry = new THREE.PlaneGeometry(1, 1);
            
            // Nastavenie striedavých farieb pre bunky
            const color = (i + j) % 2 === 0 ? 0xff0000 : 0x00ff00; // Červená a zelená
            const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0 });
            //const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
            
            const square = new THREE.Mesh(geometry, material);

            // Nastavenie pozície štvorca
            square.position.set(i, 0, j);
            square.rotation.x = -Math.PI / 2; // Otáčanie štvorca, aby bol rovnobežný s XY rovinou

            // Priradenie vlastností bunky
            square.userData = {
                suradnicaI: i,
                suradnicaJ: j,
                isCard: false,
                headingWest: false,
                headingNorth: false,
                headingEast: false,
                headingSouth: false,
                isRoom: false,
                isArena: false,
                isChamber: false,
                isTeleport: false,
                isHealingWell: false,
                monsterId: 0,
                itemId: 0,
            };

            // Pridanie bunky do scény
            this.state.scene.add(square);
        }
    }
  }

  //funkcia na nacitanie modelu hraca:
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
 
  //funkcia na najdenie hraca podla id:
  _findPlayerById(playerId) {
    return this.state.players.find(p => p.userData.id === playerId);
  }
  
  //funkcia na presun hraca na poziciu:
  async _MovePlayerToPosition(playerId, newI, newJ) {
    const player = this._findPlayerById(playerId);
    if (player) {
      // Skontrolovať, či je nová pozícia rovnaká ako súčasná
      if (player.userData.suradnicaI === newI && player.userData.suradnicaJ === newJ) {
          // Hráč už stojí na tejto kartičke, nevykonávať žiadne zmeny
          return;
      }
  
      // Nové svetové súradnice
      const newWorldX = newI + player.userData.offsetX;
      const newWorldZ = newJ + player.userData.offsetY;
  
      // Animácia pohybu hráča
      await this._animatePlayerToPosition(player, newWorldX, newWorldZ);
  
      // Aktualizácia súradníc hráča po dokončení animácie
      player.userData.suradnicaI = newI;
      player.userData.suradnicaJ = newJ;
      player.userData.moves--;
  
      // Skontrolovať, či hráč vyčerpal všetky pohyby
      if (player.userData.moves === 0) {
          this._changePlayer();
      }
  
      this.state.infoBoxManager.updateGameInfo(this.state.players, this.state.currentPlayerId, this.currentSquare, this.state.totalCardsPlaced, this.state.totalRedCardsPlaced);
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

  //funkcia na prechod na dalsieho hraca (kto je na rade):
  _changePlayer() {
    // Prechod na ďalšieho hráča a reset pohybov
    this.state.currentPlayerId = (this.state.currentPlayerId % this.state.players.length) + 1;
    const currentPlayer = this._findPlayerById(this.state.currentPlayerId);

    // Skontrolujte, či currentPlayer naozaj existuje
    if (currentPlayer) {
        currentPlayer.userData.moves = 4; // Resetovanie pohybov na 4
        this.state.infoBoxManager.updateGameInfo(this.state.players, this.state.currentPlayerId, this.currentSquare, this.state.totalCardsPlaced, this.state.totalRedCardsPlaced);
    } else {
        console.error('Error: player with ID ' + this.state.currentPlayerId + ' does not exist.');
    }
}

  


  //funkcia na vyber nahodnej textury:
  _selectRandomTexture() {
    const availableTextures = Object.keys(cardProperties).filter(texture => cardProperties[texture].remaining > 0);
  
    if (availableTextures.length === 0) {
      console.log('No more textures available');
      return null;
    }
  
    const randomIndex = Math.floor(Math.random() * availableTextures.length);
    const selectedTexture = availableTextures[randomIndex];
    this.selectedTexture = selectedTexture;
  
    // Zníženie počtu dostupných kariet pre vybranú textúru
    cardProperties[selectedTexture].remaining--;
    console.log('Selected texture:', selectedTexture, 'Remaining:', cardProperties[selectedTexture].remaining);
    
    const textureProperties = cardProperties[this.selectedTexture].properties;
    if (textureProperties.isChamber || textureProperties.isArena) {
      this.state.totalRedCardsPlaced++;
    }

    return selectedTexture;
  }
  
  // Použitie v _setCardDirections
  _setCardDirections(square, textureName) {
    const properties = cardProperties[textureName].properties;
    for (const prop in properties) {
      square.userData[prop] = properties[prop];
    }
  }

  async _addNewCard(intersectedObject) {
    this.state.isCardBeingPlaced = true;
  
    if (!this.state.cardModel) {
      console.error('Card model has not been loaded yet.');
      return;
    }
  
    const card = this.state.cardModel.clone(); // Klónovanie modelu karty
  
    // Náhodný výber textúry
    const selectedTexture = this._selectRandomTexture();
    if (!selectedTexture) {
      console.error('No more textures available');
      return;
    }
  
    // Nastavenie textúry pre sklonovaný model
    const textureLoader = new THREE.TextureLoader();
    const cardTexture = textureLoader.load(`../textures/tiles/${selectedTexture}.jpg`);
  
    card.traverse((child) => {
      if (child.isMesh && child.material.name === 'topSurface') {
        // Vytvorenie nového materiálu pre každý klón
        const newMaterial = new THREE.MeshStandardMaterial({
          map: cardTexture
        });
        child.material = newMaterial;
      }
    });
  
    card.position.set(intersectedObject.position.x, 10, intersectedObject.position.z);
    this.state.scene.add(card);
  
    // Animácia karty z výšky na konečnú pozíciu
    await this._animateCardToPosition(card, 0.5, 600);
  
    // Nastavenie smeru karty a zobrazenie tlačidiel
    this._setCardDirections(intersectedObject, selectedTexture);
    this.buttonsManager.showButtons(this._lastMouseX, this._lastMouseY);
  
    this._shakeScreen(200);
  
    // Odloženie zatrasenia a pohybu hráča
    this.buttonsManager.setOkButtonOnClick(() => {
      setTimeout(() => this._shakeScreen(350), 170);
      setTimeout(() => this._MovePlayerToPosition(this.state.currentPlayerId, intersectedObject.userData.suradnicaI, intersectedObject.userData.suradnicaJ), 50);
      this.buttonsManager.clearOkButtonOnClick(); // Odstránenie listenera po použití
    });
  
    intersectedObject.userData.isCard = true;
    this.state.totalCardsPlaced++;
    this.currentCard = card;

    this._checkCardCompatibility();
  }
  
  //funkcia na detektiu kliknutia. Vyvoláva mnoho ostatných hlavných funkcií:
  _onMouseClick(event) {
    if (this.state.isCardBeingPlaced) {
      return; // Ignoruj kliknutia, pokiaľ je karta vo fáze umiestnenia
    }
    this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this._mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    this._raycaster.setFromCamera(this._mouse, this._camera);
  
    const intersects = this._raycaster.intersectObjects(this.state.scene.children);
  
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      if (intersectedObject.userData.suradnicaI !== undefined) {
        // Získanie aktuálnej pozície hráča a bunky
        const currentPlayer = this._findPlayerById(this.state.currentPlayerId);
        const currentPlayerSquare = this.state.scene.children.find(obj => obj.userData && obj.userData.suradnicaI === currentPlayer.userData.suradnicaI && obj.userData.suradnicaJ === currentPlayer.userData.suradnicaJ);
    
        // Zistiť smer medzi aktuálnou a kliknutou bunkou
        const diffI = intersectedObject.userData.suradnicaI - currentPlayerSquare.userData.suradnicaI;
        const diffJ = intersectedObject.userData.suradnicaJ - currentPlayerSquare.userData.suradnicaJ;
        
        console.log('diffI:', diffI, ' diffJ:', diffJ, ' playerEast:', currentPlayerSquare.userData.headingEast, ' playerWest:', currentPlayerSquare.userData.headingWest, ' playerNorth:', currentPlayerSquare.userData.headingNorth, ' playerSouth:', currentPlayerSquare.userData.headingSouth, ' cardEast:', intersectedObject.userData.headingEast, ' cardWest:', intersectedObject.userData.headingWest, ' cardNorth:', intersectedObject.userData.headingNorth, ' cardSouth:', intersectedObject.userData.headingSouth, ' isCard:', intersectedObject.userData.isCard, ' isRoom:', intersectedObject.userData.isRoom, ' isArena:', intersectedObject.userData.isArena, ' isChamber:', intersectedObject.userData.isChamber, ' isTeleport:', intersectedObject.userData.isTeleport, ' isHealingWell:', intersectedObject.userData.isHealingWell, ' monsterId:', intersectedObject.userData.monsterId, ' itemId:', intersectedObject.userData.itemId, ' isCompatible:', this.buttonsManager.isOkButtonDisabled());

        // Kontrola smeru a povolenia pohybu, zamedzenie diagonálnemu pohybu
        if ((diffI === 1 && diffJ === 0 && currentPlayerSquare.userData.headingEast && (!intersectedObject.userData.isCard || intersectedObject.userData.headingWest)) || 
          (diffI === -1 && diffJ === 0 && currentPlayerSquare.userData.headingWest && (!intersectedObject.userData.isCard || intersectedObject.userData.headingEast)) ||
          (diffJ === 1 && diffI === 0 && currentPlayerSquare.userData.headingSouth && (!intersectedObject.userData.isCard || intersectedObject.userData.headingNorth)) ||
          (diffJ === -1 && diffI === 0 && currentPlayerSquare.userData.headingNorth && (!intersectedObject.userData.isCard || intersectedObject.userData.headingSouth))) {
          
          this._lastMouseX = event.clientX;
          this._lastMouseY = event.clientY;
          
          this.currentSquare = intersectedObject; // Aktualizácia this.currentSquare
          this.state.infoBoxManager.updateGameInfo(this.state.players, this.state.currentPlayerId, this.currentSquare, this.state.totalCardsPlaced, this.state.totalRedCardsPlaced);
    
          if (!intersectedObject.userData.isCard) {
            this._addNewCard(intersectedObject);
          } else {
            // Presun hráča, ktorý je na rade, na existujúcu kartu
            this._MovePlayerToPosition(this.state.currentPlayerId, intersectedObject.userData.suradnicaI, intersectedObject.userData.suradnicaJ);
          }
        }
      }
    }    
  }

  //funkcia na animaciu karty:
  _animateCardToPosition(card, targetY, duration) {
    return new Promise((resolve) => {
      const startY = card.position.y;
      const endY = targetY;
  
      const startTime = performance.now();
      const animate = () => {
        const currentTime = performance.now();
        const progress = Math.min((currentTime - startTime) / duration, 1);
  
        card.position.y = startY + (endY - startY) * progress;
  
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
  
      animate();
    });
  }
  
  _shakeScreen(duration) {
    const body = document.body;
    body.style.overflow = 'hidden'; // zakázanie scrollovania počas zatrasenia
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

  //funkcia na otocenie karty:
  _rotateCurrentCard(duration = 300) {
    if (this.currentCard && !this.state.isRotating) {
        this.state.isRotating = true;

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
                this.state.isRotating = false;
                this._updateCardDirections(this.currentSquare); // Aktualizuje smerovanie karty po rotácii
                this._checkCardCompatibility(); // Kontroluje kompatibilitu po rotácii
                this.buttonsManager.enableRotateButton();
            }
        };

        animateRotation();
    }
}


  _checkCardCompatibility() {
    const currentPlayer = this._findPlayerById(this.state.currentPlayerId);
    const currentPlayerSquare = this.state.scene.children.find(obj => obj.userData && obj.userData.suradnicaI === currentPlayer.userData.suradnicaI && obj.userData.suradnicaJ === currentPlayer.userData.suradnicaJ);
  
    const newCardSquare = this.currentSquare;
  
    console.log('Smerovanie karty, na ktorej stojí hráč:', currentPlayerSquare.userData);
    console.log('Smerovanie novej karty:', newCardSquare.userData);

    let isCompatible = false;


    const deltaI = newCardSquare.userData.suradnicaI - currentPlayerSquare.userData.suradnicaI;
    const deltaJ = newCardSquare.userData.suradnicaJ - currentPlayerSquare.userData.suradnicaJ;
    
  
    if (deltaI === 1 && currentPlayerSquare.userData.headingEast && newCardSquare.userData.headingWest) {
      isCompatible = true;
    } else if (deltaI === -1 && currentPlayerSquare.userData.headingWest && newCardSquare.userData.headingEast) {
      isCompatible = true;
    } else if (deltaJ === 1 && currentPlayerSquare.userData.headingSouth && newCardSquare.userData.headingNorth) {
      isCompatible = true;
    } else if (deltaJ === -1 && currentPlayerSquare.userData.headingNorth && newCardSquare.userData.headingSouth) {
      isCompatible = true;
    }
    

    console.log('Kompatibilita:', isCompatible, ' DI: ', deltaI, ' DJ: ', deltaJ);

    if (isCompatible) {
      this.buttonsManager.enableOkButton();
    }
    else {
      this.buttonsManager.disableOkButton();
    }
  }

// END OF THE CLASS
}

export default KarakGameFlow;

window.addEventListener('DOMContentLoaded', () => {
  const _APP = new KarakGameFlow(); // Vytvorenie inštancie
});


