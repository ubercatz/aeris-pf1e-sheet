import './style.css'; // MUST BE BEFORE REACT OR APP IMPORTS
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

class AerisReactSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeris-pf1e-react-sheet",
      classes: ["pf1e", "sheet", "actor"],
      template: "",
      width: 800,
      height: 700,
      resizable: true,
      submitOnClose: false,
      submitOnChange: false
    });
  }

  async _renderInner(data) {
    const form = document.createElement("form");
    form.className = "react-sheet-container";
    form.style.height = "100%";
    form.setAttribute("autocomplete", "off");
    form.addEventListener("submit", (e) => e.preventDefault()); // Extra safety block
    return $(form);
  }

  activateListeners(html) {
    super.activateListeners(html);
    const container = html[0]; 

    if (!this.reactRoot) {
      this.reactRoot = createRoot(container);
    }
    
    this.reactRoot.render(React.createElement(App, { actor: this.actor, sheet: this }));
  }

  async close(options = {}) {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    return super.close(options);
  }
}

Hooks.once('init', () => {
  Actors.registerSheet("pf1", AerisReactSheet, {
    types: ["character"],
    makeDefault: false,
    label: "Aeris React Sheet"
  });
});