/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   arc-workspace-state-mixin.html
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

declare namespace ArcComponents {


  /**
   * This mixin is to reduce amount of code in `arc-request-workspace` element
   * and to separate workspace state logic.
   */
  function ArcWorkspaceStateMixin<T extends new (...args: any[]) => {}>(base: T): T & ArcWorkspaceStateMixinConstructor;

  interface ArcWorkspaceStateMixinConstructor {
    new(...args: any[]): ArcWorkspaceStateMixin;
  }

  interface ArcWorkspaceStateMixin {

    /**
     * Dispatches `workspace-state-read` event and returns it.
     */
    _dispatchWorkspaceState(): CustomEvent|null;

    /**
     * Restores workspace state.
     * It dispatches `workspace-state-read` custom event to query for workspace data
     * and restores requests if they were previously stored.
     */
    restoreWorkspace(): Promise<any>|null;

    /**
     * Called when no-model error occurred during workspace restoration.
     */
    _restoreModelError(): Promise<any>|null;

    /**
     * Restores workspace state from previously stored data.
     *
     * @param state Workspace state object
     */
    _restore(state: object|null): void;

    /**
     * Restores requests from the state object.
     *
     * @param requests List of requests to restore. When not set
     * then it adds empty request.
     */
    _restoreRequests(requests: Array<object|null>|null): void;

    /**
     * Restores selection from the state file.
     * Note, at the point of state restoriation selection won't be handled properly.
     * It has to be re-selected after state restoration is complete.
     *
     * @param selected Selected tab. When not set it selects last available
     * tab
     */
    _restoreSelected(selected: Number|null): void;

    /**
     * Restores selected environment from the state file.
     *
     * @param environment Environment to restore. Nothing happens if not set.
     */
    _restoreEnvironment(environment: String|null): void;

    /**
     * Restores workspace variables.
     * Each item must contain the following properties:
     * - variable {String} - variable name
     * - value {String} - variable value, can contain nested variables
     * - enabled {Boolean} - By default it is true, set false to disable the variable
     *
     * @param variables List of variables to restore
     */
    _restoreVariables(variables: Array<object|null>|null): void;

    /**
     * Restores workspace variables.
     *
     * @param config Workspace configuration
     */
    _restoreConfiguration(config: object|null): void;

    /**
     * Forces current selection and resets restoration flags after next
     * render.
     */
    _afterRestore(): void;

    /**
     * Serializes workspace state to a JavaScript object.
     *
     * @returns An ArcWorkspace object
     */
    serializeWorkspace(): object|null;

    /**
     * Serializes workspace configuration.
     */
    serializeConfig(): object|null;

    /**
     * Runs debouncer and after timeoout it calls `__dispatchStoreWorkspace()`
     * to dispatch store event.
     * If timer is running it's going to be cancelled and new timer set.
     */
    _notifyStoreWorkspace(): void;

    /**
     * Clears previously set storing timer.
     */
    _clearStoreTimeout(): void;

    /**
     * A handler for any of the workspace configuration options changed.
     * It notifies change to the listeners.
     */
    _workspaceConfigChanged(): void;

    /**
     * Called when workspaceReadOnly property change. Always calls
     * `_workspaceReadOnlyChanged()`.
     */
    _workspaceReadOnlyChanged(): void;
  }
}
