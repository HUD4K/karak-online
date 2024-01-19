import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js';
import { cardProperties } from './cardProperties.js';


export class TilesFunctions {
    constructor(state) {
        this.state = state;
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
                  monsterId: 0,
                  itemId: 0,
              };

              this.state.scene.add(square);
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


    _AddInitialCard() {
        const card = this.state.cardModel.clone();
    
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
        this.state.scene.add(card);
        
        this.state.infoBoxManager.updateGameInfo(this.state.players, this.state.currentPlayerId, this.state.currentSquare, this.state.totalCardsPlaced, this.state.totalRedCardsPlaced);
    
        // setting up the initial card cell
        const initialSquare = this.state.scene.children.find(obj => obj.userData && obj.userData.dimensionI === initX && obj.userData.dimensionJ === initZ);
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
        this.state.totalRedCardsPlaced++;
      }

      return selectedTexture;
    }
}