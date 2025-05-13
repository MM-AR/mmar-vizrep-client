import { GlobalDefinition } from "resources/global_definitions";
import { EventAggregator } from "aurelia";
import { observable } from "aurelia";
import { FetchHelper } from "resources/services/fetchHelper";
import { Class, Port, Relationclass } from "../../../../mmar-global-data-structure";
import { objectList } from "views/object-list/object-list";
import { SelectedObjectService } from "resources/services/selected-object";

export class LeftNav {


    @observable isLoadingClasses = true;
    @observable isLoadingRelationClasses = true;
    @observable isLoadingPorts = true;
    objectList: objectList[] = [];

    constructor(
        private eventAggregator: EventAggregator,
        private fetchHelper: FetchHelper,
        private selectedObjectService: SelectedObjectService,
        private globalObjectInstance: GlobalDefinition
    ) { }

    async attached() {
        this.isLoadingClasses = true;
        this.isLoadingRelationClasses = true;
        this.isLoadingPorts = true;

        setTimeout(async () => {


            const intervalId: NodeJS.Timeout = setInterval(async () => {

                // check if there is a jwt in the local storage
                const jwt = localStorage.getItem("jwtToken");
                if (jwt) {
                    clearInterval(intervalId); // stop the interval

                    // do the fetching of the data
                    const sceneType = this.globalObjectInstance.sceneTypes[0];

                    const classes: Class[] = await this.fetchHelper.classesAllGET();
                    this.globalObjectInstance.classes = classes;
                    sceneType.classes = classes;

                    const relationClasses: Relationclass[] = await this.fetchHelper.relationclassesAllGET();
                    this.globalObjectInstance.relationClasses = relationClasses;
                    sceneType.relationclasses = relationClasses;

                    const ports: Port[] = await this.fetchHelper.portsAllGET();
                    this.globalObjectInstance.ports = ports;
                    sceneType.ports = ports;

                    this.selectedObjectService.setObjects(classes, "Class");
                    this.selectedObjectService.setObjects(relationClasses, "RelationClass");
                    this.selectedObjectService.setObjects(ports, "Port");
                    this.isLoadingClasses = false;
                    this.isLoadingRelationClasses = false;
                    this.isLoadingPorts = false;
                }
            }, 1000);


        }, 2000);

    }

}