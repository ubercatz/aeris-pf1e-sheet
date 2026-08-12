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

// ─── 10X GRANULARITY ROLL INTERCEPTOR HOOK ────────────────────────────────

Hooks.on("pf1PreActorRollAttack", (action, rollData) => {
  const is10xEnabled = game.settings.get(MODULE_ID, "enable10xGranularity");
  if (!is10xEnabled) return;

  // Transform Damage Formulas dynamically inside the roll pipeline
  if (action.data?.damage?.parts) {
    for (const part of action.data.damage.parts) {
      if (!part.formula) continue;

      // 1. Scale Dice Faces (e.g., 1d6 -> 1d60, 2d10 -> 2d100)
      part.formula = part.formula.replace(/(\d+)d(\d+)/g, (match, count, faces) => {
        return `${count}d${Number(faces) * 10}`;
      });

      // 2. Scale flat integers that aren't tied to @variables (e.g., + 1 -> + 10, - 2 -> - 20)
      // Excludes @ability modifiers, ranges, or dice expressions
      part.formula = part.formula.replace(/(?<![d@\w])\b(\d+)\b(?!\s*d)/g, (match, num) => {
        return `${Number(num) * 10}`;
      });
    }
  }

  // Scale Item Enhancement Bonuses (+1 weapon -> +10 enhancement)
  if (action.item?.system?.enh) {
    action.item.system.enh *= 10;
  }
});