import { SceneInitiator } from 'resources/scene_initiator';
import { singleton } from 'aurelia';
import { GlobalDefinition } from './global_definitions';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MouseObject } from './mouse_object';
import { InteractionHandler } from './interaction_handler';
import { Logger } from './services/logger';
import { Resize } from './resize';
import { ArInitiator } from './ar_initiator';
import { Class, ClassInstance, SceneType } from '../../../mmar-global-data-structure';
import { InstanceCreationHandler } from './instance_creation_handler';
import { InstanceUtility } from './services/instance_utility';
import { LineUpdateService } from './services/line_update_service';

@singleton()
export class Initiator {


  constructor(
    private globalObjectInstance: GlobalDefinition,
    private mouseObject: MouseObject,
    private interactonHandler: InteractionHandler,
    private logger: Logger,
    private sceneInitiator: SceneInitiator,
    private resize: Resize,
    private arInitiator: ArInitiator,
    private instanceCreationHandler: InstanceCreationHandler,
    private instanceUtility: InstanceUtility,
    private lineUpdateService: LineUpdateService
  ) {
  }

  //------------------------------------------------
  //this gets all the dom elements for the globalObject
  //------------------------------------------------
  async initDomObjectElements() {
    // event on pointermove call updateMousePosText
    await this.setElementsById('container', this.globalObjectInstance, 'elementContainer')
    this.logger.log('init DomElementObjects to globalObject', 'done')
  }

  //custom function that tries to query an element until it is available
  async setElementsById(id: string, object, propertyToAssign) {
    const interval = window.setInterval(
      async () => {
        object[propertyToAssign] = document.querySelector('#' + id);

        if (object[propertyToAssign]) {
          clearInterval(interval);
        } else {
          this.logger.log('element ' + id + ' undefined', 'close')
        }
      }

      , 1000);
  }

  async init() {

    const containerWidth = this.globalObjectInstance.elementContainer.clientWidth;
    const containerHeight = this.globalObjectInstance.elementContainer.clientHeight;
    const aspectRatio = containerWidth / containerHeight;
    const nearPlane = 0.1;
    const farPlane = 5000;

    // Perspective Camera
    const fov = 70; // Field of view in degrees
    this.globalObjectInstance.normalCamera3d = new THREE.PerspectiveCamera(
      fov, aspectRatio, nearPlane, farPlane
    );
    this.globalObjectInstance.normalCamera3d.position.set(0, 0, 10);

    // Orthographic Camera
    const frustumSize = 10;
    this.globalObjectInstance.normalCamera2d = new THREE.OrthographicCamera(
      (frustumSize * aspectRatio) / -2, (frustumSize * aspectRatio) / 2,
      frustumSize / 2, frustumSize / -2,
      nearPlane, farPlane
    );
    this.globalObjectInstance.normalCamera2d.position.set(0, 0, 10);
    this.globalObjectInstance.normalCamera2d.zoom = 1; // Adjust zoom to match perspective view
    this.globalObjectInstance.normalCamera2d.updateProjectionMatrix();

    this.globalObjectInstance.normalCamera = this.globalObjectInstance.normalCamera3d;
    this.globalObjectInstance.camera = this.globalObjectInstance.normalCamera;
    this.globalObjectInstance.renderer.setSize(this.globalObjectInstance.elementContainer.clientWidth, this.globalObjectInstance.elementContainer.clientHeight, true);
    this.globalObjectInstance.elementContainer.appendChild(this.globalObjectInstance.renderer.domElement);

    await this.initMousePointer3d();

    await this.initOrbitControls();

    await this.createMockSceneType();
    await this.createMockClass();
    await this.createMockClassInstance();

    await this.sceneInitiator.sceneInit();

    await this.createIntersectionPlane();


    this.globalObjectInstance.renderer.setAnimationLoop(this.arInitiator.render.bind(this.arInitiator))
  }

  async initMousePointer3d() {
    this.globalObjectInstance.mousePointer3d = this.createSphereMesh(new THREE.Color("blue"));
    this.globalObjectInstance.mousePointer3d.visible = false;
    this.globalObjectInstance.mousePointer3d.position.z = this.globalObjectInstance.localZPlane;
    this.globalObjectInstance.scene.add(this.globalObjectInstance.mousePointer3d);
    this.globalObjectInstance.mousePointer3d.name = "mousePointer3d";
  }



  async initOrbitControls() {

    this.globalObjectInstance.orbitControls2d = new OrbitControls(this.globalObjectInstance.normalCamera2d, this.globalObjectInstance.renderer.domElement);
    this.globalObjectInstance.orbitControls3d = new OrbitControls(this.globalObjectInstance.normalCamera3d, this.globalObjectInstance.renderer.domElement);

    //orbit controls to move camera
    this.globalObjectInstance.orbitControls2d.target = new THREE.Vector3(0, 0, this.globalObjectInstance.localZPlane);
    this.globalObjectInstance.orbitControls3d.target = new THREE.Vector3(0, 0, this.globalObjectInstance.localZPlane);


    // max and min Zoom for OrbitControls
    this.globalObjectInstance.orbitControls2d.minDistance = 0.2;
    this.globalObjectInstance.orbitControls2d.maxDistance = 500;
    this.globalObjectInstance.orbitControls3d.minDistance = 0.2;
    this.globalObjectInstance.orbitControls3d.maxDistance = 500;

    //set orbitcontrol values for 3d
    this.globalObjectInstance.orbitControls3d.maxPolarAngle = Math.PI; // radians
    this.globalObjectInstance.orbitControls3d.minPolarAngle = 0; // radians
    this.globalObjectInstance.orbitControls3d.maxAzimuthAngle = Infinity; // radians
    this.globalObjectInstance.orbitControls3d.minAzimuthAngle = Infinity; // radians

    // set orbitcontrol values for 2d
    this.globalObjectInstance.orbitControls2d.maxPolarAngle = Math.PI / 2; // radians
    this.globalObjectInstance.orbitControls2d.minPolarAngle = Math.PI / 2; // radians
    this.globalObjectInstance.orbitControls2d.maxAzimuthAngle = 0; // radians
    this.globalObjectInstance.orbitControls2d.minAzimuthAngle = 0; // radians

    if (!this.globalObjectInstance.threeDimensional) {
      this.globalObjectInstance.orbitControls = this.globalObjectInstance.orbitControls2d;
    }
    if (this.globalObjectInstance.threeDimensional) {
      this.globalObjectInstance.orbitControls = this.globalObjectInstance.orbitControls3d;
    }

    this.globalObjectInstance.orbitControls3d.addEventListener('change', () => this.globalObjectInstance.render = true, { passive: true });
    this.globalObjectInstance.orbitControls3d.addEventListener('mouseUp', () => this.globalObjectInstance.render = true, { passive: true });
    this.globalObjectInstance.orbitControls2d.addEventListener('change', () => this.globalObjectInstance.render = true, { passive: true });
    this.globalObjectInstance.orbitControls2d.addEventListener('mouseUp', () => this.globalObjectInstance.render = true, { passive: true });


    //save state of orbitcontrols
    this.globalObjectInstance.orbitControls2d.saveState();
    //save state of orbitcontrols
    this.globalObjectInstance.orbitControls3d.saveState();
  }

  createSphereMesh(color: THREE.Color) {
    const sphGeom = new THREE.SphereGeometry(0.05, 8, 4);
    const sphMat = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: false
    });
    return new THREE.Mesh(sphGeom, sphMat);
  }

  async initEventListeners() {

    // we add the method to a global variable so that we can remove the listener later with just calling the variable
    this.globalObjectInstance.onDocumentMouseDownEventListener = await this.interactonHandler.onDocumentMouseDown.bind(this.interactonHandler)
    // we do not init the event listener here since it must be initialized after the transform controls are initialized
    //this.globalObjectInstance.renderer.domElement.addEventListener('pointerdown', this.globalObjectInstance.onDocumentMouseDownEventListener, false);

    this.globalObjectInstance.elementContainer.addEventListener("pointermove", this.mouseObject.updateMousePos.bind(this.mouseObject), { passive: true });

    //init resize event listener
    window.addEventListener('resize', this.resize.resize.bind(this));

  }

  async createIntersectionPlane() {
    // add intersection plane
    const geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(10000, 10000);
    const material = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });
    material.color = new THREE.Color("grey");
    this.globalObjectInstance.plane = new THREE.Mesh(geometry, material);
    this.globalObjectInstance.plane.receiveShadow = true;
    this.globalObjectInstance.plane.position.z = this.globalObjectInstance.localZPlane;
    this.logger.log('intersection plane created at position :' + JSON.stringify(this.globalObjectInstance.plane.position), 'done')
    this.globalObjectInstance.plane.geometry.name = "plane";
    this.globalObjectInstance.scene.add(this.globalObjectInstance.plane);
  }

  async createMockSceneType() {
    this.globalObjectInstance.sceneTypes.push(new SceneType(this.instanceCreationHandler.create_UUID(), "MockSceneType"));
  }

  async createMockClass() {
    const mockClass = new Class(this.instanceCreationHandler.create_UUID(), "MockClass",false,false);
    this.globalObjectInstance.mockClass = mockClass;
    this
  }
  async createMockClassInstance() {
    const mockClassInstance = new ClassInstance(this.instanceCreationHandler.create_UUID(), this.globalObjectInstance.mockClass.uuid); 
    this.globalObjectInstance.mockClassInstance = mockClassInstance;
  }
}