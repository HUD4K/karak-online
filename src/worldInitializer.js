import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

class WorldInitializer {
    constructor() {
      this._initialize();
      this._raycaster = new THREE.Raycaster();
      this._mouse = new THREE.Vector2();
    }

    _initialize() {
        this._threejs = this._initializeRenderer();
        this._camera = this._initializeCamera();
        this._scene = new THREE.Scene();
        this._addLightToScene(this._scene);
        this._controls = this._initializeControls();
    }
  
    _initializeRenderer() {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
      
        // Pridanie počúvača udalostí pre zmenu veľkosti okna
        window.addEventListener('resize', () => {
          this._OnWindowResize();
        }, false);
      
        // Spustenie vykresľovacej slučky
        this._RAF();
      
        return renderer;
      }
  
    _initializeCamera() {
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

      camera.position.set(0, 10, 5);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      return camera;
    }
  
    _addLightToScene(scene) {
      const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
      light.position.set(0, 1, 1);
      scene.add(light);
    }
  
    _initializeControls() {
      const controls = new OrbitControls(this._camera, this._threejs.domElement);
      //controls.enableZoom = false;
      //controls.enableRotate = false;
      return controls;
    }

    getRaycaster() {
        return this._raycaster;
      }
  
    getMouseVector() {
    return this._mouse;
    }

    _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
      }
    
    _RAF() {
      requestAnimationFrame(() => {
          this._threejs.render(this._scene, this._camera);
          this._RAF();
      });
    }
    
  
    getWorldComponents() {
      return {
        renderer: this._threejs,
        camera: this._camera,
        scene: this._scene,
        controls: this._controls
      };
    }
  }

  export default WorldInitializer;
  