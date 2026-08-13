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

  // 1. Core Dice Evaluator: Safely scales dice right before they roll (Bypasses Anti-Cheat flags)
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
        
        // Scale Caster Level Caps without messing up dice counts
        res = res.replace(/min\((\d+),\s*@cl\)(?!\s*d)/gi, (m, cap) => `min(${Number(cap)*10}, (@cl * 10))`);
        res = res.replace(/max\((\d+),\s*@cl\)(?!\s*d)/gi, (m, cap) => `max(${Number(cap)*10}, (@cl * 10))`);
        
        // Scale flat CL modifiers
        res = res.replace(/\+\s*@cl\b(?!\s*d)/gi, "+ (@cl * 10)");
        res = res.replace(/-\s*@cl\b(?!\s*d)/gi, "- (@cl * 10)");
        
        // Scale standard damage/healing dice faces. Ignores d100s.
        res = res.replace(/\b(\d*)d(\d+)\b/gi, (m, c, fcs) => Number(fcs) <= 20 ? `${c || 1}d${Number(fcs) * 10}` : m);
        
        // Safely targets ONLY flat numbers strictly starting with + or - (Catches Shaken, Sickened, etc.)
        res = res.replace(/(^|[+-])\s*\b(\d+)\b(?!\s*d)/gi, (m, sign, num) => `${sign} ${Number(num) * 10}`);
        return res;
      };

      if (this.system?.armor) {
        if (this._source?.system?.armor?.value !== undefined) this.system.armor.value = Number(this._source.system.armor.value) * 10;
        if (this._source?.system?.armor?.acp !== undefined) this.system.armor.acp = Number(this._source.system.armor.acp) * 10;
      }
      if (this.system?.enh !== undefined && this._source?.system?.enh !== undefined) this.system.enh = Number(this._source.system.enh) * 10;

      // Scale Item Buffs/Debuffs (This scales Shaken, Sickened, etc.)
      if (this.system?.changes && this._source?.system?.changes) {
        this.system.changes.forEach((change, i) => {
          const srcFormula = this._source.system.changes[i]?.formula;
          if (srcFormula) change.formula = scaleCL(String(srcFormula));
        });
      }

      // Scale Spell/Action Damage & Healing
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

  // 3. Item Derived Data: Save DCs
  libWrapper.register(MODULE_ID, "CONFIG.Item.documentClass.prototype.prepareDerivedData", function (wrapped, ...args) {
    wrapped(...args);
    if (game.system.id === "pf1" && game.settings.get(MODULE_ID, "enable10xGranularity") && this.system?.actions) {
      const sl = this.system.spellLevel || this.spellLevel || 0;
      this.system.actions.forEach(action => {
        if (action.save?.dc !== undefined && action.save.dc > 0) {
          action.save.dc += 90 + (sl * 9);
        }
      });
    }
  }, "WRAPPER");

  // 4. Actor Derived Data: Skills, FCB, BAB, Saves, AC, SR, and Encumbrance
  libWrapper.register(MODULE_ID, "CONFIG.Actor.documentClass.prototype.prepareDerivedData", function (wrapped, ...args) {
    wrapped(...args); 
    
    if (game.system.id === "pf1" && game.settings.get(MODULE_ID, "enable10xGranularity")) {
      
      // Skills
      if (this.system?.skills) {
        for (const skill of Object.values(this.system.skills)) {
          if (skill.rank) skill.mod += (skill.rank * 9);
          if (skill.subSkills) {
            for (const subSkill of Object.values(skill.subSkills)) {
              if (subSkill.rank) subSkill.mod += (subSkill.rank * 9);
            }
          }
        }
      }

      // FCB HP
      let totalFcbHp = 0;
      for (const item of this.items) {
        if (item.type === "class" && item.system?.fc?.hp?.value) totalFcbHp += item.system.fc.hp.value;
      }
      if (totalFcbHp > 0 && this.system.attributes?.hp) this.system.attributes.hp.max += (totalFcbHp * 9);

      // BAB
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
        if (this.system.attributes?.bab?.total !== undefined) this.system.attributes.bab.total += (this.system.attributes.bab.total * 9);
      }

      // Saves
      if (this.system.attributes?.savingThrows) {
        for (let save of Object.values(this.system.attributes.savingThrows)) {
          if (save.base !== undefined && save.total !== undefined) save.total += (save.base * 9);
        }
      }

      // Base AC
      if (this.system.attributes?.ac) {
        ["normal", "touch", "flatFooted"].forEach(type => {
          if (this.system.attributes.ac[type]?.total !== undefined) this.system.attributes.ac[type].total += 90;
        });
      }

      // Spell Resistance
      if (this.system.attributes?.sr?.total !== undefined) this.system.attributes.sr.total *= 10;

      // Encumbrance Manual Override (Calculates cleanly from str/10)
      if (this.system.attributes?.encumbrance && this.system.abilities?.str?.total) {
        const str = Math.floor(this.system.abilities.str.total / 10);
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