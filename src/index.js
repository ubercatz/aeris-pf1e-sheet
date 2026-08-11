import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './style.css';

Hooks.once("init", () => {
    class CustomPF1eReactSheet extends ActorSheet {
        static get defaultOptions() {
            return foundry.utils.mergeObject(super.defaultOptions, {
                id: "aeris-pf1e-react-sheet",
                classes: ["pf1e", "sheet", "actor"],
                width: 800,
                height: 700,
            });
        }

        // Generate an empty container for React to live inside
        async _renderInner(data) {
            const div = document.createElement("div");
            div.className = "react-sheet-container";
            div.style.height = "100%";
            return $(div);
        }

        // Once the window exists on the screen, inject the React App
        activateListeners(html) {
            super.activateListeners(html);
            const target = html[0];

            if (!this._reactRoot) {
                this._reactRoot = ReactDOM.createRoot(target);
            }

            // Mount the UI and pass the Foundry actor data into it
            this._reactRoot.render(React.createElement(App, { actor: this.actor }));
        }

        // Destroy the React instance when the window closes to prevent memory leaks
        async close(options = {}) {
            if (this._reactRoot) {
                this._reactRoot.unmount();
                this._reactRoot = null;
            }
            return super.close(options);
        }
    }

    Actors.registerSheet("pf1", CustomPF1eReactSheet, {
        types: ["character"],
        makeDefault: false,
        label: "React Character Sheet"
    });
});