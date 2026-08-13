import { registerHandlebarsHelpers } from "./helpers.mjs";
import { AltCharacterSheetPF, AltNPCSheetPF } from "./sheet.mjs";

const MODULE_ID = "pf1-altsheet-reworked";

function _rerenderOpenAltSheets() {
  for (const app of Object.values(ui.windows)) {
    if (app?.element?.[0]?.classList?.contains("pf1ar-sheet")) app.render(false);
  }
}

// ─── INIT: HELPERS & SETTINGS ─────────────────────────────────────────────

Hooks.once("init", () => {
  if (game.system?.id !== "pf1") {
    console.warn(`${MODULE_ID} | Este módulo requer o sistema PF1.`);
    return;
  }

  registerHandlebarsHelpers();

  // 10x Granularity Setting (Global or Client)
  game.settings.register(MODULE_ID, "enable10xGranularity", {
    name: "Enable 10x Granularity Engine",
    hint: "Scales base dice faces (1d6 -> 1d60) and flat item/enhancement bonuses by 10x during rolls.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: _rerenderOpenAltSheets,
  });

  game.settings.register(MODULE_ID, "darkMode", {
    name: "PF1AR.Settings.DarkMode",
    scope: "client",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register(MODULE_ID, "theme", {
    name: "PF1AR.Settings.Theme",
    hint: "PF1AR.Settings.ThemeHint",
    scope: "client",
    config: true,
    type: String,
    default: "parchment",
    choices: {
      parchment: "PF1AR.Theme.Parchment",
      hybrid: "PF1AR.Theme.Hybrid",
      slate: "PF1AR.Theme.Slate",
    },
    onChange: _rerenderOpenAltSheets,
  });

  game.settings.register(MODULE_ID, "compact", {
    name: "PF1AR.Settings.Compact",
    hint: "PF1AR.Settings.CompactHint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: _rerenderOpenAltSheets,
  });

  game.settings.register(MODULE_ID, "summarySkills", {
    name: "PF1AR.Settings.SummarySkills",
    hint: "PF1AR.Settings.SummarySkillsHint",
    scope: "client",
    config: true,
    type: String,
    default: "ranked",
    choices: {
      ranked: "PF1AR.Labels.Ranked",
      class: "PF1AR.Labels.SkillsClass",
      all: "PF1AR.Labels.SkillsAll",
    },
    onChange: _rerenderOpenAltSheets,
  });

  loadTemplates([
    `modules/${MODULE_ID}/templates/character-sheet.hbs`,
    `modules/${MODULE_ID}/templates/npc-sheet.hbs`,
    `modules/${MODULE_ID}/templates/parts/summary.hbs`,
    `modules/${MODULE_ID}/templates/parts/attributes.hbs`,
    `modules/${MODULE_ID}/templates/parts/combat.hbs`,
    `modules/${MODULE_ID}/templates/parts/inventory.hbs`,
    `modules/${MODULE_ID}/templates/parts/features.hbs`,
    `modules/${MODULE_ID}/templates/parts/skills.hbs`,
    `modules/${MODULE_ID}/templates/parts/skill-list.hbs`,
    `modules/${MODULE_ID}/templates/parts/spells.hbs`,
    `modules/${MODULE_ID}/templates/parts/buffs.hbs`,
    `modules/${MODULE_ID}/templates/parts/biography.hbs`,
    `modules/${MODULE_ID}/templates/parts/notes.hbs`,
    `modules/${MODULE_ID}/templates/parts/settings.hbs`,
  ]);

  console.info(`${MODULE_ID} | init OK`);
});

// ─── READY: REGISTER SHEETS ───────────────────────────────────────────────

Hooks.once("ready", () => {
  if (game.system?.id !== "pf1") return;

  DocumentSheetConfig.registerSheet(Actor, MODULE_ID, AltCharacterSheetPF, {
    label: game.i18n.localize("PF1AR.CharacterSheetLabel"),
    types: ["character"],
    makeDefault: false,
  });

  DocumentSheetConfig.registerSheet(Actor, MODULE_ID, AltNPCSheetPF, {
    label: game.i18n.localize("PF1AR.NPCSheetLabel"),
    types: ["npc"],
    makeDefault: false,
  });

  DocumentSheetConfig.updateDefaultSheets();

  console.info(`${MODULE_ID} | sheets registradas`);
});

// ─── 10X GRANULARITY ENGINE (CORE INTERCEPTION) ───────────────────────────

Hooks.once("init", () => {
  if (typeof libWrapper === "undefined") {
    console.error(`${MODULE_ID} | libWrapper is required for the 10x Granularity Engine.`);
    return;
  }

  // 1. Intercept ALL Dice Rolls to multiply faces by 10 (1d20 -> 1d200, 1d6 -> 1d60)
  // This safely catches spells, sizeRolls, attacks, and skill checks globally.
  libWrapper.register(MODULE_ID, "Roll.prototype._evaluate", async function (wrapped, ...args) {
    if (game.settings.get(MODULE_ID, "enable10xGranularity")) {
      for (let term of this.terms) {
        if (term.faces && !term._pf1arScaled) {
          term.faces *= 10;
          term._pf1arScaled = true; // Flag prevents exponential scaling if evaluated twice
        }
      }
    }
    return wrapped(...args);
  }, "WRAPPER");

  // 2. Intercept Item Data Preparation to scale Enhancement bonuses safely.
  // This injects the 10x multiplier into the system's math pipeline without touching the database.
  libWrapper.register(MODULE_ID, "CONFIG.Item.documentClass.prototype.prepareDerivedData", function (wrapped, ...args) {
    wrapped(...args); // Let PF1e prepare data normally first
    
    if (game.system.id === "pf1" && game.settings.get(MODULE_ID, "enable10xGranularity")) {
      if (this.system?.enh) {
        this.system.enh *= 10;
      }
    }
  }, "WRAPPER");
});