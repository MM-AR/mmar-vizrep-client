import Aurelia from 'aurelia';
import { MyApp } from './my-app';
import 'monaco-editor/min/vs/editor/editor.main.css';

import { AllConfiguration } from '@aurelia-mdc-web/all';

Aurelia
  .register(AllConfiguration)
  .app(MyApp)
  .start();
