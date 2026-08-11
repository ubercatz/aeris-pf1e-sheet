import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

class AerisReactSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeris-pf1e-react-sheet",
      classes: ["pf1e", "sheet", "actor"],
      template: "", // No Handlebars template!
      width: 800,
      height: 700,
      resizable: true,
      submitOnClose: false, // Prevents Foundry from looking for form inputs to save on close
      submitOnChange: false // React will handle data updates directly
    });
  }

  async _renderInner(data) {
    // Foundry expects a <form> tag, not a <div>
    const form = document.createElement("form");
    form.className = "react-sheet-container";
    form.style.height = "100%";
    form.setAttribute("autocomplete", "off");
    return $(form);
  }

  activateListeners(html) {
    super.activateListeners(html);
    
    // html[0] is the <form> element we created above
    const container = html[0]; 

    // Create the React root only once
    if (!this.reactRoot) {
      this.reactRoot = createRoot(container);
    }
    
    // Render the React application
    this.reactRoot.render(<App actor={this.actor} sheet={this} />);
  }

  async close(options = {}) {
    // Clean up the React component before the window gets destroyed
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    return super.close(options);
  }
}

Hooks.once('init', () => {
  Actors.registerSheet("pf1e", AerisReactSheet, {
    types: ["character"],
    makeDefault: false,
    label: "Aeris React Sheet"
  });
  console.log("Aeris PF1e Sheet | Initialized");
});