/**
 * @file PF1E Alt Sheet Reworked — classes de sheet.
 *
 * Estende as sheets Application V1 do PF1E (ActorSheetPFCharacter /
 * ActorSheetPFNPC), substituindo o template e aplicando o estilo moderno do
 * módulo. Toda a lógica de dados (getData, _onX, listeners) é herdada do
 * sistema PF1E; aqui só entram o painel inline de contêineres, o binding dos
 * nossos data-action de rolagem e a aplicação de tema/densidade.
 */

const MODULE_ID = "pf1-altsheet-reworked";
const M = `modules/${MODULE_ID}`;

// ─── CONTEÚDO DE CONTÊINERES ─────────────────────────────────────────────────
// O PF1E guarda os itens de um contêiner no próprio item contêiner
// (`container.system.items`, preparado como `container.items`). Esses itens
// NÃO são embedded items diretos do Actor, então os controles padrão da sheet
// não os alcançam — por isso preparamos aqui um render model próprio
// (leitura/escrita) e fazemos o binding de controles dedicados logo abaixo.

/**
 * Formata um valor em moedas separadas (po/pp/pc…) usando o formatador de
 * moeda do próprio sistema PF1E.
 * @param {number} value - Valor na menor denominação (peças de cobre).
 * @returns {string} Rótulo localizado, ex.: "12 po, 5 pc".
 */
function _formatCurrencySplit(value) {
  return game.i18n.format("PF1.SplitValue", pf1.utils.currency.split(value, { pad: true }));
}

/**
 * Obtém (criando sob demanda) o conjunto de contêineres com o painel inline
 * aberto nesta sheet. Vive na instância da sheet para sobreviver a re-renders
 * (o Application V1 recria o DOM inteiro a cada render).
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do estado.
 * @returns {Set<string>} Ids dos itens contêiner atualmente abertos.
 */
function _getOpenInlineContainers(sheet) {
  sheet._pf1arOpenContainers ??= new Set();
  return sheet._pf1arOpenContainers;
}

/**
 * Marca um contêiner como aberto/fechado no estado da sheet, para que o
 * `<details>` re-renderize no mesmo estado em que o jogador o deixou.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do estado.
 * @param {string|undefined} containerId - Id do item contêiner (ignorado se vazio).
 * @param {boolean} [open] - true para abrir, false para fechar.
 * @returns {void}
 */
function _setInlineContainerOpen(sheet, containerId, open = true) {
  if (!containerId) return;
  const openContainers = _getOpenInlineContainers(sheet);
  if (open) openContainers.add(containerId);
  else openContainers.delete(containerId);
}

/**
 * Monta o render model do painel inline de conteúdo de um item contêiner.
 * Sempre retorna objeto para itens do tipo contêiner — inclusive vazios
 * (`count: 0`, `sections: []`) — para que o template renderize o `<details>`
 * com o dropzone convidativo de estado vazio em vez de sumir com ele.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do ator.
 * @param {Item|undefined} container - O documento do item contêiner.
 * @param {object} context - Contexto do getData usado para preparar as seções.
 * @returns {object|null} O render model do conteúdo, ou null se `container` não for contêiner.
 */
function _prepareContainerContents(sheet, container, context) {
  if (container?.type !== "container") return null;

  const inventory = Object.values(pf1.config.sheetSections.inventory)
    .map((data) => foundry.utils.deepClone(data))
    .sort((a, b) => a.sort - b.sort);

  for (const section of inventory) {
    sheet._prepareSection(section);
  }

  const items = (container.items ?? [])
    .map((item) => sheet._prepareItem(item))
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));

  for (const item of items) {
    const section = inventory.find((section) => sheet._applySectionFilter(item, section));
    if (!section) continue;

    sheet._prepareItemForSection(item, section, context);
    section.items ??= [];
    section.items.push(item);
  }

  // Contêineres sem itens ainda renderizam o <details> (com o dropzone de
  // estado vazio) em vez de desaparecer da lista.
  const sections = inventory.filter((section) => section.items?.length);

  const currency = container.system.currency ?? {};
  const coinage = pf1.utils.currency.merge(currency);
  const value =
    container.getValue({ recursive: true, sellValue: 1, inLowestDenomination: true }) -
    container.getValue({ recursive: false, sellValue: 1, inLowestDenomination: true }) -
    coinage;
  const sellValue =
    container.getValue({ recursive: true, inLowestDenomination: true }) -
    container.getValue({ recursive: false, inLowestDenomination: true }) -
    coinage;

  return {
    count: items.length,
    sections,
    weight: container.system.weight?.converted?.contents ?? 0,
    valueLabel: _formatCurrencySplit(value),
    sellValueLabel: _formatCurrencySplit(sellValue),
    currencyLabel: _formatCurrencySplit(coinage),
    hasCurrency: Object.values(currency).some((amount) => Number(amount) > 0),
    open: _getOpenInlineContainers(sheet).has(container.id),
  };
}

/**
 * Anota cada item contêiner do inventário preparado pelo getData do sistema
 * com `pf1arIsContainer` e o render model `pf1arContents` (ver
 * {@link _prepareContainerContents}), consumidos pelo `inventory.hbs`.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do ator.
 * @param {object} data - Contexto retornado pelo getData do sistema (mutado in-place).
 * @returns {void}
 */
function _prepareInventoryContainers(sheet, data) {
  if (!Array.isArray(data.inventory)) return;

  for (const section of data.inventory) {
    for (const item of section.items ?? []) {
      const container = item.document;
      if (container?.type === "container") {
        item.pf1arIsContainer = true;
      }

      const contents = _prepareContainerContents(sheet, container, data);
      if (!contents) continue;

      item.pf1arContents = contents;
    }
  }
}

// ─── FILHOS DE LINK NA ABA FEATURES ──────────────────────────────────────────
// No PF1E, `system.links.children` são referências entre itens que existem
// normalmente no ator (ex.: uma Discovery de Alquimista que agrupa outras
// discoveries). A ficha do sistema os mostra soltos; aqui nós os aninhamos
// visualmente sob o item-pai. Como são itens embedded reais (diferente do
// conteúdo de contêiner), os listeners do sistema já operam neles pelo
// `data-item-id` — só reordenamos a lista e marcamos a profundidade.

/**
 * Aninha os feats-filho (`links.children`) logo abaixo do feat-pai na aba
 * Features, marcando cada linha com `pf1arLinkDepth`/`pf1arIsLinkChild` para o
 * template indentar. Achata a árvore em ordem de exibição (pai, depois
 * descendentes) com guarda anti-ciclo; filhos cujo pai não está na lista de
 * feats permanecem no lugar. Muta `data.features` in-place.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do ator.
 * @param {object} data - Contexto do getData do sistema.
 * @returns {void}
 */
function _prepareLinkedFeatChildren(sheet, data) {
  const sections = Array.isArray(data.features) ? data.features : Object.values(data.features ?? {});
  if (!sections.length) return;

  // Índice global id → entrada preparada (os filhos podem estar em outra seção).
  const entryById = new Map();
  for (const section of sections) {
    for (const entry of section.items ?? []) entryById.set(entry.id, entry);
  }

  // childId → parentId e parentId → [childIds], só quando ambos são feats listados.
  const parentOf = new Map();
  const childIdsOf = new Map();
  for (const entry of entryById.values()) {
    const doc = sheet.actor.items.get(entry.id);
    const kids = (doc?.getLinkedItemsSync?.("children") ?? []).filter((c) => entryById.has(c.id));
    if (!kids.length) continue;
    childIdsOf.set(
      entry.id,
      kids.map((c) => c.id),
    );
    for (const c of kids) if (!parentOf.has(c.id)) parentOf.set(c.id, entry.id);
  }
  if (!parentOf.size) return;

  // Reconstrói cada seção: só os itens de topo iniciam a emissão; os
  // descendentes entram logo após o pai, recursivamente (Set anti-ciclo).
  for (const section of sections) {
    const out = [];
    const emit = (entry, depth, seen) => {
      entry.pf1arLinkDepth = depth;
      entry.pf1arIsLinkChild = depth > 0;
      out.push(entry);
      for (const childId of childIdsOf.get(entry.id) ?? []) {
        if (seen.has(childId)) continue;
        const child = entryById.get(childId);
        if (child) emit(child, depth + 1, new Set(seen).add(childId));
      }
    };
    for (const entry of section.items ?? []) {
      if (parentOf.has(entry.id)) continue; // filho: emitido pela recursão do pai
      emit(entry, 0, new Set([entry.id]));
    }
    section.items = out;
  }
}

/**
 * Resolve, a partir de um elemento clicado, a linha do item contido e os
 * documentos (contêiner + item) correspondentes.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do ator.
 * @param {HTMLElement} element - Elemento de origem do evento.
 * @returns {{row?: HTMLElement, container?: Item, item?: Item}} Contexto resolvido (vazio se não achar a linha).
 */
function _getContainedItemContext(sheet, element) {
  /** @type {HTMLElement|null} */
  const row = element.closest("[data-container-id][data-contained-item-id]");
  if (!row) return {};

  const container = sheet.actor.items.get(row.dataset.containerId);
  const item = container?.items?.get(row.dataset.containedItemId);
  return { row, container, item };
}

/**
 * Mantém o contêiner-pai aberto após uma ação num item contido — a ação
 * dispara update do documento e re-render, que fecharia o `<details>`.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do estado.
 * @param {HTMLElement} element - Elemento de origem do evento.
 * @returns {void}
 */
function _rememberContainedContainerOpen(sheet, element) {
  /** @type {HTMLElement|null} */
  const row = element.closest("[data-container-id]");
  _setInlineContainerOpen(sheet, row?.dataset.containerId, true);
}

/**
 * Encontra o alvo de drop mais próximo (linha do contêiner ou painel de
 * conteúdo) subindo a partir do elemento sob o cursor.
 * @param {HTMLElement} element - Elemento sob o cursor durante o drop.
 * @returns {HTMLElement|null} O alvo de drop, ou null fora de um contêiner.
 */
function _getInlineContainerDropTarget(element) {
  return element.closest("[data-container-drop-id], .pf1ar-container-contents");
}

/**
 * Extrai o id do item contêiner associado ao alvo de drop sob o cursor.
 * @param {HTMLElement} element - Elemento sob o cursor durante o drop.
 * @returns {string|undefined} Id do contêiner, ou undefined fora de um contêiner.
 */
function _getInlineContainerDropId(element) {
  const target = _getInlineContainerDropTarget(element);
  return target?.dataset.containerDropId || target?.dataset.containerId;
}

/**
 * dragstart de uma linha de item contido: monta o dragData no formato "Item"
 * do Foundry acrescido de `containerId`/`itemId`, para que o destino saiba
 * remover o item do contêiner de origem ao concluir a movimentação.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do ator.
 * @param {DragEvent} event - O evento de dragstart.
 * @returns {void}
 */
function _onContainedItemDragStart(sheet, event) {
  const { container, item } = _getContainedItemContext(sheet, /** @type {HTMLElement} */ (event.currentTarget));
  if (!container || !item) return;

  event.stopPropagation();
  event.stopImmediatePropagation?.();

  _setInlineContainerOpen(sheet, container.id, true);

  const dragData = {
    type: "Item",
    data: item.toObject(),
    containerId: container.id,
    itemId: item.id,
    actorUuid: sheet.actor?.uuid,
  };

  event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  event.dataTransfer.effectAllowed = "move";
}

/**
 * Trata o drop de um item sobre um contêiner inline: valida (só itens
 * físicos, sem contêiner dentro de si mesmo), oferece a conversão de magia em
 * consumível (fluxo padrão do PF1E), cria o conteúdo no contêiner de destino
 * e remove o item da origem quando a movimentação é dentro do mesmo ator.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet que recebeu o drop.
 * @param {DragEvent} event - O evento de drop.
 * @returns {Promise<Item[]|boolean|void>} Itens criados, false quando o prompt de magia é cancelado, ou void quando o drop é ignorado.
 */
async function _dropItemIntoInlineContainer(sheet, event) {
  event.preventDefault();
  event.stopPropagation();

  if (!sheet.isEditable || !sheet.actor?.isOwner) return;

  const containerId = _getInlineContainerDropId(/** @type {HTMLElement} */ (event.target));
  const container = sheet.actor.items.get(containerId);
  if (!container || container.type !== "container") return;

  sheet.element?.[0]
    ?.querySelectorAll(".pf1ar-container-drop-hover")
    .forEach((el) => el.classList.remove("pf1ar-container-drop-hover"));
  _setInlineContainerOpen(sheet, container.id, true);

  const data = TextEditor.getDragEventData(event);
  if (data.type !== "Item") return;

  const droppedItem = await Item.implementation.fromDropData(data);
  if (!droppedItem) return;

  if (droppedItem === container || droppedItem === container.rootItem) {
    ui.notifications.warn("This item cannot be placed inside itself.");
    return;
  }

  let sourceActor = data.actorUuid ? await fromUuid(data.actorUuid) : null;
  sourceActor ??= droppedItem.actor;
  const sameActor = sourceActor === sheet.actor;

  if (sameActor && data.containerId === container.id) return;

  const itemData = game.items.fromCompendium(droppedItem, {
    clearFolder: true,
    keepId: sameActor,
    clearSort: !sameActor,
  });

  if (itemData.type === "spell" && pf1.documents?.item?.ItemSpellPF?.toConsumablePrompt) {
    const resultData = await pf1.documents.item.ItemSpellPF.toConsumablePrompt(itemData, {
      allowSpell: false,
      actor: sheet.actor,
    });
    if (resultData) return container.createContainerContent(resultData);
    return false;
  }

  if (!droppedItem.isPhysical) {
    ui.notifications.warn("Only physical items can be placed inside a container.");
    return;
  }

  const created = await container.createContainerContent(itemData);

  if (sameActor && created?.length) {
    if (data.containerId) {
      sourceActor.containerItems
        ?.find((item) => item.id === data.itemId && item.parentItem?.id === data.containerId)
        ?.parentItem.deleteContainerContent(data.itemId);
    } else {
      await sourceActor.items.get(droppedItem.id)?.delete();
    }
  }

  return created;
}

/**
 * Faz o binding de todos os listeners do painel inline de contêineres:
 * persistência do `<details>` aberto, feedback visual de drag-over, drop,
 * dragstart das linhas filhas e os controles `data-action="pf1arContained*"`
 * (card, usar, editar, quantidade, identificar, duplicar, retirar, excluir,
 * usos). Espelha os comportamentos equivalentes da sheet do sistema PF1E,
 * que não alcançam itens contidos (não são embedded items do Actor).
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do ator.
 * @param {JQuery} html - Raiz renderizada da sheet, como recebida em activateListeners.
 * @returns {void}
 */
function _bindContainerContents(sheet, html) {
  const root = html[0];
  if (!root) return;

  root.querySelectorAll(".pf1ar-container-contents").forEach((el) => {
    el.addEventListener("click", (event) => event.stopPropagation());
    el.addEventListener("toggle", (event) => {
      const details = event.currentTarget;
      _setInlineContainerOpen(sheet, details.dataset.containerId, details.open);
    });
  });

  root.querySelectorAll("[data-container-drop-id], .pf1ar-container-contents").forEach((el) => {
    el.addEventListener("dragenter", (event) => {
      event.preventDefault();
      event.stopPropagation();
      el.classList.add("pf1ar-container-drop-hover");
    });
    el.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      el.classList.add("pf1ar-container-drop-hover");
    });
    el.addEventListener("dragleave", (event) => {
      if (!event.relatedTarget || !el.contains(event.relatedTarget)) {
        el.classList.remove("pf1ar-container-drop-hover");
      }
    });
    el.addEventListener("drop", (event) => _dropItemIntoInlineContainer(sheet, event));
  });

  root.querySelectorAll(".pf1ar-contained-row[draggable='true']").forEach((el) => {
    el.addEventListener("dragstart", (event) => _onContainedItemDragStart(sheet, event), { capture: true });
  });

  html.find('[data-action="pf1arContainedCard"]').on("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { item } = _getContainedItemContext(sheet, event.currentTarget);
    return item?.displayCard();
  });

  html.find('[data-action="pf1arContainedAction"]').on("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { item } = _getContainedItemContext(sheet, event.currentTarget);
    return item?.use({ ev: event });
  });

  html.find('[data-action="pf1arContainedEdit"]').on("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { item } = _getContainedItemContext(sheet, event.currentTarget);
    return item?.sheet.render(true, { focus: true, editable: sheet.isEditable });
  });

  html.find('[data-action="pf1arContainedQuantity"]').on("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!sheet.isEditable) return;
    _rememberContainedContainerOpen(sheet, event.currentTarget);

    const { item } = _getContainedItemContext(sheet, event.currentTarget);
    if (!item) return;

    let delta = Number(event.currentTarget.dataset.delta) || 0;
    if (event.shiftKey) delta *= 5;
    if (event.ctrlKey) delta *= 10;

    const current = Number(item.system.quantity) || 0;
    let quantity = Math.max(0, current + delta);
    if (item.type === "container" && quantity > 1) quantity = 1;
    return item.update({ "system.quantity": quantity });
  });

  html.find('[data-action="pf1arContainedIdentify"]').on("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!game.user.isGM) return void ui.notifications.error(game.i18n.localize("PF1.Error.CantIdentify"));
    _rememberContainedContainerOpen(sheet, event.currentTarget);

    const { item } = _getContainedItemContext(sheet, event.currentTarget);
    if (!item || item.system.identified === undefined) return;
    return item.update({ "system.identified": !item.system.identified });
  });

  html.find('[data-action="pf1arContainedDuplicate"]').on("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!sheet.isEditable) return;
    _rememberContainedContainerOpen(sheet, event.currentTarget);

    const { container, item } = _getContainedItemContext(sheet, event.currentTarget);
    if (!container || !item) return;

    const itemData = item.toObject();
    delete itemData._id;
    delete itemData.system?.links?.children;
    delete itemData.system?.links?.charges;

    itemData._stats ??= {};
    itemData._stats.duplicateSource ||= item.uuid;
    itemData.name = `${itemData.name} (${game.i18n.localize("PF1.Copy")})`;
    if (item.isPhysical && !item.system.identified) {
      itemData.system.unidentified ??= {};
      itemData.system.unidentified.name = `${item.system.unidentified?.name ?? item.name} (${game.i18n.localize(
        "PF1.Copy",
      )})`;
    }

    return container.createContainerContent(itemData);
  });

  html.find('[data-action="pf1arContainedTake"]').on("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!sheet.isEditable) return;
    _rememberContainedContainerOpen(sheet, event.currentTarget);

    const { container, item } = _getContainedItemContext(sheet, event.currentTarget);
    if (!container || !item) return;

    const created = await Item.implementation.create(item.toObject(), { parent: sheet.actor });
    if (created) return container.deleteContainerContent(item.id);
  });

  html.find('[data-action="pf1arContainedDelete"]').on("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!sheet.isEditable) return;
    _rememberContainedContainerOpen(sheet, event.currentTarget);

    const { container, item } = _getContainedItemContext(sheet, event.currentTarget);
    if (!container || !item) return;

    const confirm = await foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.format("PF1.DeleteItemTitle", { name: item.name }), icon: "fa-solid fa-trash" },
      classes: ["pf1-v2", "delete-item"],
      content: `<p>${game.i18n.localize("PF1.DeleteItemConfirmation")}</p>`,
      rejectClose: false,
      modal: true,
    });

    if (confirm) return container.deleteContainerContent(item.id);
  });

  html.find(".pf1ar-contained-uses-input").on("change wheel", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!sheet.isEditable) return;
    _rememberContainedContainerOpen(sheet, event.currentTarget);

    const input = event.currentTarget;
    const { item } = _getContainedItemContext(sheet, input);
    if (!item) return;

    if (event.originalEvent instanceof WheelEvent) {
      const current = Number(input.value);
      if (!Number.isFinite(current)) return;
      const step = Number(input.dataset.wheelStep) || 1;
      input.value = current + step * -Math.sign(event.originalEvent.deltaY);
    }

    const value = Number(input.value);
    if (!Number.isFinite(value)) return;
    return item.update({ "system.uses.value": value });
  });
}

// ─── BINDING DAS ROLAGENS ─────────────────────────────────────────────────────
// A sheet-pai (ActorSheetPFCharacter/NPC) escuta seletores CSS específicos
// (.ability-name, .attribute.initiative .rollable etc.) que não batem com as
// nossas classes. Em vez disso, ligamos nossos atributos data-action="rollX"
// diretamente aos métodos de rolagem do Actor do PF1E.

/**
 * Liga os `data-action` de rolagem dos templates aos métodos do Actor PF1E:
 * rollAbility→rollAbilityTest, rollSave→rollSavingThrow, rollInit→
 * rollInitiative, rollBAB, rollCMB/rollGenericAttack→rollAttack e rollSkill.
 * Sem binding quando a sheet não é editável (mesma regra da sheet do sistema).
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do ator.
 * @param {JQuery} html - Raiz renderizada da sheet, como recebida em activateListeners.
 * @returns {void}
 */
function _bindRollActions(sheet, html) {
  if (!sheet.isEditable) return;

  const actor = sheet.actor;
  const token = sheet.token;

  html.find('[data-action="rollAbility"]').on("click", (e) => {
    e.preventDefault();
    const ability = e.currentTarget.dataset.ability;
    actor.rollAbilityTest(ability, { token });
  });

  html.find('[data-action="rollSave"]').on("click", (e) => {
    e.preventDefault();
    const save = e.currentTarget.dataset.savingthrow;
    actor.rollSavingThrow(save, { token });
  });

  html.find('[data-action="rollInit"]').on("click", (e) => {
    e.preventDefault();
    actor.rollInitiative({ createCombatants: true, rerollInitiative: game.user.isGM, token });
  });

  html.find('[data-action="rollBAB"]').on("click", (e) => {
    e.preventDefault();
    actor.rollBAB({ token });
  });

  // CMB (manobra de combate) = ataque de manobra corpo a corpo, sem arma.
  html.find('[data-action="rollCMB"]').on("click", (e) => {
    e.preventDefault();
    actor.rollAttack({ maneuver: true, ranged: false, token });
  });

  // Ataque genérico corpo a corpo/à distância do cabeçalho de combate.
  html.find('[data-action="rollGenericAttack"]').on("click", (e) => {
    e.preventDefault();
    const ranged = e.currentTarget.dataset.ranged === "true";
    actor.rollAttack({ maneuver: false, ranged, token });
  });

  html.find('[data-action="rollSkill"]').on("click", (e) => {
    e.preventDefault();
    const skill = e.currentTarget.dataset.skill;
    const subSkill = e.currentTarget.dataset.subSkill || undefined;
    actor.rollSkill(skill, { subSkill, token });
  });
}

// ─── TEMA / MODO ESCURO / DENSIDADE ──────────────────────────────────────────
// Preferências por usuário (client-scoped). As classes são aplicadas no
// elemento externo da aplicação para que tanto .window-content quanto o form
// herdem os overrides de variáveis CSS.

/** Ordem de ciclo dos temas visuais do botão de paleta do cabeçalho. */
const PF1AR_THEMES = ["parchment", "hybrid", "slate"];

/**
 * Sincroniza as classes de tema/escuro/compacto da raiz da sheet com as
 * settings. Chamada a cada activateListeners e, indiretamente, pelo re-render
 * do onChange das settings — sempre reflete a preferência atual do cliente.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet cuja raiz recebe as classes.
 * @returns {void}
 */
function _applyTheme(sheet) {
  const root = sheet.element?.[0];
  if (!root) return;

  root.classList.toggle("pf1ar-dark", !!game.settings.get(MODULE_ID, "darkMode"));

  const theme = game.settings.get(MODULE_ID, "theme") || "parchment";
  for (const t of PF1AR_THEMES) root.classList.toggle(`pf1ar-theme-${t}`, t === theme);

  root.classList.toggle("pf1ar-compact", !!game.settings.get(MODULE_ID, "compact"));
}

/**
 * Faz o binding do botão sol/lua do cabeçalho, que alterna o modo escuro.
 * A classe é aplicada direto no DOM (sem re-render) para a troca ser
 * instantânea; o ícone acompanha o novo estado.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do botão.
 * @param {JQuery} html - Raiz renderizada da sheet, como recebida em activateListeners.
 * @returns {void}
 */
function _bindThemeToggle(sheet, html) {
  html.find('[data-action="pf1arToggleTheme"]').on("click", async (e) => {
    e.preventDefault();
    const next = !game.settings.get(MODULE_ID, "darkMode");
    await game.settings.set(MODULE_ID, "darkMode", next);
    const root = sheet.element?.[0];
    if (root) root.classList.toggle("pf1ar-dark", next);
    const icon = e.currentTarget.querySelector("i");
    if (icon) icon.className = `fa-solid ${next ? "fa-sun" : "fa-moon"}`;
  });
}

/**
 * Faz o binding do botão de paleta do cabeçalho, que percorre PF1AR_THEMES a
 * cada clique. O re-render (e a troca de classe) acontece via onChange da
 * setting "theme" — por isso aqui só se grava a preferência.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do botão.
 * @param {JQuery} html - Raiz renderizada da sheet, como recebida em activateListeners.
 * @returns {void}
 */
function _bindThemeCycle(sheet, html) {
  html.find('[data-action="pf1arCycleTheme"]').on("click", async (e) => {
    e.preventDefault();
    const current = game.settings.get(MODULE_ID, "theme") || "parchment";
    const next = PF1AR_THEMES[(PF1AR_THEMES.indexOf(current) + 1) % PF1AR_THEMES.length];
    await game.settings.set(MODULE_ID, "theme", next);
  });
}

// ─── 10X GRANULARITY VISUAL INTERCEPTOR ─────────────────────────────────────

function _apply10xVisuals(sheet, data) {
  if (!game.settings.get(MODULE_ID, "enable10xGranularity")) return;

  const scaleCL = (formula) => {
    if (typeof formula !== "string") return formula;
    let res = formula.replace(/min\((\d+),\s*@cl\)/gi, (m, cap) => `min(${Number(cap)*10}, (@cl * 10))`);
    res = res.replace(/max\((\d+),\s*@cl\)/gi, (m, cap) => `max(${Number(cap)*10}, (@cl * 10))`);
    res = res.replace(/\+\s*@cl\b/gi, "+ (@cl * 10)");
    res = res.replace(/-\s*@cl\b/gi, "- (@cl * 10)");
    
    res = res.replace(/\b(\d*)d(\d+)\b/g, (match, count, faces) => `${count || 1}d${Number(faces) * 10}`);
    return res.replace(/(?<![d@\w\.])\b(\d+)\b(?!\s*[d\.])/g, (match, num) => `${Number(num) * 10}`);
  };

  const scaleSectionItems = (sectionArr) => {
    if (!Array.isArray(sectionArr)) return sectionArr;
    return sectionArr.map(section => {
      const newSection = { ...section };
      
      const processItems = (itemsArray) => {
        return itemsArray.map(item => {
          const newItem = { ...item };
          
          if (newItem.labels) {
            newItem.labels = { ...newItem.labels };
            if (newItem.labels.damage) newItem.labels.damage = scaleCL(newItem.labels.damage);
          }
          
          if (newItem.system && Array.isArray(newItem.system.actions)) {
            newItem.system = { ...newItem.system };
            newItem.system.actions = newItem.system.actions.map(action => {
              const newAction = { ...action };
              if (newAction.damage && Array.isArray(newAction.damage.parts)) {
                newAction.damage = { ...newAction.damage };
                newAction.damage.parts = newAction.damage.parts.map(part => {
                  const newPart = { ...part };
                  if (newPart.formula) newPart.formula = scaleCL(newPart.formula);
                  return newPart;
                });
              }
              return newAction;
            });
          }
          return newItem;
        });
      };

      if (Array.isArray(newSection.items)) newSection.items = processItems(newSection.items);
      if (Array.isArray(newSection.spells)) newSection.spells = processItems(newSection.spells);
      
      return newSection;
    });
  };

  data.inventory = scaleSectionItems(data.inventory);
  data.attacks = scaleSectionItems(data.attacks);
  
  if (data.spellbooks) {
    data.spellbooks = { ...data.spellbooks };
    for (let book of Object.keys(data.spellbooks)) {
      data.spellbooks[book] = scaleSectionItems(data.spellbooks[book]);
    }
  }
}

// ─── FICHA DE PERSONAGEM ──────────────────────────────────────────────────────

/**
 * Ficha alternativa de personagem (PC). Herda toda a preparação de dados e os
 * listeners da sheet de personagem do sistema PF1E, trocando apenas o
 * template, as classes CSS da janela e os bindings adicionais do módulo.
 */
export class AltCharacterSheetPF extends pf1.applications.actor.ActorSheetPFCharacter {
  /**
   * Para atores com permissão "limited", devolve a limited-sheet do próprio
   * sistema (mesmo comportamento da sheet original do PF1E).
   * @inheritdoc
   */
  get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/pf1/templates/actors/limited-sheet.hbs";
    }
    return `${M}/templates/character-sheet.hbs`;
  }

  /**
   * Opções da Application V1: classes CSS próprias (`.pf1ar-sheet` escopa
   * todo o CSS do módulo, longe do `.pf1` do sistema), dimensões e a config
   * das abas (navSelector/contentSelector/initial/group) — o Foundry cuida de
   * alternar `.active` nos `.tab` via `this._tabs`.
   * @inheritdoc
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["pf1-altsheet-reworked", "pf1ar-sheet", "sheet", "actor", "character"],
      width: 1005,
      height: 1029,
      scrollY: [
        ".primary-body > .tab",
        ".attacks-body",
        ".inventory-body",
        ".feats-body",
        ".buffs-body",
        ".skillset-body",
      ],
      tabs: [
        {
          navSelector: "nav.tabs[data-group='primary']",
          contentSelector: "section.primary-body",
          initial: "summary",
          group: "primary",
        },
        {
          navSelector: "nav.tabs[data-group='skillset']",
          contentSelector: "section.skillset-body",
          initial: "adventure",
          group: "skills",
        },
        {
          navSelector: "nav.tabs[data-group='spellbooks']",
          contentSelector: "section.spellbooks-body",
          initial: "primary",
          group: "spellbooks",
        },
      ],
    });
  }

  /**
   * Acrescenta ao contexto do sistema o estado do modo escuro (ícone inicial
   * do botão), o filtro de perícias do resumo e os render models dos
   * contêineres inline.
   * @inheritdoc
   */
  async getData(options) {
    const data = await super.getData(options);
    data.pf1arDark = game.settings.get(MODULE_ID, "darkMode");
    data.summarySkillsMode = game.settings.get(MODULE_ID, "summarySkills");
    _prepareInventoryContainers(this, data);
    _prepareLinkedFeatChildren(this, data);
    // Inject 10x Visuals before handing data to Handlebars
    _apply10xVisuals(this, data);
    return data;
  }

  /**
   * Além dos listeners do sistema, aplica tema/densidade e liga os bindings
   * próprios do módulo (rolagens por data-action e contêineres inline).
   * @inheritdoc
   */
  activateListeners(html) {
    super.activateListeners(html);
    _applyTheme(this);
    _bindThemeToggle(this, html);
    _bindThemeCycle(this, html);
    _bindRollActions(this, html);
    _bindContainerContents(this, html);
  }
}

// ─── FICHA DE NPC ─────────────────────────────────────────────────────────────

/**
 * Ficha alternativa de NPC. Mesma estrutura da {@link AltCharacterSheetPF},
 * estendendo a sheet de NPC do sistema PF1E.
 */
export class AltNPCSheetPF extends pf1.applications.actor.ActorSheetPFNPC {
  /**
   * Para atores com permissão "limited", devolve a limited-sheet do próprio
   * sistema (mesmo comportamento da sheet original do PF1E).
   * @inheritdoc
   */
  get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/pf1/templates/actors/limited-sheet.hbs";
    }
    return `${M}/templates/npc-sheet.hbs`;
  }

  /**
   * Opções da Application V1 — ver {@link AltCharacterSheetPF.defaultOptions};
   * difere apenas nas classes CSS (`pf1ar-npc`/`npc`).
   * @inheritdoc
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["pf1-altsheet-reworked", "pf1ar-sheet", "pf1ar-npc", "sheet", "actor", "npc"],
      width: 1005,
      height: 1029,
      scrollY: [
        ".primary-body > .tab",
        ".attacks-body",
        ".inventory-body",
        ".feats-body",
        ".buffs-body",
        ".skillset-body",
      ],
      tabs: [
        {
          navSelector: "nav.tabs[data-group='primary']",
          contentSelector: "section.primary-body",
          initial: "summary",
          group: "primary",
        },
        {
          navSelector: "nav.tabs[data-group='skillset']",
          contentSelector: "section.skillset-body",
          initial: "adventure",
          group: "skills",
        },
        {
          navSelector: "nav.tabs[data-group='spellbooks']",
          contentSelector: "section.spellbooks-body",
          initial: "primary",
          group: "spellbooks",
        },
      ],
    });
  }

  /**
   * Acrescenta ao contexto do sistema o estado do modo escuro, o filtro de
   * perícias do resumo e os render models dos contêineres inline.
   * @inheritdoc
   */
  async getData(options) {
    const data = await super.getData(options);
    data.pf1arDark = game.settings.get(MODULE_ID, "darkMode");
    data.summarySkillsMode = game.settings.get(MODULE_ID, "summarySkills");
    _prepareInventoryContainers(this, data);
    _prepareLinkedFeatChildren(this, data);
    // Inject 10x Visuals before handing data to Handlebars
    _apply10xVisuals(this, data);
    return data;
  }

  /**
   * Além dos listeners do sistema, aplica tema/densidade e liga os bindings
   * próprios do módulo (rolagens por data-action e contêineres inline).
   * @inheritdoc
   */
  activateListeners(html) {
    super.activateListeners(html);
    _applyTheme(this);
    _bindThemeToggle(this, html);
    _bindThemeCycle(this, html);
    _bindRollActions(this, html);
    _bindContainerContents(this, html);
  }
}