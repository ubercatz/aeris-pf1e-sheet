/**
 * @file conditions.mjs - 10x Granular Condition Engine
 */

const MODULE_ID = "pf1-altsheet-reworked";

// Complete 10x balance table for core Pathfinder 1e conditions
export const CORE_10X_CONDITIONS = {
  shaken: {
    changes: [
      { formula: "-20", operator: "add", target: "attack", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "savingThrows.all", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "skills.all", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "abilityChecks.all", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "init", type: "untyped", priority: 0 }
    ]
  },
  sickened: {
    changes: [
      { formula: "-20", operator: "add", target: "attack", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "damage", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "savingThrows.all", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "skills.all", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "abilityChecks.all", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "init", type: "untyped", priority: 0 }
    ]
  },
  frightened: {
    changes: [
      { formula: "-20", operator: "add", target: "attack", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "savingThrows.all", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "skills.all", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "abilityChecks.all", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "init", type: "untyped", priority: 0 }
    ]
  },
  panicked: {
    changes: [
      { formula: "-20", operator: "add", target: "savingThrows.all", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "skills.all", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "abilityChecks.all", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "init", type: "untyped", priority: 0 },
      { formula: "-40", operator: "add", target: "ac.normal", type: "untyped", priority: 0 }
    ]
  },
  entangled: {
    changes: [
      { formula: "-20", operator: "add", target: "attack", type: "untyped", priority: 0 },
      { formula: "-40", operator: "add", target: "dexPen", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "init", type: "untyped", priority: 0 }
    ]
  },
  grappled: {
    changes: [
      { formula: "-20", operator: "add", target: "attack", type: "untyped", priority: 0 },
      { formula: "-40", operator: "add", target: "dexPen", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "init", type: "untyped", priority: 0 }
    ]
  },
  pinned: {
    changes: [
      { formula: "-40", operator: "add", target: "ac.normal", type: "untyped", priority: 0 },
      { formula: "-40", operator: "add", target: "dexPen", type: "untyped", priority: 0 }
    ]
  },
  dazzled: {
    changes: [
      { formula: "-10", operator: "add", target: "attack", type: "untyped", priority: 0 },
      { formula: "-10", operator: "add", target: "skill.per", type: "untyped", priority: 0 }
    ]
  },
  fatigued: {
    changes: [
      { formula: "-20", operator: "add", target: "strPen", type: "untyped", priority: 0 },
      { formula: "-20", operator: "add", target: "dexPen", type: "untyped", priority: 0 }
    ]
  },
  exhausted: {
    changes: [
      { formula: "-60", operator: "add", target: "strPen", type: "untyped", priority: 0 },
      { formula: "-60", operator: "add", target: "dexPen", type: "untyped", priority: 0 }
    ]
  },
  prone: {
    changes: [
      { formula: "-40", operator: "add", target: "attack", type: "untyped", priority: 0 }
    ]
  }
};

/**
 * Applies custom 10x condition mechanics to a condition registry entry
 */
function _patchConditionEntry(condition, customConfig) {
  if (!condition) return;

  const changes = foundry.utils.deepClone(customConfig.changes);

  // Modern PF1e updateSource pattern
  if (typeof condition.updateSource === "function") {
    condition.updateSource({
      "mechanics.changes": changes,
      "system.changes": changes
    });
  }

  // Direct reference fallbacks for active in-memory models
  if (condition.system) condition.system.changes = changes;
  if (condition.mechanics) condition.mechanics.changes = changes;
  if (condition.changes) condition.changes = changes;
}

/**
 * Main function to register and override system conditions
 */
export function apply10xConditionRegistry() {
  if (!game.settings.get(MODULE_ID, "enable10xGranularity")) return;

  // 1. Hook into Modern PF1e Registry
  const registry = pf1.registry?.conditions;
  if (registry) {
    for (const [key, customData] of Object.entries(CORE_10X_CONDITIONS)) {
      const condition = registry.get(key) || registry.get(`${MODULE_ID}.${key}`);
      if (condition) {
        _patchConditionEntry(condition, customData);
      }
    }
  }

  // 2. Legacy / Static Config Fallback
  if (pf1.config?.conditionDetails) {
    for (const [key, customData] of Object.entries(CORE_10X_CONDITIONS)) {
      if (pf1.config.conditionDetails[key]) {
        pf1.config.conditionDetails[key].changes = foundry.utils.deepClone(customData.changes);
      }
    }
  }

  // 3. Trigger recalculation across all active Actors
  for (const actor of game.actors.contents) {
    try {
      actor.reset();
    } catch (e) {
      console.warn(`PF1AR | Failed to reset actor ${actor.name}:`, e);
    }
  }
}