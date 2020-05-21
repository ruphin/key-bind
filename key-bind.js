/**
 * @license
 * MIT License
 *
 * Copyright (c) 2020 Goffert van Gool
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const keyListeners = {};
const KEY = "key";
const OVERRIDE = "override";

const handleKeydown = (event) => {
  const { defaultPrevented, key } = event;

  if (defaultPrevented) {
    // Do nothing if the key event was already consumed
    console.warn("Keypress ignored!");
    return;
  }

  const elements = keyListeners[key] || [];
  elements.every((element) => {
    const { offsetParent, override } = element;
    // Only fire on elements that are not in a hidden subtree in the DOM
    if (offsetParent !== null) {
      // An element is handling this key,
      event.stopPropagation();
      element.click();
      // If the element is not an override, return true to keep iterating over elements
      return !override;
    }
  });
};

window.addEventListener("keydown", handleKeydown, true);

export class KeyBind extends HTMLElement {
  static get observedAttributes() {
    return [KEY, OVERRIDE];
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    if (attr === KEY) {
      this._listen(newValue, oldValue);
    } else if (attr === OVERRIDE) {
      this._override(this.key);
    }
  }

  set key(key) {
    if (key) {
      this.setAttribute(KEY, key);
    } else {
      this.removeAttribute(KEY);
    }
  }

  get key() {
    return this.getAttribute(KEY);
  }

  set override(override) {
    this.toggleAttribute(OVERRIDE, override);
  }

  get override() {
    return this.hasAttribute(OVERRIDE);
  }

  // Start listening to a key
  _listen(newKey, oldKey) {
    // If this element was previously listenening to a key, unregister it for that key
    if (oldKey && keyListeners[oldKey]) {
      const elements = keyListeners[oldKey];
      const i = elements.indexOf(this);
      if (i != -1) {
        elements.splice(i, 1);
      }
    }
    if (newKey) {
      const elements = keyListeners[newKey] || [];
      keyListeners[newKey] = elements;

      if (this.override) {
        elements.unshift(this);
      } else {
        elements.push(this);
      }
    }
  }

  // Places this element first in the listener list for this key
  _override(key) {
    if (key && keyListeners[key]) {
      const elements = keyListeners[key];
      const i = elements.indexOf(this);
      if (i != -1) {
        elements.splice(i, 1);
        elements.unshift(this);
      }
    }
  }
}

customElements.define("key-bind", KeyBind);
