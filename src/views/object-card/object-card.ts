import { all, bindable, customElement, EventAggregator, inject } from "aurelia";
import { Class, ClassInstance, MetaObject, Port, PortInstance, Relationclass, RelationclassInstance, SceneInstance, SceneType } from "../../../../mmar-global-data-structure";
import { SelectedObjectService } from "../../resources/services/selected-object";
import { FetchHelper } from "resources/services/fetchHelper";
import { GlobalDefinition } from "resources/global_definitions";
import { InstanceCreationHandler } from "resources/instance_creation_handler";
import * as THREE from "three";
import { Line2 } from 'three/examples/jsm/lines/Line2';



import { MetaUtility } from "resources/services/meta_utility";
import { GraphicContext } from "resources/graphic_context";
import { SceneInitiator } from "resources/scene_initiator";
import { start } from "repl";
import { GlobalSelectedObject } from "resources/global_selected_object";
import { InstanceUtility } from "resources/services/instance_utility";
import { Logger } from "resources/services/logger";
import { LineUpdateService } from "resources/services/line_update_service";
import { GlobalClassObject } from "resources/global_class_object";

@customElement("object-card")
@inject(SelectedObjectService)
export class objectCard {
  @bindable object: MetaObject;
  @bindable type: string;

  sceneType = this.globalObjectInstance.sceneTypes[0];
  sceneInstance: SceneInstance = null;
  sceneInstances: SceneInstance[] = [];
  tree;
  sceneTypes: SceneType[] = [];

  constructor(
    private selectedObjectService: SelectedObjectService,
    private fetchHelper: FetchHelper,
    private globalObjectInstance: GlobalDefinition,
    private eventAggregator: EventAggregator,
    private instanceCreationHandler: InstanceCreationHandler,
    private metaUtility: MetaUtility,
    private gc: GraphicContext,
    private sceneInitiator: SceneInitiator,
    private globalSelectedObject: GlobalSelectedObject,
    private instanceUtility: InstanceUtility,
    private logger: Logger,
    private lineUpdateService: LineUpdateService,
    private globalClassObject: GlobalClassObject,
    ) {
        // this.eventAggregator.subscribe('tabChanged', async () => {
        //     await this.setIcons();
        // });
    }

    async attached() {
        await this.setIcons();

    }

  get isSelected() {
    return (
      this.selectedObjectService.getSelectedObject()?.uuid === this.object.uuid
    );
  }

  

  async onButtonClicked(object) {
    console.log(object);

    await this.gc.resetInstance();
    this.globalObjectInstance.current_class_instance = null;
    this.globalObjectInstance.current_port_instance = null;

    this.sceneInstance = null;
    this.globalObjectInstance.scene = null;
    this.globalObjectInstance.sceneTree = null;
    this.globalObjectInstance.tabContext = [];
    this.tree = null;
    this.sceneTypes = [];


    this.sceneInstance = await this.createNewScene();
    await this.sceneInitiator.sceneInit();
    await this.instanceUtility.createTabContextSceneInstance(this.sceneInstance);

    this.globalObjectInstance.selectedTab = 0;
    await this.initTree();

    this.selectedObjectService.setSelectedObject(this.object.uuid);


    if (this.selectedObjectService.getSelectedObject()) {
      const object = this.selectedObjectService.getSelectedObject();
      this.globalObjectInstance.codeEditorValue = object.geometry as unknown as string;
      this.eventAggregator.publish("changeCodeEditorCode");

      console.log("Create Instance of", this.object.name);

      let instance: ClassInstance | RelationclassInstance | PortInstance;
      //if relationclass
      if (this.object instanceof Relationclass) {
        console.log("todo: create relation class instance");

        instance = await this.instanceCreationHandler.createRelationclassInstance(
          this.instanceCreationHandler.create_UUID(),
          0,
          0,
          0,
          this.object.uuid,
          'relation'
        );
        this.globalObjectInstance.current_class_instance = instance as ClassInstance;
        console.log("todo: add relation class instance to scene");
      }
      //if class
      else if (this.object instanceof Class) {
        console.log("todo: create class instance");
        instance = await this.instanceCreationHandler.createClassInstance(
          this.instanceCreationHandler.create_UUID(),
          0,
          0,
          0,
          this.object.uuid,
          'class'
        );
        this.globalObjectInstance.current_class_instance = instance as ClassInstance;
        console.log("todo: add class instance to scene");
      }
      else if (this.object instanceof Port) {
        console.log("todo: create port instance");
        let sceneInstance = await this.instanceUtility.getTabContextSceneInstance();
        instance = await this.instanceCreationHandler.createPortInstance(
          this.instanceCreationHandler.create_UUID(),
          object.uuid,
          this.globalObjectInstance.mockClassInstance,
          sceneInstance
        );
        this.globalObjectInstance.current_port_instance = instance as PortInstance;
        sceneInstance.port_instances = [instance];

        console.log("todo: add port instance to scene");
      }

      //this evaluates the dynamic functions in the vizRep 
      const geometry_string = this.parseObj(this.object.geometry as unknown as string);

      const stringFunction = geometry_string;

      //parse the string function from the metamodel to a js function
      const metaFunction = await this.metaUtility.parseMetaFunction(stringFunction);

      //reset gc instance
      await this.gc.resetInstance();

      //we store the metafunction in the class_instance. With that we can recalculate the objects if necessary
      //class_instance.geometry = metaFunction;

      //we call the function that is stored in the metamodel
      await this.gc.runVizRepFunction(metaFunction);
      // we call the function for drawing the information in the gc
      let classObject3D;

      //if relationclass
      if (this.object instanceof Relationclass) {

        // draw start and end object

        const startObjecPoint: THREE.Vector3 = new THREE.Vector3(-1, 0, 0);
        const endObjectPoint: THREE.Vector3 = new THREE.Vector3(1, 0, 0);

        // create two very small spheres to visualize the start and end points
        const startSphere = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        const endSphere = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        startSphere.position.x = startObjecPoint.x - 0.1;
        startSphere.position.y = startObjecPoint.y;
        startSphere.position.z = startObjecPoint.z;
        endSphere.position.x = endObjectPoint.x + 0.1;
        endSphere.position.y = endObjectPoint.y;
        endSphere.position.z = endObjectPoint.z;



        this.globalObjectInstance.scene.add(startSphere, endSphere);

        classObject3D = await this.gc.drawVizRep_rel();

        const correspondingSceneObject = await this.globalObjectInstance.scene.getObjectByProperty('uuid', this.globalObjectInstance.current_class_instance.uuid, true);

        // set promObject and toObject
        this.instanceCreationHandler.addPointToClassInstance(instance as RelationclassInstance, startSphere);
        this.instanceCreationHandler.addPointToClassInstance(instance as RelationclassInstance, endSphere);

        //add line points
        this.instanceCreationHandler.addLinePoint(correspondingSceneObject, startObjecPoint, startSphere);
        this.instanceCreationHandler.addLastLinePoint(correspondingSceneObject, endSphere);

        // set the start and end position of the line2
        this.lineUpdateService.setPos(correspondingSceneObject as Line2);
        this.globalObjectInstance.render = true;
      }
      //else
      else {
        classObject3D = await this.gc.drawVizRep(new THREE.Vector3(0, 0, 0), instance as ClassInstance);
        this.globalObjectInstance.render = true;
      }

      console.log("todo: add attributewindow");
      this.globalSelectedObject.setObject(classObject3D as THREE.Mesh);

      this.eventAggregator.publish("removeAttributeGui");

      setTimeout(() => {
        this.eventAggregator.publish('updateAttributeGui');
      }, 100);
    }
  }

  // //-------------------------------------------------
  // //helper functions
  // //-------------------------------------------------

  async createNewScene() {

    if (this.metaUtility.checkIfSceneType(this.sceneType)) {
      //create a new scene instance
      this.sceneInstance = new SceneInstance(this.instanceCreationHandler.create_UUID(), this.sceneType.uuid);
      this.sceneInstance.name = 'MockSceneInstance';

      this.logger.log(`SceneInstance with name ${this.sceneInstance.name} created`, "info");
    }
    return this.sceneInstance;
  }

  parseObj(obj: string) {
    const ret: string = Function('"use strict";return (' + obj + ')')();
    return ret;
  }



  async initTree() {


    // assign the fetched sceneTypes to the sceneTypes array
    this.sceneTypes = [this.sceneType];
    // add empty children array to sceneTypes
    for (const sceneType of this.sceneTypes) {
      sceneType["children"] = [];
    }
    // assign the sceneTypes array to the tree
    this.tree = this.sceneTypes;
    // assign the sceneTypes array to the globalObjectInstance
    this.globalObjectInstance.sceneTypes = this.sceneTypes;


    // for each sceneType in the sceneTypes array
    for (const sceneType of this.sceneTypes) {


      // push the sceneInstance to the sceneInstances array
      this.sceneInstances.push(this.sceneInstance);
      // get the index of the sceneType in the tree
      const index = this.tree.findIndex((item) => item.uuid === sceneType.uuid);
      // if the sceneType does not have any children
      if (this.tree[index].children === undefined) {
        // create a children array for the sceneType
        this.tree[index].children = [];
      }
      // push the sceneInstance to the sceneType's children array
      this.tree[index].children.push(this.sceneInstance);

    }

    this.globalObjectInstance.sceneTree = this.tree;
  }

  async getImage(obj: Class | Relationclass | Port) {
    const geometry = obj.geometry;
    const icon = await this.globalClassObject.getIcon(geometry.toString());
    return icon;
  }

  async setIcons() {
    //call getImage on all Classes of globalObjectInstance.tabContext[globalObjectInstance.selectedTab].sceneType.classes
    const classes = this.globalObjectInstance.classes;
    const relations = this.globalObjectInstance.relationClasses;
    const ports = this.globalObjectInstance.ports;

    const allObjects = [...classes, ...relations, ...ports];
    for (const obj of allObjects) {
      obj["icon"] = undefined;
      const icon = await this.getImage(obj);
      obj["icon"] = icon;
    }
  }

}