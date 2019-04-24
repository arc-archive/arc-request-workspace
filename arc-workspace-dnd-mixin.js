import {dedupingMixin} from '../../@polymer/polymer/lib/utils/mixin.js';
import {afterNextRender, flush} from '../../@polymer/polymer/lib/utils/render-status.js';
/**
 * This mixin is to reduce amount of code in `arc-request-workspace` element
 * and to separate drag and drop for tabs logic.
 *
 * @mixinFunction
 * @polymer
 */
export const ArcWorkspaceDndMixin = dedupingMixin((base) => {
  /**
   * @polymer
   * @mixinClass
   */
  class ArcWorkspaceDndMixin extends base {
    static get properties() {
      return {
        /**
         * Adds draggable property to the request list item element.
         * The `dataTransfer` object has `arc/request-object` mime type with
         * serialized JSON with request model.
         */
        draggableEnabled: {type: Boolean, value: false, observer: '_draggableChanged'}
      };
    }

    constructor() {
      super();
      this._dragoverHandler = this._dragoverHandler.bind(this);
      this._dragleaveHandler = this._dragleaveHandler.bind(this);
      this._dropHandler = this._dropHandler.bind(this);
      this._resetReorderState();
    }

    connectedCallback() {
      super.connectedCallback();
      if (this.draggableEnabled) {
        this._addDndEvents();
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._removeDndEvents();
    }

    _draggableChanged(value) {
      if (value) {
        this._addDndEvents();
      } else {
        this._removeDndEvents();
      }
    }

    _addDndEvents() {
      if (this.__dndAdded) {
        return;
      }
      this.__dndAdded = true;
      this.$.tabs.addEventListener('dragover', this._dragoverHandler);
      this.$.tabs.addEventListener('dragleave', this._dragleaveHandler);
      this.$.tabs.addEventListener('drop', this._dropHandler);
    }

    _removeDndEvents() {
      if (!this.__dndAdded) {
        return;
      }
      this.__dndAdded = false;
      this.$.tabs.removeEventListener('dragover', this._dragoverHandler);
      this.$.tabs.removeEventListener('dragleave', this._dragleaveHandler);
      this.$.tabs.removeEventListener('drop', this._dropHandler);
    }

    /**
     * Handler for the `dragstart` event added to the list item when `draggableEnabled`
     * is set to true.
     * This function sets request data on the `dataTransfer` object with `arc/request-object`
     * mime type. The request data is a serialized JSON with request model.
     * @param {Event} e
     */
    _dragStart(e) {
      if (!this.draggableEnabled) {
        return;
      }
      const request = e.model.get('item');
      const data = JSON.stringify(request);
      e.dataTransfer.setData('arc/request-object', data);
      if (request.type === 'saved') {
        e.dataTransfer.setData('arc/saved-request', request._id);
      } else if (request.type === 'history') {
        e.dataTransfer.setData('arc/history-request', request._id);
      }
      e.dataTransfer.setData('arc-source/requests-workspace', request._id);
      e.dataTransfer.effectAllowed = 'copyMove';
      this._startReorderDrag(e);
      const target = e.currentTarget;
      afterNextRender(this, () => this._removeTabSelectionColor(target));
    }
    /**
     * Memorizes and removes tabs selection colors. It can be restored by calling `_resetReorderStyles()`.
     * @param {Element} target Dragged element.
     */
    _removeTabSelectionColor(target) {
      const style = getComputedStyle(this);
      this.__tabsSelectionColor = style.getPropertyValue('--paper-tabs-selection-bar-color').trim();
      this.__tabsSelectionColor2 = style.getPropertyValue('--paper-tabs-selection-bar_-_border-color').trim();
      this.$.tabs.style.setProperty('--paper-tabs-selection-bar-color', 'transparent');
      this.$.tabs.style.setProperty('--paper-tabs-selection-bar_-_border-color', 'transparent');
      this.__tabsInitialDisplay = target.style.display;
      target.style.visibility = 'hidden';
    }
    /**
     * Starts tabs reordering action.
     * @param {DragEvent} e
     */
    _startReorderDrag(e) {
      const element = e.currentTarget;
      const model = e.model;
      this.__reorderInfo.type = 'track';
      this.__reorderInfo.dragElement = element;
      this.__reorderInfo.dragModel = model;
      this.__reorderInfo.dragIndex = model.get('index');
      this._blockEditors();
    }
    /**
     * Handler for the dragend event. It only performs an action when reordering
     * is active.
     * @param {DragEvent} e
     */
    _dragEnd(e) {
      if (this.__reorderInfo.type === 'track') {
        this._finishReorder(e);
        this.refreshTabs();
        this._unblockEditors();
      }
    }
    /**
     * Reorders tabs and resets workspace state.
     * @param {DragEvent} e
     */
    _finishReorder(e) {
      this._removeRipples(this.__reorderInfo.dragElement);
      const toIdx = this._rearrangeReorder();
      this._resetReorderChildren();
      if (toIdx || toIdx === 0) {
        this.selected = toIdx;
      }
      this._resetReorderState();
      this._resetReorderStyles(e);
    }
    /**
     * Removes ripple effect from paper-tab element
     * @param {Element} paperTab Instance of `paper-tab`.
     */
    _removeRipples(paperTab) {
      const ripple = paperTab.shadowRoot.querySelector('paper-ripple');
      if (!ripple) {
        return;
      }
      for (let i = ripple.ripples.length - 1; i >= 0; i--) {
        ripple.removeRipple(ripple.ripples[i]);
      }
    }
    /**
     * Moves a tab to corresponding position when drag finishes.
     * @return {Number|undefined} Position where the request has been moved to.
     */
    _rearrangeReorder() {
      const fromIdx = this.__reorderInfo.dragIndex;
      let toIdx;
      if (fromIdx >= 0 && this.__reorderInfo.overIndex >= 0) {
        toIdx = this.__reorderInfo.overIndex;
        const item = this.splice('activeRequests', fromIdx, 1)[0];
        this.splice('activeRequests', toIdx, 0, item);
      }
      return toIdx;
    }
    /**
     * Resets tabs selection styles and drag target visibility when reorder finishes.
     * @param {DragEvent} e
     */
    _resetReorderStyles(e) {
      e.currentTarget.style.visibility = 'visible';
      this.$.tabs.style.setProperty('--paper-tabs-selection-bar-color', this.__tabsSelectionColor);
      this.$.tabs.style.setProperty('--paper-tabs-selection-bar_-_border-color', this.__tabsSelectionColor2);
    }
    /**
     * Resets styles of paper-tabs that has been moved during reorder action.
     */
    _resetReorderChildren() {
      const children = this.$.tabs.querySelectorAll('paper-tab');
      for (let i = 0, len = children.length; i < len; i++) {
        children[i].style.transform = '';
        children[i].classList.remove('moving');
      }
    }
    /**
     * Computes value for the `draggable` property of the list item.
     * When `draggableEnabled` is set it returns true which is one of the
     * conditions to enable drag and drop on an element.
     * @param {Boolean} draggableEnabled Current value of `draggableEnabled`
     * @return {String} `true` or `false` (as string) depending on the argument.
     */
    _computeDraggableValue(draggableEnabled) {
      return draggableEnabled ? 'true' : 'false';
    }
    /**
     * Resets state of the reorder info object.
     */
    _resetReorderState() {
      this.__reorderInfo = {type: 'start', moves: []};
    }
    /**
     * Handler for `dragover` event on this element. If the dagged item is compatible
     * it renders drop message.
     * @param {DragEvent} e
     */
    _dragoverHandler(e) {
      if (!this.draggableEnabled) {
        return;
      }
      if (e.dataTransfer.types.indexOf('arc/request-object') === -1 &&
        e.dataTransfer.types.indexOf('arc/project-object') === -1) {
        return;
      }
      e.preventDefault();
      if (e.dataTransfer.types.indexOf('arc-source/requests-workspace') !== -1) {
        e.dataTransfer.dropEffect = 'move';
        this._reorderDragover(e);
      } else {
        e.dataTransfer.dropEffect = 'copy';
        this._newTabDragover(e);
      }
    }
    /**
     * Handles `dragover` event when in reoedering model.
     * It updates tabs position and sets variables later used to compute position.
     * @param {DragEvent} e
     */
    _reorderDragover(e) {
      if (this.__reorderInfo.type !== 'track') {
        return;
      }
      this._updateReorderMoves(e);
      const ddx = this._getReorderDdx();
      this._updateTabPosition(ddx, e.clientX);
      const dragElement = this._getReorderedItem(e);
      if (!dragElement) {
        return;
      }
      const model = this.$.tabsRepeater.modelForElement(dragElement);
      this.__reorderInfo.dirOffset = ddx < 0 ? -1 : 0;
      this.__reorderInfo.overModel = model;
      const lastOverIndex = this.__reorderInfo.overIndex || 0;
      const overIndex = model.index + this.__reorderInfo.dirOffset;
      const start = Math.max(overIndex < lastOverIndex ? overIndex : lastOverIndex, 0);
      const end = model.index < lastOverIndex ? lastOverIndex : model.index;
      const draggedIndex = this.__reorderInfo.dragIndex;
      this._updateChildrenReorder(start, end, draggedIndex, overIndex);
      this.__reorderInfo.overIndex = model.index;
    }
    /**
     * Computes the delat from previous move.
     * @return {Number} When negative it is moving left and moving right othewise.
     */
    _getReorderDdx() {
      let secondlast = this.__reorderInfo.moves[this.__reorderInfo.moves.length - 2];
      let lastmove = this.__reorderInfo.moves[this.__reorderInfo.moves.length - 1];
      let ddx = 0;
      if (secondlast) {
        ddx = lastmove.x - secondlast.x;
      }
      return ddx;
    }
    /**
     * Adds (x,y) coordinates of the current move. It is later use to compute
     * the delta.
     * @param {DragEvent} e
     */
    _updateReorderMoves(e) {
      this.__reorderInfo.moves.push({x: e.clientX, y: e.clientY});
    }
    /**
     * Updates position of the children in `paper-tab` container while tracking
     * an item.
     * @param {Number} start Change start index.
     * @param {Number} end Change end index.
     * @param {Number} draggedIndex Index of the tab being dragged.
     * @param {Number} overIndex Index of the tab being under the pointer.
     */
    _updateChildrenReorder(start, end, draggedIndex, overIndex) {
      const children = this.$.tabs.querySelectorAll('paper-tab');
      const dragElement = children[draggedIndex];
      for (let i = start; i <= end; i++) {
        const el = children[i];
        if (i !== draggedIndex) {
          let dir = 0;
          if (i > draggedIndex && i <= overIndex) {
            dir = -1;
          } else if (i > overIndex && i < draggedIndex) {
            dir = 1;
          }
          el.classList.add('moving');
          const offset = dir * dragElement.offsetWidth;
          el.style.transform = `translate3d(${offset}px, 0px, 0px)`;
        }
      }
    }
    /**
     * Handler for `dragleave` event on this element. If the dagged item is compatible
     * it hides drop message.
     * @param {DragEvent} e
     */
    _dragleaveHandler(e) {
      if (!this.draggableEnabled) {
        return;
      }
      if (e.dataTransfer.types.indexOf('arc/request-object') === -1 &&
        e.dataTransfer.types.indexOf('arc/project-object') === -1) {
        return;
      }
      e.preventDefault();
      this._removeDropPointer();
      this.__dropPointerReference = undefined;
    }
    /**
     * Handler for `drag` event on this element. If the dagged item is compatible
     * it adds request to saved requests.
     * @param {DragEvent} e
     */
    _dropHandler(e) {
      if (!this.draggableEnabled) {
        return;
      }
      if (this.__reorderInfo.type === 'track') {
        // This is reorder drop
        return;
      }
      const isRequest = e.dataTransfer.types.indexOf('arc/request-object') !== -1;
      const isProject = e.dataTransfer.types.indexOf('arc/project-object') !== -1;
      if (!isRequest && !isProject) {
        return;
      }
      e.preventDefault();
      this._removeDropPointer();
      if (isRequest) {
        this._dropRequest(e);
      } else {
        this._dropProject(e);
      }
      this.__dropPointerReference = undefined;
    }
    /**
     * Adds a request to the workspace.
     * It reads request data from the event and depending on keys configuration
     * either add request to the workspace or repace existing requests.
     * @param {DragEvent} e Original event.
     */
    _dropRequest(e) {
      const data = e.dataTransfer.getData('arc/request-object');
      const request = JSON.parse(data);
      if (e.ctrlKey || e.metaKey) {
        this.clearWorkspace(true);
        this.appendRequest(request);
      } else {
        const order = this._computeDropOrder();
        this.appendRequestAt(order, request);
      }
    }
    /**
     * Adds project to the dowspace.
     * It reads project data from the event and depending on keys configuration
     * either add requests to the workspace or repace existing requests.
     * @param {DragEvent} e Original event.
     */
    _dropProject(e) {
      const data = e.dataTransfer.getData('arc/project-object');
      const project = JSON.parse(data);
      if (e.ctrlKey || e.metaKey) {
        this.clearWorkspace(true);
        this.appendByProject(project);
      } else {
        const order = this._computeDropOrder();
        this.appendByProject(project, order);
      }
    }
    /**
     * Computes index of the drop.
     * @return {Number} Index where to drop the object.
     */
    _computeDropOrder() {
      const dropRef = this.__dropPointerReference;
      let order;
      if (dropRef) {
        if (dropRef.nodeName === 'DOM-REPEAT') {
          order = this.activeRequests.length;
        } else {
          const model = this.$.tabsRepeater.modelForElement(dropRef);
          order = model.get('index');
        }
      } else {
        order = this.activeRequests.length;
      }
      return order;
    }
    /**
     * Sets `readonly` state on all editors
     */
    _blockEditors() {
      const nodes = this.shadowRoot.querySelectorAll('request-panel');
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].readonly = true;
      }
    }
    /**
     * Removes `readonly` state from all editors
     */
    _unblockEditors() {
      flush();
      afterNextRender(this, () => {
        const nodes = this.shadowRoot.querySelectorAll('request-panel');
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].readonly = false;
        }
      });
    }
    /**
     * Gets the top level item from the DOM repeater that has been marked as a
     * draggable item.
     * The event can originate from child elements which shouldn't be dragged.
     *
     * @param {Event} e The track event
     * @return {HTMLElement} An element that is container for draggable items. Undefined if couldn't
     * find.
     */
    _getReorderedItem(e) {
      const elmName = 'PAPER-TAB';
      if (e.target.nodeName === elmName) {
        return e.target;
      }
      const path = e.composedPath();
      if (!path || !path.length) {
        return;
      }
      for (let i = 0, len = path.length; i < len; i++) {
        const node = path[i];
        if (node.nodeName === elmName) {
          return path[i];
        }
      }
    }
    /**
     * Scrolls tabs right or left depending on dragged element position.
     * @param {Number} ddx delta from last tracked position
     * @param {Number} x Current pointer's x position
     */
    _updateTabPosition(ddx, x) {
      const tabsRect = this.$.tabs.$.tabsContainer.getBoundingClientRect();
      if (ddx > 0) {
        const mostRigth = tabsRect.x + tabsRect.width;
        if (x > mostRigth) {
          this.$.tabs._affectScroll(ddx * 5);
        }
      } else if (ddx < 0) {
        if (x < tabsRect.x) {
          this.$.tabs._affectScroll(ddx * 5);
        }
      }
    }
    /**
     * Action to handle dragover event when not in reorder mode.
     * @param {DragEvent} e
     */
    _newTabDragover(e) {
      const path = e.path || e.composedPath();
      const item = path.find((node) => node.nodeName === 'PAPER-TAB');
      if (!item) {
        return;
      }
      const rect = item.getClientRects()[0];
      const aboveHalf = (rect.x + rect.width/2) > e.x;
      const ref = aboveHalf ? item : item.nextElementSibling;
      if (!ref || this.__dropPointerReference === ref) {
        return;
      }
      this._removeDropPointer();
      this.__dropPointerReference = ref;
      this._createDropPointer(ref);
    }
    /**
     * Removes drop pointer from shadow root.
     */
    _removeDropPointer() {
      if (!this.__dropPointer) {
        return;
      }
      this.shadowRoot.removeChild(this.__dropPointer);
      this.__dropPointer = undefined;
    }
    /**
     * Removes drop pointer to shadow root.
     * @param {Element} ref A list item to be used as a reference point.
     */
    _createDropPointer(ref) {
      let toLetf = false;
      if (ref.nodeName === 'DOM-REPEAT') {
        // was last element
        toLetf = true;
        ref = ref.previousElementSibling;
      }
      const rect = ref.getClientRects()[0];
      const div = document.createElement('div');
      div.className = 'drop-pointer';
      const ownRect = this.getClientRects()[0];
      let leftPosition = rect.x - ownRect.x;
      if (toLetf) {
        leftPosition += rect.width;
      }
      leftPosition -= 10; // some padding
      div.style.left = leftPosition + 'px';
      this.__dropPointer = div;
      this.shadowRoot.appendChild(div);
    }
  }
  return ArcWorkspaceDndMixin;
});