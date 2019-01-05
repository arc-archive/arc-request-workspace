/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   request-panels-mixin.html
 */

declare namespace ArcComponents {


  /**
   * This misin is mostly created to reduce amount of code in
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
  function ArcWorkspaceMixin<T extends new (...args: any[]) => {}>(base: T): T & ArcWorkspaceMixinConstructor;

  interface ArcWorkspaceMixinConstructor {
    new(...args: any[]): ArcWorkspaceMixin;
  }

  interface ArcWorkspaceMixin {
  }
}