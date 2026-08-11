import './style.css';
import App from './App.jsx';

Hooks.once("init", () => {
    // 1. Fetch the sheet class directly from the active Aeris Core module API
    const AerisActorSheet = game.modules.get("aeris-core")?.api?.AerisActorSheet;

    if (!AerisActorSheet) {
        console.error("Aeris PF1e Sheet | Aeris Core module is not active or API is missing!");
        return;
    }

    // 2. Define your custom sheet using the Aeris Core base class
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

    // 3. Register the sheet with Foundry's Pathfinder 1e system
    Actors.registerSheet("pf1", CustomPF1eReactSheet, {
        types: ["character"],
        makeDefault: false,
        label: "Aeris React Sheet"
    });
});