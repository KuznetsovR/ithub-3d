import EventEmitter from './EventEmitter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();
    this.sources = sources;

    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;
    this.setLoadingManager();
    this.setLoaders();
    this.startLoading();
  }
  startLoading() {
    for (const source of this.sources) {
      if (source.type === 'gltfModel') {
        this.loaders.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === 'texture') {
        this.loaders.textureLoader.load(source.path, (file) => {
          file.encoding = 3001

          this.sourceLoaded(source, file);
        });
      } else if (source.type === 'cubeTexture') {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
    }
  }
  sourceLoaded(source, file) {
    this.items[source.name] = file;
    this.loaded++;
    if (this.loaded === this.toLoad) {
      this.trigger('ready');
    }
  }
  setLoadingManager() {
    const progressBar = document.querySelector('.progress-bar')
    const percents = document.querySelector('.progress-in-percents')
    this.loadingManager = new THREE.LoadingManager(
      () => {},
      (itemUrl, itemsLoaded, itemsTotal) => {
        const result = Math.round(itemsLoaded / itemsTotal * 100) + '%'
        progressBar.style.width = result
        percents.textContent = result
      }
    );
  }
  setLoaders() {
    this.loaders = {};
    this.loaders.dracoLoader = new DRACOLoader();
    this.loaders.dracoLoader.setDecoderPath('/draco/');

    this.loaders.gltfLoader = new GLTFLoader(this.loadingManager);
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader);

    this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);
  }
}
