import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js';

export class TilesFunctions {
    constructor(state) {
        this.state = state;
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

        //funkcia na pridanie prvej karty:
    _AddInitialCard() {
        const card = this.state.cardModel.clone(); // Sklonovať model karty
    
        // Nastavenie textúry pre sklonovaný model
        const textureLoader = new THREE.TextureLoader();
        card.traverse((child) => {
        if (child.isMesh) {
            child.material.map = textureLoader.load('../textures/specials/initial_tile_card_4_road_health.jpg');
            child.material.needsUpdate = true;
        }
        });
    
        const initX = 5;
        const initZ = 5;
        card.position.set(initX, 0, initZ);
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

}