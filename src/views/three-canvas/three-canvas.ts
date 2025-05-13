import { KeyboardHandler } from 'resources/keyboard_handler';
import { GlobalDefinition } from 'resources/global_definitions';
import { InstanceUtility } from 'resources/services/instance_utility';
import { LineUpdateService } from 'resources/services/line_update_service';

export class ThreeCanvas {

  // we inject here the keyboardHandler functions
  // do not delete
  constructor(
    private globalObjectInstance: GlobalDefinition,
    // do not delete
    private keyboardHandler: KeyboardHandler,
    private instanceUtility: InstanceUtility,
    private lineUpdateService: LineUpdateService

  ) {
  }

  attached() {
    //get html element by id
    const element = document.getElementById('container');
    this.globalObjectInstance.elementContainer = element;

    // set steady rendering at least every second
    //set intervall
    setInterval(async () => {
      this.globalObjectInstance.render = true;

      await this.checkForLineToUpdate();
    }, 1000);


  }

  async checkForLineToUpdate() {
    // for each relationclasInstance
    // get the relationclass instance from the tab context
    // and update the line if there is one
    let sceneInstance = await this.instanceUtility.getTabContextSceneInstance();
    if (sceneInstance?.relationclasses_instances.length > 0) {
      let uuid = sceneInstance.relationclasses_instances[0].uuid;

      let threeScene = await this.instanceUtility.getTabContextThreeInstance();
      // console.log('threeScene', threeScene);
      // console.log('uuid', uuid);
      let line = threeScene.getObjectByProperty('uuid', uuid);
      // console.log('line', line);
      line ? this.lineUpdateService.setPos(line) : null;
    }
  }
}


