import { InstanceUtility } from 'resources/services/instance_utility';
import { GlobalDefinition } from './global_definitions';
import { singleton } from 'aurelia';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import * as THREE from 'three';
import { RayHelper } from './ray_helper';
import { RelationclassInstance } from '../../../mmar-global-data-structure';

@singleton()
export class Animator {

  constructor(
    private globalObjectInstance: GlobalDefinition,
    private rayHelper: RayHelper,
    private instanceUtility: InstanceUtility
  ) {

  }

  async animate() {
    //get tabcontext sceneInstance
    let tabContextSceneInstance;

    if (this.globalObjectInstance.tabContext.length > 0) {
      tabContextSceneInstance = await this.instanceUtility.getTabContextSceneInstance();
    }


    if (this.globalObjectInstance.render) {

      this.globalObjectInstance.render = false;
      this.globalObjectInstance.renderer.render(this.globalObjectInstance.scene, this.globalObjectInstance.camera);


      ////////////////////////////////////////
      //if normal camera is active
      ////////////////////////////////////////

      if (this.globalObjectInstance.camera == this.globalObjectInstance.normalCamera && this.globalObjectInstance.tabContext.length > 0) {


        //update for orbit controls
        if (this.globalObjectInstance.camera == this.globalObjectInstance.normalCamera)
          this.globalObjectInstance.orbitControls.update();
      }


    }
  }



  // This method calculates the middle point of a line. It is used in the setPos method to update the position of the line.
  async calculateMiddlePoint(line: Line2, pos: number[]) {
    //calculate middle point of the line
    // Step 1: Compute total length of the line
    let totalLength = 0;
    let segmentLengths: number[] = []; // Store individual segment lengths

    for (let i = 3; i < pos.length; i += 3) {
      let p1 = new THREE.Vector3(pos[i - 3], pos[i - 2], pos[i - 1]);
      let p2 = new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2]);

      let segmentLength = p1.distanceTo(p2);
      segmentLengths.push(segmentLength);
      totalLength += segmentLength;
    }

    // Step 2: Find the segment where the half-length occurs
    let halfLength = totalLength / 2;
    let accumulatedLength = 0;
    let targetIndex = 0;

    for (let i = 0; i < segmentLengths.length; i++) {
      accumulatedLength += segmentLengths[i];
      if (accumulatedLength >= halfLength) {
        targetIndex = i;
        break;
      }
    }

    // Step 3: Interpolate the exact halfway position
    let p1 = new THREE.Vector3(pos[targetIndex * 3], pos[targetIndex * 3 + 1], pos[targetIndex * 3 + 2]);
    let p2 = new THREE.Vector3(pos[targetIndex * 3 + 3], pos[targetIndex * 3 + 4], pos[targetIndex * 3 + 5]);

    let remainingDistance = halfLength - (accumulatedLength - segmentLengths[targetIndex]);
    let ratio = remainingDistance / segmentLengths[targetIndex]; // Ratio for interpolation

    let midPoint = new THREE.Vector3().lerpVectors(p1, p2, ratio);
    // add midPoint to userData to use it somewhere else
    line.userData.midPoint = midPoint;
  }

}
