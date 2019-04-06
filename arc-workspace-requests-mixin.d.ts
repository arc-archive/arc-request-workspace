/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   arc-workspace-requests-mixin.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

export {ArcWorkspaceRequestsMixin};


/**
 * This mixin is mostly created to reduce amount of code in
 * `arc-request-workspace` element.
 *
 * The mixin specializes in placing `request-panel`s in the shadow DOM
 * wiyhout using Polymer's repeater.
 *
 * Problem with repeater is that when re-arranging items or closing an
 * item in the workspace it updates every instance of the request panel
 * to the right of the changed element and this costs a lot giving that each
 * panel has to perform a lot of computation to render the view.
 *
 * This element uses repeater to rendert he tabs, however it handles the content
 * by it's own. This mixin contains implementation for DOM manipulation for
 * request panels.
 */
declare function ArcWorkspaceRequestsMixin<T extends new (...args: any[]) => {}>(base: T): T & ArcWorkspaceRequestsMixinConstructor;

interface ArcWorkspaceRequestsMixinConstructor {
  new(...args: any[]): ArcWorkspaceRequestsMixin;
}

export {ArcWorkspaceRequestsMixinConstructor};

interface ArcWorkspaceRequestsMixin {
  readonly requestTemplate: any;
}
