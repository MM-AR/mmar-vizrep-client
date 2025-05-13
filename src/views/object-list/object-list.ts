import {bindable, customElement, EventAggregator, IDisposable, inject,} from "aurelia";
import {SelectedObjectService} from "../../resources/services/selected-object";
import {MetaObject} from "../../../../mmar-global-data-structure/models/meta/Metamodel_metaobjects.structure";
import { FetchHelper } from "resources/services/fetchHelper";

@customElement("object-list")
@inject(EventAggregator)
@inject(SelectedObjectService)
export class objectList {
    @bindable objectList: MetaObject[] = [];
    @bindable type = "";
    selectedobject: MetaObject;
    searchTerm: string = "";
    filteredItems: MetaObject[] = [];
    private subscription: IDisposable;

    constructor(
        private eventAggregator: EventAggregator,
        private selectedObjectService: SelectedObjectService,
        private fetchHelper: FetchHelper,
    ) {
    }

    async attached() {
        // sort the object alphabetically
        this.objectList.sort((a, b) => a.name.localeCompare(b.name));
        this.filteredItems = this.objectList;
        this.subscription = this.eventAggregator.subscribe(
            "SelectedObjectChanged",
            (payload: { selectedObject: MetaObject; type: string }) => {
                this.selectedobject = payload.selectedObject;
            },
        );
    }


    detaching() {
        this.subscription.dispose();
    }



    filterItems() {
        if (this.searchTerm) {
            const searchTermLower = this.searchTerm.toLowerCase();
            this.filteredItems = this.objectList.filter((item) => {
                return item.name.toLowerCase().includes(searchTermLower);
            });
        } else {
            // If no search term, display all items
            this.filteredItems = this.objectList;
        }
    }
}
