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
  // ─── READY: SYSTEM OVERRIDES ──────────────────────────────────────────────

Hooks.once("ready", () => {
  if (game.system?.id !== "pf1") return;

  DocumentSheetConfig.registerSheet(Actor, MODULE_ID, AltCharacterSheetPF, { label: game.i18n.localize("PF1AR.CharacterSheetLabel"), types: ["character"], makeDefault: false });
  DocumentSheetConfig.registerSheet(Actor, MODULE_ID, AltNPCSheetPF, { label: game.i18n.localize("PF1AR.NPCSheetLabel"), types: ["npc"], makeDefault: false });
  DocumentSheetConfig.updateDefaultSheets();

  // ========================================================================
  // INJECT GLOBAL CSS FOR 10X GRANULARITY HIGHLIGHTS
  // Foundry core doesn't have CSS for d200 fumbles, so we must supply it!
  // ========================================================================
  // ========================================================================
  // INJECT GLOBAL CSS FOR 10X GRANULARITY HIGHLIGHTS
  // Foundry core doesn't have CSS for d200 fumbles, so we must supply it!
  // ========================================================================
  

  if (game.settings.get(MODULE_ID, "enable10xGranularity") && pf1.config) {
    pf1.config.classSkillBonus = 30;
    pf1.config.nonProficiencyPenalty = -40;
  }
});

  if (game.settings.get(MODULE_ID, "enable10xGranularity") && pf1.config) {
    pf1.config.classSkillBonus = 30;
    pf1.config.nonProficiencyPenalty = -40;
  }
});

// ─── LIBWRAPPER INTERCEPTIONS (10X ENGINE) ────────────────────────────────

Hooks.once("init", () => {
  if (typeof libWrapper === "undefined") return;

 // 1. Core Dice Evaluator: Safely scales dice faces and natively flags fumbles POST-roll
  libWrapper.register(MODULE_ID, "Roll.prototype._evaluate", async function (wrapped, ...args) {
    if (game.settings.get(MODULE_ID, "enable10xGranularity")) {
      for (let term of this.terms) {
        // Pre-roll setup: Scale dice up to 200
        if (term.faces && term.faces <= 20 && !term._pf1arScaled) {
          term.faces *= 10;
          term._pf1arScaled = true;
        }
      }
    }

    // Let Foundry execute the roll natively without crashing
    let evaluatedRoll = await wrapped(...args);

    if (game.settings.get(MODULE_ID, "enable10xGranularity")) {
      for (let term of this.terms) {
        if (term.faces === 200 && term.results) {
          for (let res of term.results) {
            // NATIVE FLAG: Force Foundry to recognize 1-10 as a fumble AFTER the roll
            if (res.result <= 10) {
              res.fumble = true;
              res.failure = true; 
            }
          }
        }
      }
    }
    return evaluatedRoll;
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
          if (action.actionType) {
              // ========================================================================
              // UNIVERSAL CRITICAL THREAT CONVERTER (Weapons, Spells, Skills)
              // ========================================================================
              
              // 1. Safely guarantee the nested 'ability' container exists for ALL actions
              action.ability = action.ability || {};
              
              // 2. Look for the crit range in the new V11 location OR the old legacy location
              let cRange = action.ability.critRange;
              if (cRange === undefined || cRange === null || cRange === "") {
                  cRange = action.critRange;
              }
              
              // 3. If it is completely blank, PF1e assumes '20'. We force it to '191'.
              if (cRange === undefined || cRange === null || cRange === "") {
                  action.ability.critRange = 191; 
                  action.critRange = 191; // Legacy fallback sync
              } else {
                  cRange = Number(cRange);
                  
                  if (!isNaN(cRange)) {
                      // 4a. If it's a standard PF1e range (20, 19, 18), scale it!
                      if (cRange > 0 && cRange <= 20) {
                          let scaled = (cRange * 10) - 9;
                          action.ability.critRange = scaled;
                          action.critRange = scaled; 
                      } 
                      // 4b. Safely catches your manual granular inputs (like 181 or 175)
                      // and perfectly syncs them into the modern database location.
                      else {
                          action.ability.critRange = cRange;
                          action.critRange = cRange;
                      }
                  }
              }
          }
          /*if (action.actionType) {
              
              // ========================================================================
              // 1. STANDARD ATTACKS (Weapons, Features, etc.)
              // This is your original working code! We leave it completely alone.
              // ========================================================================
              if (this.type !== "spell") {
                  let cRange = action.critRange; 
                  // (Assuming this was your working logic, adjust if yours looked slightly different)
                  if (cRange !== undefined && cRange !== null && cRange !== "") {
                      cRange = Number(cRange);
                      // Only convert if it's 20 or below, ignoring manual 181+ inputs
                      if (!isNaN(cRange) && cRange > 0 && cRange <= 20) {
                          action.critRange = (cRange * 10) - 9;
                      }
                  }
              }

              // ========================================================================
              // 2. SPELL ATTACKS EXCLUSIVE
              // Completely isolated. Targets the deeper nested 'ability' object securely.
              // ========================================================================
              if (this.type === "spell") {
                  // Safely ensure the ability object exists without overwriting existing stats
                  action.ability = action.ability || {};
                  
                  let cRange = action.ability.critRange;
                  
                  // Spells are usually blank by default in the database (which means 20)
                  // If it's blank, we force it directly to 191
                  if (cRange === undefined || cRange === null || cRange === "") {
                      action.ability.critRange = 191; 
                  } else {
                      cRange = Number(cRange);
                      // If a user manually typed 19, convert to 181. 
                      // If it is already 191, it safely ignores it.
                      if (!isNaN(cRange) && cRange > 0 && cRange <= 20) {
                          action.ability.critRange = (cRange * 10) - 9;
                      }
                  }
              }
              
          }*/
// ========================================================================
          
          
          
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
// ========================================================================
// CHAT CARD INTERCEPTOR: The "Tree Walker" Fumble Painter
// ========================================================================
Hooks.on("renderChatMessage", (message, html, data) => {
    // 1. Only run if 10x Granularity is enabled
    if (!game.settings.get("pf1-altsheet-reworked", "enable10xGranularity")) return;

    // Safely wrap html for V11/V12 compatibility
    const $html = html instanceof jQuery ? html : $(html);

    // 2. Hunt down every individual d200 die in the chat card
    $html.find('li.roll.die.d200').each(function() {
        let dieValue = parseInt($(this).text(), 10);

        // 3. Did this specific die roll a 1-10?
        if (!isNaN(dieValue) && dieValue <= 10) {
            
            // A. Force the die itself to be red using un-overrideable !important styles
            this.style.setProperty('color', '#aa0200', 'important');
            this.style.setProperty('font-weight', 'bold', 'important');

            // B. Walk UP the HTML tree to find the closest wrapper containing a Total Box.
            // This isolates the exact attack so we don't accidentally paint full-attacks entirely red!
            let $container = $(this).parents().filter(function() {
                return $(this).find('.roll-total, .dice-total, h4.total').length > 0;
            }).first();

            // C. Find the total box inside that specific container and paint it red
            if ($container.length > 0) {
                $container.find('.roll-total, .dice-total, h4.total').each(function() {
                    this.style.setProperty('color', '#aa0200', 'important');
                    this.style.setProperty('text-shadow', '0 0 4px rgba(170, 2, 0, 0.3)', 'important');
                });
            }
        }
    });
});
