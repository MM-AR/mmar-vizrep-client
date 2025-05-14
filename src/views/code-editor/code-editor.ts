import { EventAggregator, ICustomElementViewModel } from 'aurelia';
import * as monaco from 'monaco-editor';
import { GlobalDefinition } from 'resources/global_definitions';
import { SelectedObjectService } from 'resources/services/selected-object';

import beautify from 'js-beautify';

export class CodeEditor implements ICustomElementViewModel {

  private editor!: monaco.editor.IStandaloneCodeEditor;
  private ignoreChange = false;

  constructor(
    private globalObjectInstance: GlobalDefinition,
    private eventAggregator: EventAggregator,
    private selectedObjectService: SelectedObjectService
  ) { }

  attached() {
    this.editor = monaco.editor.create(document.querySelector('#editor') as HTMLElement, {
      value: this.globalObjectInstance.codeEditorValue || '',
      language: 'javascript',
      theme: 'vs-dark',
    });

    // -------------------------------------------------------------------------------
    // this is the intellilsense documentation for the editor
    // if something changes in the documentation, it should be updated here...
    // -------------------------------------------------------------------------------
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
/**
 * Expression utility functions for attribute and relation handling.
 */
declare type ExpressionUtility = {
  /** Calls the value of the attribute instance in the local client based on the UUID of the meta attribute. */
  attrval(attrUUID: string): Promise<string>;
  /** Calls the value of the attribute instance in the local client based on the name of the meta attribute. */
  attrvalByName(attrName: string): Promise<string>;
  /** Calls the value of the attribute instance in the local client based on the UUID of any type of instance and the meta attribute UUID. */
  attrvalByInstanceUUID(instUUID: string, attrUUID: string): Promise<string>;
  /** Retrieves the attribute instance in the local client based on the UUID of any type of instance and the meta attribute UUID. */
  getAttrByInstanceUUID(instanceUUID: string, metaAttributeUUID: string): Promise<AttributeInstance>;
  /** Updates the value of the attribute instance in the local client based on the UUID of any type of instance and the meta attribute UUID. */
  setAttrvalByInstanceUUID(instanceUUID: string, metaAttributeUUID: string, value: any): void;
  /** Retrieves all class (and relation class) instances in the local client based on the UUID of the meta class. */
  getClassInstancesByMetaUUID(metaClassUUID: string): Promise<ClassInstance[]>;
  /** Retrieves the source (origin) class instance in the local client based on the UUID of the relation class instance. */
  getSourceByRelInstanceUUID(relInstanceUUID: string): Promise<ClassInstance>;
  /** Retrieves the destination (target) class instance in the local client based on the UUID of the relation class instance. */
  getDestinationByRelInstanceUUID(relInstanceUUID: string): Promise<ClassInstance>;
  /** Retrieves all relation class instances in the local client where the given instance is the destination (target) based on its UUID and optionally filters them by a specific relation type (metaClassUUID). */
  getIncomingRelationsByInstanceUUID(instanceUUID: string, metaClassUUID?: string | null): Promise<RelationclassInstance[]>;
  /** Retrieves all relation class instances in the local client where the given instance is the source (origin) based on its UUID and optionally filters them by a specific relation type (metaClassUUID). */
  getOutgoingRelationsByInstanceUUID(instanceUUID: string, metaClassUUID?: string | null): Promise<RelationclassInstance[]>;
  /** Checks if any type of instance in the local client has both incoming and outgoing relations (i.e. is connected). */
  isConnected(instanceUUID: string): Promise<boolean>;
  /** Checks if there is a visual update. */
  checkForVisualizationUpdate(): void;
  /** Checks if there is a visual update regarding a specific AttributeInstance. */
  checkForVisualizationUpdateByAttributeUUID(instanceUUID: string, metaAttributeUUID: string): void;
};

/**
 * GraphicContext class for 3D graphics operations.
 */
declare type GraphicContext = {
  /** Set a variable in the context. */
  setVariable(name: string, value: any, dynamic: boolean): void;
  /** Get a variable value from the context. */
  getVariableValue(name: string): any;
  /** Create a 3D cube object. */
  graphic_cube(width: number, height: number, depth: number, color?: string, map?: string, x_rel?: number, y_rel?: number, z_rel?: number): void;
  /** Create a 3D plane object. */
  graphic_plane(width: number, height: number, color?: string, map?: string, x_rel?: number, y_rel?: number, z_rel?: number): void;
  /** Create a 3D sphere object. */
  graphic_sphere(radius: number, widthSegments: number, heightSegments: number, color?: string, map?: string, x_rel?: number, y_rel?: number, z_rel?: number): void;
  /** Load a predefined GLTF object. */
  graphic_gltf(objectString: string, x_rel?: number, y_rel?: number, z_rel?: number): void;
  /** Create a 3D button object. */
  graphic_button(object: any, expression?: string): void;
  /** Create a 3D text object. */
  graphic_text(x_rel: number, y_rel: number, z_rel: number, size: number, color: string, att: string, pos_name_x?: string, pos_name_y?: string, pos_name_z?: string, rx?: number, ry?: number, rz?: number, rw?: number): void;
  /** Create a 3D line for relations. */
  rel_graphic_line(color: string, line_width: number, dashed: boolean, dash_scale: number, dash_size: number, gap_size: number): void;
  /** Define the from-object for a relation. */
  rel_from_object(object: any): void;
  /** Define the to-object for a relation. */
  rel_to_object(object: any): void;
  /** Add text to the from-object of a relation. */
  rel_graphic_text_from(textObject: any): void;
  /** Add text to the middle of a relation. */
  rel_graphic_text_middle(textObject: any): void;
  /** Add text to the to-object of a relation. */
  rel_graphic_text_to(textObject: any): void;
  /** Expression utility functions. */
  expression: ExpressionUtility;
};

declare const gc: GraphicContext;
`);

    // Editor -> Aurelia
    this.editor.onDidChangeModelContent(() => {
      const currentValue = this.editor.getValue();
      if (this.globalObjectInstance.codeEditorValue !== currentValue) {
        this.ignoreChange = true;
        this.globalObjectInstance.codeEditorValue = currentValue;
        this.ignoreChange = false;
      }
    });

    this.eventAggregator.subscribe('previewButtonClicked', async () => {
      await this.setEditorValueToCurrentInstance();
    });

    //event
    this.eventAggregator.subscribe('changeCodeEditorCode', () => {
      if (!this.ignoreChange) {

        let res = '';
        const code = this.globalObjectInstance.codeEditorValue || '';
        if (code) {
          const options = {
            indent_size: 2,
            break_chained_methods: true
          };


          res = beautify.js(code, options);
          this.globalObjectInstance.codeEditorValue = res;

          this.editor.setValue(this.globalObjectInstance.codeEditorValue || '');
        }
      }
    });
  }

  detached() {
    this.editor?.dispose();
  }

  async setEditorValueToCurrentInstance() {
    const object = this.selectedObjectService.getSelectedObject();
    object.geometry = this.editor.getValue() as unknown as Function;
    this.eventAggregator.publish('updatedGeometryValue');
  }
}