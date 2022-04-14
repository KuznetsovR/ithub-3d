import World from '../World';
import * as THREE from 'three';
import EventEmitter from '../../Utils/EventEmitter';

export default class Portal extends EventEmitter {
  constructor(name, position, url, size, timer) {
    super();
    this.world = new World();
    this.mainHero = this.world.mainHero;
    this.time = this.world.time;
    this.resources = this.world.resources;

    this.url = url;
    this.position = position;
    this.size = size;
    this.name = name;
    this.timer = timer;
    this.isRedirected = false

    this.container = new THREE.Object3D();
    this.container.position.x = this.position.x;
    this.container.position.y = this.position.y;
    this.container.position.z = -0.08;
    this.container.matrixAutoUpdate = false;
    this.container.updateMatrix();

    this.skateIsInArea = false;
    this.elapsedTimeInPortal = 0;

    this.setTimer();
    this.observeSkate();
    this.createPortal()
  }
  createPortal(){
    this.portal = {
      geometry: new THREE.PlaneGeometry(this.size, this.size),
      material: new THREE.MeshStandardMaterial({ map: this.resources.items.PortalTexture, transparent: true, roughness: 0.5 }),
    };
    this.portal.mesh = new THREE.Mesh(this.portal.geometry, this.portal.material);
    this.portal.mesh.position.set(0,0,0.1)

    this.time.on('tick', ()=>{
      this.portal.mesh.rotation.set(0,0,Math.PI * Math.sin(this.time.elapsed / 1000))
    })

    this.container.add(this.portal.mesh);
  }

  setTimer() {
    this.time.on('tick', () => {
      if (this.timer.currentPortal === null || this.timer.currentPortal === this.name && !this.isRedirected) {
        if (this.elapsedTimeInPortal > 100) {
          this.isRedirected = true
          setTimeout(()=>{
            this.elapsedTimeInPortal = 0
            this.isRedirected = false
          }, 1000)
          this.redirect();
        } else if (this.skateIsInArea) {
          this.timer.setCurrentPortal(this.name);
          this.elapsedTimeInPortal += this.time.delta / 30;

          this.timer.makeTimerVisible();
        } else if (this.elapsedTimeInPortal > 0) {
          this.elapsedTimeInPortal -= this.time.delta / 30;
        } else {
          this.timer.setCurrentPortal(null);
          this.timer.makeTimerInvisible();
        }
        this.timer.setTimerWidth(this.elapsedTimeInPortal / 1.5);
      }
    });
  }
  redirect() {
    window.location = this.url;
  }
  observeSkate() {
    this.time.on('tick', () => {
      const skateIsIn =
        Math.abs(this.mainHero.position.x - this.position.x) < Math.abs(this.size / 2) &&
        Math.abs(this.mainHero.position.y - this.position.y) < Math.abs(this.size / 2);
      if (skateIsIn !== this.skateIsInArea) {
        this.skateIsInArea = skateIsIn;
      }
    });
  }
}
