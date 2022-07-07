import Component from '@ember/component';
import { run } from '@ember/runloop';
import { Feature } from 'toolkit/extension/features/feature';

declare global {
  interface ToolkitEmberHook {
    context: Feature;
    fn(element: Element): void;
    guard?: (element: Element) => boolean;
  }

  interface EmberComponentPrototype {
    element: Element;

    didReceiveAttrs: Component['didReceiveAttrs'];
    didRender: Component['didRender'];
    didUpdate: Component['didUpdate'];
    didUpdateAttrs: Component['didUpdateAttrs'];
    willRender: Component['willRender'];
    willUpdate: Component['willUpdate'];
    didInsertElement(): void;

    _tk_didRender_hooks_?: ToolkitEmberHook[];
    _tk_didInsertElement_hooks_?: ToolkitEmberHook[];
    _tk_didUpdate_hooks_?: ToolkitEmberHook[];
  }

  interface EmberComponent extends Component, EmberComponentPrototype {
    class: {
      prototype: EmberComponentPrototype;
    };
    prototype: EmberComponentPrototype;
  }

  interface Ember {
    run: typeof run;
    Component: EmberComponent;
  }
}
