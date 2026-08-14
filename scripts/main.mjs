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

  // 1. Core Dice Evaluator: The Crash-Free Sanitizer
  libWrapper.register(MODULE_ID, "Roll.prototype._evaluate", async function (wrapped, ...args) {
    if (game.settings.get(MODULE_ID, "enable10xGranularity")) {
      for (let term of this.terms) {
        
        if (term.faces && term.faces <= 20 && !term._pf1arScaled) {
          let isD20 = (term.faces === 20);
          term.faces *= 10;

          if (isD20) {
              let finalCS = 191; // Default 10x Crit
              let finalCF = 10;  // Default 10x Fumble
              let newMods = [];

              // 1. Parse and clean existing modifiers to prevent duplicates
              if (term.modifiers && term.modifiers.length > 0) {
                  for (let mod of term.modifiers) {
                      let match = mod.match(/(c[sf])([<>=]*)(\d+)/i);
                      if (match) {
                          let type = match[1].toLowerCase();
                          let num = parseInt(match[3], 10);
                          
                          if (num > 0 && num <= 20) {
                              if (type === 'cs') finalCS = (num * 10) - 9;
                              if (type === 'cf') finalCF = num * 10;
                          } else {
                              // Respect GM custom entries like 185
                              if (type === 'cs') finalCS = num;
                              if (type === 'cf') finalCF = num;
                          }
                      } else {
                          newMods.push(mod); // Keep other valid modifiers like 'kh1'
                      }
                  }
              }

              // 2. Inject exactly ONE clean set of 10x modifiers
              newMods.push(`cs>=${finalCS}`);
              newMods.push(`cf<=${finalCF}`);
              term.modifiers = newMods;

              // 3. FORCE the internal Foundry options so the PF1e Chat Cards obey!
              if (!term.options) term.options = {};
              term.options.critical = finalCS;
              term.options.fumble = finalCF;

          } else {
              // Standard scaling for damage dice modifiers
              if (term.modifiers && term.modifiers.length > 0) {
                  term.modifiers = term.modifiers.map(mod => {
                      return mod.replace(/(c[sf])([<>=]*)(\d+)/i, (match, type, op, numStr) => {
                          let num = parseInt(numStr, 10);
                          if (num > 0 && num <= 20) {
                              if (type.toLowerCase() === 'cs') return `cs${op || ">="}${num * 10 - 9}`;
                              if (type.toLowerCase() === 'cf') return `cf${op || "<="}${num * 10}`;
                          }
                          return match;
                      });
                  });
              }
          }

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
        let pId = 0;
        let placeholders = {};

        // Helper: Hides successfully scaled dice/pools so later math passes CANNOT touch them
        const hide = (str) => {
            const key = `__PF1AR_${pId++}__`;
            placeholders[key] = str;
            return key;
        };

        // ========================================================================
        // PRONG 1: EXPLICIT CAPPED DICE POOLS (e.g., Fireball, Snowball)
        // UPGRADES IN THIS VERSION:
        // - `([^)]+)` catches complex inner variables (like @cl+2 or floor(@cl))
        // - `(\s*(?:\[.*?\])?\s*)` catches and preserves [fire] flavor text & spaces!
        // - `fcs <= 20` prevents exponential dice explosion on multiple math passes!
        // ========================================================================

        // 1a. Standard Pool: min(10, @cl)d6 -> min(10, @cl)d60
        res = res.replace(/(min|max)\(\s*(\d+)\s*,\s*([^)]+)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, num, variable, middle, faces) => {
            let fcs = Number(faces);
            return hide(`${func}(${num}, ${variable})${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });

        // 1b. Outer Parens: (min(10, @cl))d6 -> (min(10, @cl))d60
        res = res.replace(/\(\s*(min|max)\(\s*(\d+)\s*,\s*([^)]+)\s*\)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, num, variable, middle, faces) => {
            let fcs = Number(faces);
            return hide(`(${func}(${num}, ${variable}))${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });

        // 1c. Multiplied Pool: (min(10, @cl)) * 1d6 -> (min(10, @cl)) * 1d60
        res = res.replace(/\(\s*(min|max)\(\s*(\d+)\s*,\s*([^)]+)\s*\)\s*\)(\s*(?:\[.*?\])?\s*\*\s*)(\d*)d(\d+)/gi, (m, func, num, variable, middle, count, faces) => {
            let fcs = Number(faces);
            return hide(`(${func}(${num}, ${variable}))${middle}${count || ""}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/(min|max)\(\s*(\d+)\s*,\s*([^)]+)\s*\)(\s*(?:\[.*?\])?\s*\*\s*)(\d*)d(\d+)/gi, (m, func, num, variable, middle, count, faces) => {
            let fcs = Number(faces);
            return hide(`${func}(${num}, ${variable})${middle}${count || ""}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });

        // 1d. Reversed limits: min(@cl, 10)d6 -> min(@cl, 10)d60
        res = res.replace(/(min|max)\(\s*([^,]+)\s*,\s*(\d+)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, variable, num, middle, faces) => {
            let fcs = Number(faces);
            return hide(`${func}(${variable}, ${num})${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });

        // 1e. Fractional levels: floor(@cl/2)d6 -> floor(@cl/2)d60
        res = res.replace(/(floor|ceil)\(\s*([^)]+)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, variable, middle, faces) => {
            let fcs = Number(faces);
            return hide(`${func}(${variable})${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/\(\s*(floor|ceil)\(\s*([^)]+)\s*\)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, variable, middle, faces) => {
            let fcs = Number(faces);
            return hide(`(${func}(${variable}))${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });

        // 1f. Uncapped variable pools: @cl d6 -> @cl d60
        res = res.replace(/(@[a-zA-Z0-9_.]+)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, variable, middle, faces) => {
            let fcs = Number(faces);
            return hide(`${variable}${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });

        // ========================================================================
        // PRONG 2: ISOLATE STANDARD DICE
        // Temporarily hides generic dice (1d8, 4d6) so flat math ignores them.
        // ========================================================================
        res = res.replace(/\b(\d*)d(\d+)\b/gi, (m, count, faces) => {
            let scaledFaces = Number(faces) <= 20 ? Number(faces) * 10 : faces;
            return hide(`${count || ""}d${scaledFaces}`);
        });

        // ========================================================================
        // PRONG 3: EXPLICIT FLAT MATH (e.g., Cure Light Wounds)
        // Since all dice are safely hidden, we can scale BOTH the cap and variable!
        // ========================================================================
        
        // Matches: min(5, @cl) -> min(50, (@cl * 10))
        res = res.replace(/(min|max)\(\s*(\d+)\s*,\s*(@[a-zA-Z0-9_.]+)\s*\)/gi, (m, func, num, variable) => {
            return `${func}(${Number(num) * 10}, (${variable} * 10))`;
        });
        
        // Matches Reversed: min(@cl, 5) -> min((@cl * 10), 50)
        res = res.replace(/(min|max)\(\s*(@[a-zA-Z0-9_.]+)\s*,\s*(\d+)\s*\)/gi, (m, func, variable, num) => {
            return `${func}((${variable} * 10), ${Number(num) * 10})`;
        });

        // ========================================================================
        // PRONG 4: STANDALONE FLAT VARIABLES AND INTEGERS (+ @cl or + 1)
        // ========================================================================
        res = res.replace(/(^|[-+]\s*)(@[a-zA-Z0-9_.]+)/gi, (m, sign, variable) => {
            return `${sign}(${variable} * 10)`;
        });

        res = res.replace(/(^|[-+]\s*)(\d+)\b/gi, (m, sign, num) => {
            return `${sign}${Number(num) * 10}`;
        });

        // ========================================================================
        // PRONG 5: RESTORE PLACEHOLDERS
        // Puts the safely scaled Fireball and Standard Dice back into the string!
        // ========================================================================
        for (const [key, val] of Object.entries(placeholders)) {
            res = res.replace(key, val);
        }

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
          
          // 1. Scale Damage Formulas safely
          if (srcAction && action.damage?.parts) {
            action.damage.parts.forEach((part, j) => {
              const srcFormula = srcAction.damage.parts[j]?.formula;
              if (srcFormula) part.formula = scaleCL(String(srcFormula));
            });
          }
// ========================================================================
          // SYSTEM CHAT CARD SYNC (The "Ghost Crit" Fix)
          // Forces the base system to recognize 191+ as the baseline for all actions
          // ========================================================================
          
          // actionType checks if this action involves attacks, saves, healing, etc.
          if (action.actionType) {
              let cRange = action.critRange;
              
              // Spells and default weapons are secretly blank in the database!
              // We catch those blanks and explicitly assign them the default 20.
              if (cRange === undefined || cRange === null || cRange === "") {
                  cRange = 20; 
              } else {
                  cRange = Number(cRange);
              }

              // Only convert standard PF1e ranges (1-20). Respects GM's granular buffs!
              if (!isNaN(cRange) && cRange > 0 && cRange <= 20) {
                  // Math: 20 -> 191, 19 -> 181
                  action.critRange = (cRange * 10) - 9;
              }
          }
          // ========================================================================
          // ========================================================================
          // SMART CRITICAL THREAT CONVERSION
          
          
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