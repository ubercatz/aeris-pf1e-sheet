/**
 * @file conditions.mjs - 10x Granular Condition Engine & Config Menu
 */

const MODULE_ID = "pf1-altsheet-reworked";

// Default balanced 10x penalty presets for all Core PF1e Conditions
export const DEFAULT_CONDITION_CHANGES = {
  blinded: [
    { formula: "-20", operator: "add", target: "ac.normal", type: "untyped", priority: 0 },
    { formula: "-40", operator: "add", target: "skills.per", type: "untyped", priority: 0 },
    { formula: "-40", operator: "add", target: "skills.str", type: "untyped", priority: 0 },
    { formula: "-40", operator: "add", target: "skills.dex", type: "untyped", priority: 0 }
  ],
  cowering: [
    { formula: "-20", operator: "add", target: "ac.normal", type: "untyped", priority: 0 }
  ],
  dazzled: [
    { formula: "-10", operator: "add", target: "attack", type: "untyped", priority: 0 },
    { formula: "-10", operator: "add", target: "skills.per", type: "untyped", priority: 0 }
  ],
  deafened: [
    { formula: "-40", operator: "add", target: "init", type: "untyped", priority: 0 },
    { formula: "-40", operator: "add", target: "skills.per", type: "untyped", priority: 0 }
  ],
  entangled: [
    { formula: "-20", operator: "add", target: "attack", type: "untyped", priority: 0 },
    { formula: "-40", operator: "add", target: "dexPen", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "init", type: "untyped", priority: 0 }
  ],
  exhausted: [
    { formula: "-60", operator: "add", target: "strPen", type: "untyped", priority: 0 },
    { formula: "-60", operator: "add", target: "dexPen", type: "untyped", priority: 0 }
  ],
  fatigued: [
    { formula: "-20", operator: "add", target: "strPen", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "dexPen", type: "untyped", priority: 0 }
  ],
  frightened: [
    { formula: "-20", operator: "add", target: "attack", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "savingThrows.all", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "skills.all", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "abilityChecks.all", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "init", type: "untyped", priority: 0 }
  ],
  grappled: [
    { formula: "-20", operator: "add", target: "attack", type: "untyped", priority: 0 },
    { formula: "-40", operator: "add", target: "dexPen", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "init", type: "untyped", priority: 0 }
  ],
  panicked: [
    { formula: "-20", operator: "add", target: "savingThrows.all", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "skills.all", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "abilityChecks.all", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "init", type: "untyped", priority: 0 },
    { formula: "-40", operator: "add", target: "ac.normal", type: "untyped", priority: 0 }
  ],
  pinned: [
    { formula: "-40", operator: "add", target: "ac.normal", type: "untyped", priority: 0 },
    { formula: "-40", operator: "add", target: "dexPen", type: "untyped", priority: 0 }
  ],
  prone: [
    { formula: "-40", operator: "add", target: "attack", type: "untyped", priority: 0 }
  ],
  shaken: [
    { formula: "-20", operator: "add", target: "attack", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "savingThrows.all", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "skills.all", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "abilityChecks.all", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "init", type: "untyped", priority: 0 }
  ],
  sickened: [
    { formula: "-20", operator: "add", target: "attack", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "damage", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "savingThrows.all", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "skills.all", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "abilityChecks.all", type: "untyped", priority: 0 },
    { formula: "-20", operator: "add", target: "init", type: "untyped", priority: 0 }
  ],
  squeezing: [
    { formula: "-40", operator: "add", target: "attack", type: "untyped", priority: 0 },
    { formula: "-40", operator: "add", target: "ac.normal", type: "untyped", priority: 0 }
  ],
  stunned: [
    { formula: "-20", operator: "add", target: "ac.normal", type: "untyped", priority: 0 }
  ]
};

// ─── MODULE CONFIGURATION APPLICATION ─────────────────────────────────────

export class ConditionCustomizerDialog extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "pf1ar-condition-settings",
      title: "10x Condition Penalty Configurator",
      template: `modules/${MODULE_ID}/templates/parts/condition-config.hbs`,
      width: 540,
      height: "auto",
      closeOnSubmit: true
    });
  }

  getData() {
    const saved = game.settings.get(MODULE_ID, "customConditionJSON") || {};
    const conditions = [];

    for (const [key, defaultChanges] of Object.entries(DEFAULT_CONDITION_CHANGES)) {
      const activeChanges = saved[key] || defaultChanges;
      const primaryFormula = activeChanges[0]?.formula || "-20";
      
      // Resolve localized label clean text
      const cleanLabel = game.i18n.localize(`PF1.Condition.${key}`) || key.charAt(0).toUpperCase() + key.slice(1);

      conditions.push({
        key,
        name: cleanLabel,
        formula: primaryFormula,
        targets: activeChanges.map(c => c.target).join(", ")
      });
    }

    return { conditions };
  }

  async _updateObject(event, formData) {
    const customConfig = foundry.utils.deepClone(DEFAULT_CONDITION_CHANGES);

    for (const [field, value] of Object.entries(formData)) {
      if (field.startsWith("cond_")) {
        const key = field.replace("cond_", "");
        const num = Number(value);
        if (!isNaN(num) && customConfig[key]) {
          customConfig[key].forEach(change => {
            change.formula = String(num);
          });
        }
      }
    }

    await game.settings.set(MODULE_ID, "customConditionJSON", customConfig);
    apply10xConditionRegistry();
    ui.notifications.info("10x Condition penalties updated successfully.");
  }
}

// ─── REGISTRY ENGINE ──────────────────────────────────────────────────────

export function registerConditionSettings() {
  game.settings.register(MODULE_ID, "customConditionJSON", {
    scope: "world",
    config: false,
    type: Object,
    default: DEFAULT_CONDITION_CHANGES
  });

  game.settings.registerMenu(MODULE_ID, "conditionConfigMenu", {
    name: "Condition Penalty Adjuster",
    label: "Configure Condition Modifiers",
    hint: "Custom-tune the numeric penalties applied by all status conditions.",
    icon: "fas fa-heart-crack",
    type: ConditionCustomizerDialog,
    restricted: true
  });
}

function _patchConditionEntry(condition, customChanges, key) {
  if (!condition) return;

  const changes = foundry.utils.deepClone(customChanges);
  
  // Resolve proper display name
  const localizedName = game.i18n.localize(`PF1.Condition.${key}`) || 
                        pf1.config?.conditions?.[key] || 
                        key.charAt(0).toUpperCase() + key.slice(1);

  const updates = {
    name: localizedName,
    "system.changes": changes,
    "mechanics.changes": changes
  };

  if (typeof condition.updateSource === "function") {
    condition.updateSource(updates);
  }

  if (condition.system) {
    condition.system.changes = changes;
    condition.name = localizedName;
  }
  if (condition.mechanics) {
    condition.mechanics.changes = changes;
    condition.name = localizedName;
  }
}

export function apply10xConditionRegistry() {
  if (!game.settings.get(MODULE_ID, "enable10xGranularity")) return;

  const customConfig = game.settings.get(MODULE_ID, "customConditionJSON") || DEFAULT_CONDITION_CHANGES;
  const registry = pf1.registry?.conditions;

  // 1. Patch modern PF1e Registry Documents
  if (registry) {
    for (const [key, changes] of Object.entries(customConfig)) {
      const condition = registry.get(key) || registry.get(`${MODULE_ID}.${key}`);
      if (condition) {
        _patchConditionEntry(condition, changes, key);
      }
    }
  }

  // 2. Patch static configuration object
  if (pf1.config?.conditionDetails) {
    for (const [key, changes] of Object.entries(customConfig)) {
      if (pf1.config.conditionDetails[key]) {
        pf1.config.conditionDetails[key].changes = foundry.utils.deepClone(changes);
        pf1.config.conditionDetails[key].name = game.i18n.localize(`PF1.Condition.${key}`) || key;
      }
    }
  }

  // 3. Force actor recalculation
  for (const actor of game.actors.contents) {
    try {
      actor.reset();
    } catch (e) {}
  }
}