import { singleton } from 'aurelia';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { AttributeInstance, ClassInstance, Port, PortInstance, RoleInstance, SceneInstance, SceneType, Class, Relationclass, RelationclassInstance } from '../../../mmar-global-data-structure';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

@singleton()
export class GlobalDefinition {
  
  selectedTab: number;
  tabContext: {
    sceneType: SceneType;
    sceneInstance: SceneInstance;
    threeScene: THREE.Scene;
    contextDragObjects: THREE.Mesh[];
  }[];
  transformControls: TransformControls;
  orbitControls: OrbitControls;
  boxHelper: THREE.BoxHelper;
  scene: THREE.Scene;
  elementContainer: HTMLElement;
  camera:   THREE.OrthographicCamera | THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  normalCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  normalCamera2d: THREE.OrthographicCamera;
  normalCamera3d: THREE.PerspectiveCamera;
  localZPlane: number;
  mousePointer3d: THREE.Mesh;
  render: boolean;
  dragObjects: THREE.Mesh[];  updateLinesArray: Line2[];
  buttonObjects: THREE.Mesh[];
  objectScaled: boolean;
  allPositions: number[];
  allRotations: number[];
  ARCamera: THREE.PerspectiveCamera;
  mouse: THREE.Vector2;
  raycaster: THREE.Raycaster;
  raycasterBetweenObjects: THREE.Raycaster;
  plane: THREE.Mesh;
  current_class_instance: ClassInstance;
  current_port_instance: PortInstance;
  current_meta_port: Port;
  attribute_instances: AttributeInstance[];
  role_instances: RoleInstance[];
  relationObjects: THREE.Mesh[];
  sceneTypes: SceneType[];
  onDocumentMouseDownEventListener: void;
  sceneTree: any[];
  importSceneTypes: SceneType[];
  importSceneInstances: SceneInstance[];
  accessToken: string;
  threeDimensional: boolean;
  orbitControls2d: OrbitControls;
  orbitControls3d: OrbitControls;
  readyForVizRepUpdate: boolean;
  runMechanism: boolean;
  codeEditorValue: string;
  classes: Class[];
  relationClasses: Relationclass[];
  ports: Port[];
  mockClass: Class;
  mockClassInstance: ClassInstance;

  constructor() {
    
    this.selectedTab = 0;
    this.tabContext = [];
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(0, 0, 0, 0);
    this.normalCamera2d = new THREE.OrthographicCamera(0, 0, 0, 0);
    this.normalCamera3d = new THREE.PerspectiveCamera(0, 0, 0, 0);
    this.normalCamera = this.normalCamera2d;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.localZPlane = 0;
    this.mousePointer3d = new THREE.Mesh();
    this.updateLinesArray = [];
    this.objectScaled = false;
    this.allPositions = [];
    this.allRotations = [];
    this.ARCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.raycasterBetweenObjects = new THREE.Raycaster();
    this.render = true;
    this.plane = new THREE.Mesh();
    this.dragObjects = [];
    this.buttonObjects = [];
    this.current_meta_port = undefined;
    this.attribute_instances = [];
    this.role_instances = [];
    this.relationObjects = [];
    this.orbitControls = new OrbitControls(this.normalCamera, this.renderer.domElement);
    this.sceneTree = [];
    this.importSceneTypes = [];
    this.importSceneInstances = [];
    this.accessToken = "";
    this.threeDimensional = true;
    this.readyForVizRepUpdate = true;
    this.runMechanism = false;
    this.codeEditorValue = "// This is an example only. Choose an object on the left side.\n/** @param {GraphicContext} gc */\nasync function vizRep(gc) {\n  let icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADMElEQVR4nOzVwQnAIBQFQYXff81RUkQCOyDj1YOPnbXWPmeTRef+/3O/OyBjzh3CD95BfqICMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMO0TAAD//2Anhf4QtqobAAAAAElFTkSuQmCC';\n  gc.graphic_cube(1, 1, 1, 'grey');\n}";
    this.classes = [];
    this.relationClasses = [];
    this.ports = [];
    this.sceneTypes = [];
    this.mockClass = undefined;
    this.mockClassInstance = undefined;
  }
  
      
}
