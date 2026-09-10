/**
 * @file scripts/hud.mjs
 * Modular Aeris Floating Action HUD
 * Module: pf1-altsheet-reworked
 */

export const MODULE_ID = "pf1-altsheet-reworked";

export class AerisFloatingHud {
  static buttons = new Map();

  /**
   * Register system settings for HUD coordinates and button permissions
   */
  static registerSettings() {
    game.settings.register(MODULE_ID, "hudPosition", {
      name: "Aeris HUD Position",
      scope: "client",
      config: false,
      type: Object,
      default: { left: null, top: null }
    });

    game.settings.register(MODULE_ID, "hudVisibility_identify", {
      name: "HUD: Monster Identify Button",
      hint: "Controls who can see the Monster Identification button on the HUD.",
      scope: "world",
      config: true,
      type: String,
      default: "all",
      choices: {
        all: "Everyone (GM & Players)",
        gm: "GM Only",
        player: "Players Only",
        disabled: "Disabled"
      },
      onChange: () => AerisFloatingHud.render()
    });

    game.settings.register(MODULE_ID, "hudVisibility_forge", {
      name: "HUD: Gear Forge Button",
      hint: "Controls who can see the Gear Forge button on the HUD.",
      scope: "world",
      config: true,
      type: String,
      default: "all",
      choices: {
        all: "Everyone (GM & Players)",
        gm: "GM Only",
        player: "Players Only",
        disabled: "Disabled"
      },
      onChange: () => AerisFloatingHud.render()
    });

    game.settings.register(MODULE_ID, "hudVisibility_workshop", {
      name: "HUD: Player Workshop Button",
      hint: "Controls who can see the Workshop button on the HUD.",
      scope: "world",
      config: true,
      type: String,
      default: "all",
      choices: {
        all: "Everyone (GM & Players)",
        gm: "GM Only",
        player: "Players Only",
        disabled: "Disabled"
      },
      onChange: () => AerisFloatingHud.render()
    });

    game.settings.register(MODULE_ID, "hudVisibility_audit", {
      name: "HUD: Knowledge Audit Button",
      hint: "Controls who can see the Knowledge Audit reopen button on the HUD.",
      scope: "world",
      config: true,
      type: String,
      default: "gm",
      choices: {
        gm: "GM Only",
        all: "Everyone (GM & Players)",
        disabled: "Disabled"
      },
      onChange: () => AerisFloatingHud.render()
    });
  }

  /**
   * Registers an extensible action button to the HUD
   */
  static registerButton(buttonConfig) {
    this.buttons.set(buttonConfig.id, buttonConfig);
    if ($("#aeris-floating-hud").length) this.render();
  }

  /**
   * Defines default module buttons
   */
  static registerDefaultButtons() {
    this.registerButton({
      id: "identify",
      label: "Identify",
      icon: "fas fa-eye",
      tooltip: "Identify Target Creature",
      onClick: async () => {
        if (game.aeris?.MonsterKnowledgeEngine) {
          await game.aeris.MonsterKnowledgeEngine.identifyTarget();
        } else {
          ui.notifications.error("Monster Knowledge Engine is not loaded.");
        }
      }
    });

    this.registerButton({
      id: "forge",
      label: "Forge",
      icon: "fas fa-hammer",
      tooltip: "Open Gear Forge",
      onClick: () => {
        if (game.aeris?.openForge) {
          game.aeris.openForge();
        } else if (game.aeris?.GranularForgeApp) {
          new game.aeris.GranularForgeApp().render(true);
        }
      }
    });

    this.registerButton({
      id: "workshop",
      label: "Workshop",
      icon: "fas fa-tools",
      tooltip: "Open Player Workshop",
      onClick: async () => {
        const actor = canvas.tokens.controlled[0]?.actor 
          || game.user.character 
          || game.actors.find(a => a.isOwner && a.type === "character");

        if (!actor) {
          ui.notifications.warn("Please select or assign a character token first.");
          return;
        }

        const mod = game.modules.get(MODULE_ID);
        if (mod?.api?.openPlayerWorkshop) {
          await mod.api.openPlayerWorkshop(actor);
        } else {
          ui.notifications.warn("Player workshop API is not available.");
        }
      }
    });

    this.registerButton({
      id: "audit",
      label: "",
      icon: "fas fa-book-skull",
      tooltip: "Re-open Last Knowledge Audit",
      onClick: () => {
        const engine = game.aeris?.MonsterKnowledgeEngine;
        if (engine?.lastAuditPayload) {
          const { MonsterKnowledgeAuditDialog } = engine;
          if (MonsterKnowledgeAuditDialog) {
            new MonsterKnowledgeAuditDialog(engine.lastAuditPayload).render(true);
          }
        } else {
          ui.notifications.info("No knowledge checks audited yet this session.");
        }
      }
    });
  }

  /**
   * Evaluates if a button is visible to the active client
   */
  static shouldShowButton(id) {
    let mode = "all";
    try {
      mode = game.settings.get(MODULE_ID, `hudVisibility_${id}`);
    } catch (e) {
      mode = "all";
    }

    if (mode === "disabled") return false;
    if (mode === "gm" && !game.user.isGM) return false;
    if (mode === "player" && game.user.isGM) return false;
    return true;
  }

  /**
   * Initializes DOM elements and listeners
   */
  static init() {
    this.registerDefaultButtons();
    this.render();
  }

  /**
   * Renders or refreshes the HUD HTML on the canvas
   */
  static render() {
    $("#aeris-floating-hud").remove();

    const visibleButtons = Array.from(this.buttons.values()).filter(b => this.shouldShowButton(b.id));
    if (visibleButtons.length === 0) return;

    const pos = game.settings.get(MODULE_ID, "hudPosition") || { left: null, top: null };
    const positionStyle = (pos.left !== null && pos.top !== null)
      ? `left: ${pos.left}px; top: ${pos.top}px;`
      : `bottom: 72px; left: calc(50% - 150px);`;

    const buttonsHtml = visibleButtons.map(b => `
      <button type="button" class="aeris-btn btn-${b.id}" data-action="${b.id}" title="${b.tooltip}">
        <i class="${b.icon}"></i> ${b.label ? `<span>${b.label}</span>` : ""}
      </button>
    `).join("");

    const hudHtml = `
      <div id="aeris-floating-hud" style="${positionStyle}">
        <div class="aeris-hud-handle" title="Drag to reposition"><i class="fas fa-grip-vertical"></i></div>
        <div class="aeris-hud-actions">
          ${buttonsHtml}
        </div>
      </div>
    `;

    $("body").append(hudHtml);
    this.bindEvents($("#aeris-floating-hud"));
  }

  static bindEvents($hud) {
    // 1. Button Click Handlers
    $hud.find(".aeris-btn").click(async (e) => {
      e.preventDefault();
      const actionId = $(e.currentTarget).data("action");
      const buttonDef = this.buttons.get(actionId);
      if (buttonDef?.onClick) {
        await buttonDef.onClick();
      }
    });

    // 2. Dragging Handle
    const $handle = $hud.find(".aeris-hud-handle");
    let isDragging = false;
    let startX, startY, initLeft, initTop;

    $handle.on("mousedown", (e) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = $hud[0].getBoundingClientRect();
      initLeft = rect.left;
      initTop = rect.top;

      $(document).on("mousemove.aerishud", (ev) => {
        if (!isDragging) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        $hud.css({
          left: `${initLeft + dx}px`,
          top: `${initTop + dy}px`,
          bottom: "auto"
        });
      });

      $(document).on("mouseup.aerishud", () => {
        if (!isDragging) return;
        isDragging = false;
        $(document).off(".aerishud");
        const finalRect = $hud[0].getBoundingClientRect();
        game.settings.set(MODULE_ID, "hudPosition", {
          left: Math.round(finalRect.left),
          top: Math.round(finalRect.top)
        });
      });
    });
  }
}

// Inject stylesheet on load
Hooks.once("init", () => {
  AerisFloatingHud.registerSettings();

  const hudStyle = document.createElement("style");
  hudStyle.innerHTML = `
    #aeris-floating-hud {
      position: fixed;
      background: rgba(18, 20, 24, 0.94);
      border: 1px solid #4a5568;
      border-radius: 6px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.65);
      z-index: 60;
      display: flex;
      align-items: center;
      padding: 3px 6px;
      gap: 5px;
      user-select: none;
      font-family: var(--font-primary, sans-serif);
      backdrop-filter: blur(4px);
    }
    #aeris-floating-hud .aeris-hud-handle {
      cursor: grab;
      color: #718096;
      padding: 4px 4px;
      font-size: 0.95em;
      display: flex;
      align-items: center;
      transition: color 0.15s ease;
    }
    #aeris-floating-hud .aeris-hud-handle:hover {
      color: #cbd5e1;
    }
    #aeris-floating-hud .aeris-hud-handle:active {
      cursor: grabbing;
    }
    #aeris-floating-hud .aeris-hud-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    #aeris-floating-hud .aeris-btn {
      background: #232936;
      color: #e2e8f0;
      border: 1px solid #4a5568;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 0.85em;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      line-height: normal;
      transition: all 0.15s ease;
    }
    #aeris-floating-hud .aeris-btn:hover {
      background: #333d4f;
      border-color: #cbd5e1;
      color: #ffffff;
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.25);
    }
  `;
  document.head.appendChild(hudStyle);
});