
import { RayHelper } from './ray_helper';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { GlobalDefinition } from 'resources/global_definitions';
import { singleton } from 'aurelia';

import * as THREE from 'three';

import { ClassInstance, PortInstance, RelationclassInstance, RoleInstance, Relationclass, Class } from '../../../mmar-global-data-structure';

import { EventAggregator } from 'aurelia';
import { MetaUtility } from './services/meta_utility';
import { InstanceUtility } from './services/instance_utility';
import { GraphicContext } from './graphic_context';

import { Logger } from './services/logger';
import { ExpressionUtility } from './expression_utility';

@singleton()
export class InteractionHandler {


  private objects: THREE.Mesh[];
  private intersects: THREE.Intersection[];
  private intersect: THREE.Intersection;

  //get programState
  private programState: string;

  //check variable
  private allowed = true;
  private dragging: boolean;

  // left == 0, right == 2
  private clickedButton: number;

  constructor(
    private globalObjectInstance: GlobalDefinition,
    private gc: GraphicContext,
    private rayHelper: RayHelper,
    private eventAggregator: EventAggregator,
    private metaUtility: MetaUtility,
    private instanceUtility: InstanceUtility,
    private logger: Logger,
    private expression: ExpressionUtility,
  ) { }





  //function that is called on mouse click

  // ------------------------------------
  // check sequence diagram in the wiki of mm-ar: https://github.com/MM-AR/mmar/wiki/InteractionHandler
  // ------------------------------------
  async onDocumentMouseDown(event: MouseEvent) {

    this.clickedButton = event.button;
    this.dragging = this.globalObjectInstance.transformControls.dragging;
    
    //set the raycaster
    this.globalObjectInstance.raycaster = this.rayHelper.shootRay(event);

    
  }

 



  // //-------------------------------------------------
  // //helper functions
  // //-------------------------------------------------

  parseObj(obj: string) {
    const ret: string = Function('"use strict";return (' + obj + ')')();
    return ret;
  }


}
