import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js';
import { cardProperties } from './cardProperties.js';
import { WorldInfluencer } from './WorldInfluencer.js';


export class TilesFunctions {
    constructor(gameContext) {
        this.gameContext = gameContext;
    }

    _createGrid() {
      for (let i = -5; i < 6; i++) {
          for (let j = -5; j < 6; j++) {
              // One cell as 2D square
              const geometry = new THREE.PlaneGeometry(1, 1);
              
              const color = (i + j) % 2 === 0 ? 0xff0000 : 0x00ff00; // Red and green
              const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0 });
              //const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
              
              const square = new THREE.Mesh(geometry, material);

              square.position.set(i, 0.15, j);
              square.rotation.x = -Math.PI / 2; // Rotate the square to be parallel to the XY plane

              square.userData = {
                  dimensionI: i,
                  dimensionJ: j,
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

              this.gameContext.scene.add(square);
          }
      }
    }

    async _LoadCardModelOnce() {
        return new Promise((resolve, reject) => {
          const loader = new GLTFLoader();
          loader.load('../models3d/card.glb', gltf => {
            resolve(gltf.scene);
          }, undefined, error => {
            console.error('An error happened while loading the model:', error);
            reject(error);
          });
        });
      }

    async _LoadMonsterObjectOnce() {
      return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load('../models3d/monsterObject.glb', gltf => {
          resolve(gltf.scene);
        }, undefined, error => {
          console.error('An error happened while loading the model:', error);
          reject(error);
        });
      });
    }


    _AddInitialCard() {
        const card = this.gameContext.cardModel.clone();
    
        const textureLoader = new THREE.TextureLoader();
        card.traverse((child) => {
        if (child.isMesh) {
            child.material.map = textureLoader.load('../textures/specials/initial_tile_card_4_road_health.jpg');
            child.material.needsUpdate = true;
        }
        });
    
        const initX = 0;
        const initZ = 0;
        card.position.set(initX, 0.16, initZ);
        this.gameContext.scene.add(card);
        
        this.gameContext.infoBoxManager.updateGameInfo(this.gameContext.players, this.gameContext.currentPlayerId, this.gameContext.currentSquare, this.gameContext.totalCardsPlaced, this.gameContext.totalRedCardsPlaced);
    
        // setting up the initial card cell
        const initialSquare = this.gameContext.scene.children.find(obj => obj.userData && obj.userData.dimensionI === initX && obj.userData.dimensionJ === initZ);
        if (initialSquare) {
        initialSquare.userData.isCard = true;
        initialSquare.userData.headingWest = true;
        initialSquare.userData.headingNorth = true;
        initialSquare.userData.headingEast = true;
        initialSquare.userData.headingSouth = true;
        initialSquare.userData.isHealingWell = true;
        }
    }

    _animateCardToPosition(card, targetY, duration) {
      return new Promise((resolve) => {
        const startY = card.position.y;
        console.log('POCIATOCNA POZICIA JE: ' + startY);
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

    _selectRandomTexture() {
      const availableTextures = Object.keys(cardProperties).filter(texture => cardProperties[texture].remaining > 0);
    
      if (availableTextures.length === 0) {
        //console.log('No more textures available');
        return null;
      }
    
      const randomIndex = Math.floor(Math.random() * availableTextures.length);
      const selectedTexture = availableTextures[randomIndex];
      this.selectedTexture = selectedTexture;
    
      // Reducing the number of available cards for the selected texture
      cardProperties[selectedTexture].remaining--;
      //console.log('Selected texture:', selectedTexture, 'Remaining:', cardProperties[selectedTexture].remaining);
      
      const textureProperties = cardProperties[this.selectedTexture].properties;
      if (textureProperties.isChamber || textureProperties.isArena) {
        this.gameContext.totalRedCardsPlaced++;
      }

      return selectedTexture;
    }


    async _addNewCard(intersectedObject) {
      this.gameContext.isCardBeingPlaced = true;
    
      if (!this.gameContext.cardModel) {
        console.error('Card model has not been loaded yet.');
        return;
      }
    
      const card = this.gameContext.cardModel.clone();
    
      const selectedTexture = this._selectRandomTexture();
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
      this.gameContext.scene.add(card);
    
      await this._animateCardToPosition(card, 1, 600);
    
      this._setCardDirections(intersectedObject, selectedTexture);
      this.gameContext.buttonsManager.showButtons(this.gameContext._lastMouseX, this.gameContext._lastMouseY);
    
      WorldInfluencer.shakeScreen(200);
    
      // Not elegant, but works for now
      this.gameContext.buttonsManager.setOkButtonOnClick(() => {
        setTimeout(() => WorldInfluencer.shakeScreen(350), 170);
        this._animateCardToPosition(card, 0.15, 100);

        // NEW MONSTER OBJECT
        if (intersectedObject.userData.isRoom) {
          this._setMonsterObject(intersectedObject);
        }

        setTimeout(() => this.gameContext._MovePlayerToPosition(this.gameContext.currentPlayerId, intersectedObject.userData.dimensionI, intersectedObject.userData.dimensionJ), 50);
        this.gameContext.buttonsManager.clearOkButtonOnClick(); // remove listener
      });
    
      intersectedObject.userData.isCard = true;
      this.gameContext.totalCardsPlaced++;
      this.gameContext.currentCard = card;
  
      this._checkCardCompatibility(intersectedObject);
    }

    _setMonsterObject(intersectedObject) {
      const monsterObject = this.gameContext.monsterObject.clone();
      monsterObject.position.set(intersectedObject.position.x - 0.2, -1, intersectedObject.position.z);
      this.gameContext.scene.add(monsterObject);
      this._animateCardToPosition(monsterObject, 0.4, 800);
    }


    _setCardDirections(square, textureName) {
      const properties = cardProperties[textureName].properties;
      for (const prop in properties) {
        square.userData[prop] = properties[prop];
      }
    }


    //ROTATING CARD:
    //moved here from karakgameflow

    _rotateCurrentCard(duration = 300) {
      if (this.gameContext.currentCard && !this.gameContext.isRotating) {
        this.gameContext.isRotating = true;
  
        this.gameContext.buttonsManager.disableOkButton();
        this.gameContext.buttonsManager.disableRotateButton();
  
        const startRotation = this.gameContext.currentCard.rotation.y;
        const endRotation = startRotation + Math.PI / 2;
        const startTime = performance.now();

        const animateRotation = () => {
            const currentTime = performance.now();
            const progress = Math.min((currentTime - startTime) / duration, 1);

            this.gameContext.currentCard.rotation.y = startRotation + (endRotation - startRotation) * progress;

            if (progress < 1) {
              requestAnimationFrame(animateRotation);
            } else {
              this.gameContext.isRotating = false;
              this._updateCardDirections(this.gameContext.currentSquare); 
              this._checkCardCompatibility();
              this.gameContext.buttonsManager.enableRotateButton();
            }
        };

        animateRotation();
      }
    }

    _checkCardCompatibility() {
      const currentPlayer = this.gameContext._findPlayerById(this.gameContext.currentPlayerId);
      const currentPlayerSquare = this.gameContext.scene.children.find(obj => obj.userData && obj.userData.dimensionI === currentPlayer.userData.dimensionI && obj.userData.dimensionJ === currentPlayer.userData.dimensionJ);
    
      const newCardSquare = this.gameContext.currentSquare;
  
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
        this.gameContext.buttonsManager.enableOkButton();
      }
      else {
        this.gameContext.buttonsManager.disableOkButton();
      }
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
}