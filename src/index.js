import './style.css';
import { AerisActorSheet } from 'aeris-core';
import App from './App.jsx';

class CustomPF1eReactSheet extends AerisActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeris-pf1e-react-sheet",
      classes: ["pf1e", "sheet", "actor"],
      width: 800,
      height: 700,
    });
  }

  get reactComponent() {
    return App;
  }
}

// Register the sheet with Foundry
Hooks.once("init", () => {
  Actors.registerSheet("pf1", CustomPF1eReactSheet, {
    types: ["character"],
    makeDefault: false,
    label: "Aeris Core React Sheet"
  });
});