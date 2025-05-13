import { EventAggregator } from "aurelia";
import { GlobalDefinition } from "resources/global_definitions";
import { GlobalSelectedObject } from "resources/global_selected_object";
import { FetchHelper } from "resources/services/fetchHelper";
import { InstanceUtility } from "resources/services/instance_utility";
import { SelectedObjectService } from "resources/services/selected-object";
import { VizrepUpdateChecker } from "resources/services/vizrep_update_checker";
import { Class, Port, Relationclass } from "../../../../mmar-global-data-structure";
import { Logger } from "resources/services/logger";

export class PreviewButtons {

    constructor(
        private eventAggregator: EventAggregator,
        private vizrepUpdateChecker: VizrepUpdateChecker,
        private globalObjectInstance: GlobalDefinition,
        private globalSelectedObject: GlobalSelectedObject,
        private fetchHelper: FetchHelper,
        private selectedObjectService: SelectedObjectService,
        private logger: Logger
    ) { }

    async attached() {
        this.eventAggregator.subscribe("updatedGeometryValue", async () => {
            const currentInstance = this.globalObjectInstance.tabContext[0].sceneInstance;
            const object = this.globalObjectInstance.tabContext[0].threeScene.getObjectById(currentInstance.uuid);

            await this.vizrepUpdateChecker.checkForVizRepUpdateForce();
            this.globalSelectedObject.getObject();
        });
    }


    async preview() {
        this.eventAggregator.publish("previewButtonClicked");
    }

    async save() {
        const objectToPatch = this.selectedObjectService.getSelectedObject();
        const type = this.selectedObjectService.type

        if (type === "Class"){
            this.fetchHelper.classesPATCH(objectToPatch.uuid, objectToPatch as unknown as Class).then(() => {
                this.logger.log("Class updated successfully", "info");
            }).catch((error) => {
                this.logger.log("Error updating class:" + objectToPatch.uuid + " with message " + error, "error");
            });
        }
        else if (type === "RelationClass"){
            this.fetchHelper.relationClassesPATCH(objectToPatch.uuid, objectToPatch as unknown as Relationclass).then(() => {
                this.logger.log("Relationclass updated successfully", "info");
            }).catch((error) => {
                this.logger.log("Error updating relationclass:" + objectToPatch.uuid + " with message " + error, "error");
            });
        }
        else if (type === "Port"){
            this.fetchHelper.portsPATCH(objectToPatch.uuid, objectToPatch as unknown as Port).then(() => {
                this.logger.log("Port updated successfully", "info");
            }).catch((error) => {
                this.logger.log("Error updating port:" + objectToPatch.uuid + " with message " + error, "error");
            });
        }
    }
    }