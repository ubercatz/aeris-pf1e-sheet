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
  if (game.system?.id !== "pf1") return;

  registerHandlebarsHelpers();

  game.settings.register(MODULE_ID, "enable10xGranularity", {
    name: "Enable 10x Granularity Engine",
    hint: "Scales base dice faces (1d6 -> 1d60) and flat modifiers by 10x.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: _rerenderOpenAltSheets,
  });

  game.settings.register(MODULE_ID, "enableFractionalProgression", {
    name: "Enable Fractional Progression",
    hint: "Uses true fractional stacking for Base Attack Bonus across multiclassing.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: _rerenderOpenAltSheets,
  });

  game.settings.register(MODULE_ID, "darkMode", { name: "PF1AR.Settings.DarkMode", scope: "client", config: false, type: Boolean, default: false });
  game.settings.register(MODULE_ID, "theme", { name: "PF1AR.Settings.Theme", scope: "client", config: true, type: String, default: "parchment", choices: { parchment: "PF1AR.Theme.Parchment", hybrid: "PF1AR.Theme.Hybrid", slate: "PF1AR.Theme.Slate" }, onChange: _rerenderOpenAltSheets });
  game.settings.register(MODULE_ID, "compact", { name: "PF1AR.Settings.Compact", scope: "client", config: true, type: Boolean, default: false, onChange: _rerenderOpenAltSheets });
  game.settings.register(MODULE_ID, "summarySkills", { name: "PF1AR.Settings.SummarySkills", scope: "client", config: true, type: String, default: "ranked", choices: { ranked: "PF1AR.Labels.Ranked", class: "PF1AR.Labels.SkillsClass", all: "PF1AR.Labels.SkillsAll" }, onChange: _rerenderOpenAltSheets });

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
});

// ─── READY: SYSTEM OVERRIDES ──────────────────────────────────────────────

Hooks.once("ready", () => {
  if (game.system?.id !== "pf1") return;

  DocumentSheetConfig.registerSheet(Actor, MODULE_ID, AltCharacterSheetPF, { label: game.i18n.localize("PF1AR.CharacterSheetLabel"), types: ["character"], makeDefault: false });
  DocumentSheetConfig.registerSheet(Actor, MODULE_ID, AltNPCSheetPF, { label: game.i18n.localize("PF1AR.NPCSheetLabel"), types: ["npc"], makeDefault: false });
  DocumentSheetConfig.updateDefaultSheets();

  if (game.settings.get(MODULE_ID, "enable10xGranularity") && pf1.config) {
    pf1.config.classSkillBonus = 30;
    pf1.config.nonProficiencyPenalty = -40;
  }
});

// ─── LIBWRAPPER INTERCEPTIONS (10X ENGINE) ────────────────────────────────

Hooks.once("init", () => {
  if (typeof libWrapper === "undefined") return;

  // 1. Core Dice Evaluator: Safely scales dice right before they roll (Faces: 1d20 -> 1d200)
  libWrapper.register(MODULE_ID, "Roll.prototype._evaluate", async function (wrapped, ...args) {
    if (game.settings.get(MODULE_ID, "enable10xGranularity")) {
      for (let term of this.terms) {
        if (term.faces && term.faces <= 20 && !term._pf1arScaled) {
          term.faces *= 10;
          term._pf1arScaled = true; 
        }
      }
    }
    return wrapped(...args);
  }, "WRAPPER");

  // 2. Item Base Data: Armor, ACP, Enhancements, and Smart Formula Scaling
  libWrapper.register(MODULE_ID, "CONFIG.Item.documentClass.prototype.prepareBaseData", function (wrapped, ...args) {
    wrapped(...args); 
    
    if (game.system.id === "pf1" && game.settings.get(MODULE_ID, "enable10xGranularity")) {
      
      const scaleCL = (f) => {
        if (typeof f !== "string") return f;
        let res = f;
        
        // 1. Scale standard dice faces (1d8 -> 1d80). Preserves empty prefixes.
        res = res.replace(/(\d*)d(\d+)/gi, (m, c, fcs) => {
            return Number(fcs) <= 20 ? `${c || ""}d${Number(fcs) * 10}` : m;
        });
        
        // 2. Scale Flat Constants (Matches numbers after +, -, *, /, or inside min/max functions)
        // This natively catches the '5' inside min(5, @cl) and turns it into min(50, @cl)
        res = res.replace(/(^|[-+,\(*\/]\s*)\b(\d+)\b(?!\s*[a-zA-Z])/gi, (m, prefix, num) => {
            return `${prefix}${Number(num) * 10}`;
        });

        // 3. Scale System Variables (Caster Level & Class Levels)
        // Turns @cl into (@cl * 10) so the output natively matches the 10x engine
        res = res.replace(/@cl\b/gi, '(@cl * 10)');
        res = res.replace(/@classes\.[a-zA-Z0-9_]+\.level\b/gi, '($& * 10)');
        
        return res;
      };
      //end scaleCL

      if (this.system?.armor) {
        if (this._source?.system?.armor?.value !== undefined) this.system.armor.value = Number(this._source.system.armor.value) * 10;
        if (this._source?.system?.armor?.acp !== undefined) this.system.armor.acp = Number(this._source.system.armor.acp) * 10;
      }
      if (this.system?.enh !== undefined && this._source?.system?.enh !== undefined) this.system.enh = Number(this._source.system.enh) * 10;

      // Scale Item Buffs/Debuffs & Damage formulas safely
      if (this.system?.changes && this._source?.system?.changes) {
        this.system.changes.forEach((change, i) => {
          const srcFormula = this._source.system.changes[i]?.formula;
          if (srcFormula) change.formula = scaleCL(String(srcFormula));
        });
      }
      if (this.system?.actions && this._source?.system?.actions) {
        this.system.actions.forEach((action, i) => {
          const srcAction = this._source.system.actions[i];
          if (srcAction && action.damage?.parts) {
            action.damage.parts.forEach((part, j) => {
              const srcFormula = srcAction.damage.parts[j]?.formula;
              if (srcFormula) part.formula = scaleCL(String(srcFormula));
            });
          }
        });
      }
    }
  }, "WRAPPER");
// 3. System-Wide Ability Modifier Interception
  libWrapper.register(MODULE_ID, "pf1.utils.getAbilityModifier", function (wrapped, score, ...args) {
    // We ensure score is a number so we don't accidentally break system checks passing undefined
    if (game.settings.get(MODULE_ID, "enable10xGranularity") && typeof score === "number") {
       // Shift base 10 to 100, divide by 2 for the 1-to-2 scaling ratio
       return Math.floor((score - 100) / 2);
    }
    return wrapped(score, ...args);
  }, "MIXED");
// 5. Action DC Interception: Natively scale Spell and Ability Save DCs
  libWrapper.register(MODULE_ID, "pf1.components.ItemAction.prototype.getDC", function(wrapped, ...args) {
    let result = wrapped(...args);
    
    if (game.settings.get(MODULE_ID, "enable10xGranularity") && result != null) {
      // Safely pull the spell level (defaults to 0 for non-spell actions like Ex/Su abilities)
      const sl = this.spellLevel ?? this.item?.spellLevel ?? 0;
      
      // Calculate the difference needed to reach our 10x baseline
      // Base 10 needs 90. Spell Level 1 needs 9. (Modifier is already 10x).
      const bonus = 90 + (sl * 9);
      
      // The system sometimes returns an object and sometimes a raw number depending on the hook phase
      if (typeof result === "number") {
          result += bonus;
      } else if (result.value !== undefined) {
          result.value += bonus;
      }
    }
    return result;
  }, "WRAPPER");
  // 4. Actor Derived Data: Natively Scale BAB, AC, and Encumbrance
  libWrapper.register(MODULE_ID, "CONFIG.Actor.documentClass.prototype.prepareDerivedData", function (wrapped, ...args) {
    wrapped(...args); 
    
    if (game.system.id === "pf1" && game.settings.get(MODULE_ID, "enable10xGranularity")) {
      
      // Base AC Adjustment
      if (this.system.attributes?.ac) {
        ["normal", "touch", "flatFooted"].forEach(type => {
          if (this.system.attributes.ac[type]?.total !== undefined) {
             this.system.attributes.ac[type].total += 90; 
          }
        });
      }

      // BAB (Fractional or standard 10x)
      if (game.settings.get(MODULE_ID, "enableFractionalProgression")) {
        let granularBab = 0;
        for (const item of this.items) {
          if (item.type === "class") {
            const lvl = item.system.level || 0, btype = item.system.bab;
            if (btype === "high") granularBab += lvl * 10;
            else if (btype === "medium") granularBab += lvl * 7.5;
            else if (btype === "low") granularBab += lvl * 5;
          }
        }
        if (this.system.attributes?.bab) this.system.attributes.bab.total = Math.floor(granularBab);
      } else {
        if (this.system.attributes?.bab?.total !== undefined) this.system.attributes.bab.total *= 10;
      }

      // Encumbrance Manual Override
      // Prevents the system from using raw 223 STR to calculate trillions of pounds
      if (this.system.attributes?.encumbrance && this.system.abilities?.str?.total) {
        const str = Math.floor(this.system.abilities.str.total / 10); // Treat 223 as 22
        let heavy = 0;
        if (str <= 10) heavy = str * 10;
        else {
           const base = [100, 115, 130, 150, 175, 200, 230, 260, 300, 350][str % 10];
           heavy = base * Math.pow(4, Math.floor(str / 10) - 1);
        }
        this.system.attributes.encumbrance.light = Math.floor(heavy / 3) * 10;
        this.system.attributes.encumbrance.medium = Math.floor((heavy * 2) / 3) * 10;
        this.system.attributes.encumbrance.heavy = heavy * 10;
      }
    }
  }, "WRAPPER");
});