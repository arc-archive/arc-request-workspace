[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/arc-request-workspace.svg)](https://www.npmjs.com/package/@advanced-rest-client/arc-request-workspace)

[![Build Status](https://travis-ci.org/advanced-rest-client/arc-request-workspace.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/arc-request-workspace)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/arc-request-workspace)


# arc-request-workspace

A request workspace component for Advanced REST Client.

## Example:

```html
<arc-request-workspace></arc-request-workspace>
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/arc-request-workspace
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import './node_modules/@advanced-rest-client/arc-request-workspace/arc-request-workspace.js';
    </script>
  </head>
  <body>
    <arc-request-workspace></arc-request-workspace>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from './node_modules/@polymer/polymer/polymer-element.js';
import './node_modules/@advanced-rest-client/arc-request-workspace/arc-request-workspace.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <arc-request-workspace></arc-request-workspace>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/arc-request-workspace
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
