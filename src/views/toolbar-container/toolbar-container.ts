import { GlobalDefinition } from "../../resources/global_definitions";
import { Logger } from "resources/services/logger";

export class ToolbarContainer {


    constructor(
        private logger: Logger,
        private globalObjectInstance: GlobalDefinition,
    ) { }

    zoomIn() {
        this.logger.log('zoomIn', 'info');
    }

    zoomOut() {
        this.logger.log('zoomOut', 'info');
    }

    undo() {
        this.logger.log('undo', 'info');
    }

    redo() {
        this.logger.log('redo', 'info');
    }

    delete() {
        this.logger.log('delete', 'info');
    }
    

    copy() {
        console.log('copy');
    }

    paste() {
        console.log('paste');
    }

    removeJWT(){
        localStorage.removeItem("jwtToken");
        //reload page
        location.reload();
    }
    
}
