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
  libWrapper.register(MODULE_ID, "Roll.prototype._evaluate", async function (wrapped, ...args) {
    if (game.settings.get(MODULE_ID, "enable10xGranularity")) {
      for (let term of this.terms) {
        if (term.faces && !term._pf1arScaled) {
          term.faces *= 10;
          term._pf1arScaled = true; 
        }
      }
    }
    return wrapped(...args);
  }, "WRAPPER");

  // 2. Intercept Item Data Preparation (Enhancements, Armor, Buffs, Debuffs)
  // We use `this._source` to pull the raw database value, preventing exponential caching loops.
  libWrapper.register(MODULE_ID, "CONFIG.Item.documentClass.prototype.prepareBaseData", function (wrapped, ...args) {
    wrapped(...args); 
    
    if (game.system.id === "pf1" && game.settings.get(MODULE_ID, "enable10xGranularity")) {
      const scaleFormula = (f) => {
        if (typeof f !== "string") return f;
        let res = f.replace(/\b(\d*)d(\d+)\b/g, (m, c, fcs) => `${c || 1}d${Number(fcs) * 10}`);
        return res.replace(/(?<![d@\w\.])\b(\d+)\b(?!\s*[d\.])/g, (m, num) => `${Number(num) * 10}`);
      };

      // Scale Armor/Shield Base AC
      if (this.system?.armor?.value !== undefined && this._source?.system?.armor?.value !== undefined) {
        this.system.armor.value = Number(this._source.system.armor.value) * 10;
      }

      // Scale Item Enhancements
      if (this.system?.enh !== undefined && this._source?.system?.enh !== undefined) {
        this.system.enh = Number(this._source.system.enh) * 10;
      }

      // Scale Buffs, Debuffs, Traits, and Feat Changes
      if (this.system?.changes && this._source?.system?.changes) {
        this.system.changes.forEach((change, i) => {
          const srcFormula = this._source.system.changes[i]?.formula;
          if (srcFormula) {
            change.formula = scaleFormula(String(srcFormula));
          }
        });
      }
    }
  }, "WRAPPER");

  // 3. Intercept Actor Data Preparation (Skills, FCB, BAB, Saves, SR, Base AC)
  libWrapper.register(MODULE_ID, "CONFIG.Actor.documentClass.prototype.prepareDerivedData", function (wrapped, ...args) {
    wrapped(...args); // Let PF1e calculate normal totals first
    
    if (game.system.id === "pf1" && game.settings.get(MODULE_ID, "enable10xGranularity")) {
      
      // A. Scale Skills (Everything EXCEPT the Ability Modifier)
      if (this.system?.skills) {
        for (const [skillId, skill] of Object.entries(this.system.skills)) {
          if (skill.mod !== undefined) {
            const ablMod = this.system.abilities?.[skill.ability]?.mod || 0;
            const nonAbilityMod = skill.mod - ablMod; 
            skill.mod = ablMod + (nonAbilityMod * 10);
          }
          if (skill.subSkills) {
            for (const [subId, subSkill] of Object.entries(skill.subSkills)) {
              if (subSkill.mod !== undefined) {
                const ablMod = this.system.abilities?.[subSkill.ability]?.mod || 0;
                const nonAbilityMod = subSkill.mod - ablMod;
                subSkill.mod = ablMod + (nonAbilityMod * 10);
              }
            }
          }
        }
      }

      // B. Scale Favored Class Bonus (FCB) for HP
      let totalFcbHp = 0;
      for (const item of this.items) {
        if (item.type === "class" && item.system?.fc?.hp?.value) {
          totalFcbHp += item.system.fc.hp.value;
        }
      }
      if (totalFcbHp > 0 && this.system.attributes?.hp) {
        this.system.attributes.hp.max += (totalFcbHp * 9);
      }

      // C. Scale Base Attack Bonus (BAB)
      if (this.system.attributes?.bab?.total !== undefined) {
        const extraBab = this.system.attributes.bab.total * 9;
        this.system.attributes.bab.total += extraBab;
      }

      // D. Scale Base Class Saving Throws
      if (this.system.attributes?.savingThrows) {
        for (let save of Object.values(this.system.attributes.savingThrows)) {
          if (save.base !== undefined && save.total !== undefined) {
             const extraBase = save.base * 9;
             save.base += extraBase;
             save.total += extraBase;
          }
        }
      }

      // E. Scale Base AC (10 becomes 100)
      if (this.system.attributes?.ac) {
        const acTypes = ["normal", "touch", "flatFooted"];
        for (let type of acTypes) {
          if (this.system.attributes.ac[type]?.total !== undefined) {
            this.system.attributes.ac[type].total += 90;
          }
        }
      }

      // F. Scale Spell Resistance (SR)
      if (this.system.attributes?.sr?.total !== undefined) {
        this.system.attributes.sr.total *= 10;
      }
    }
  }, "WRAPPER");
});