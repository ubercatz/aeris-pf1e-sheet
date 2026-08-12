import React, { useState, useEffect, useMemo } from 'react';

// --- NESTED FEATURE COMPONENT ---
const CollapsibleFeature = ({ item, actor }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const childItems = useMemo(() => {
        const children = [];
        try {
            const classAssoc = item.flags?.pf1?.links?.classAssociations || {};
            Object.keys(classAssoc).forEach(id => {
                const child = actor.items.get(id);
                if (child) children.push(child);
            });

            const charges = item.system?.links?.charges;
            if (Array.isArray(charges)) {
                charges.forEach(charge => {
                    const idMatch = charge.uuid?.match(/Item\.([a-zA-Z0-9]+)$/);
                    if (idMatch && idMatch[1]) {
                        const child = actor.items.get(idMatch[1]);
                        if (child && !children.some(c => c.id === child.id)) children.push(child);
                    }
                });
            }
        } catch (err) {
            console.error("Error parsing children for", item.name, err);
        }
        return children;
    }, [item, actor]);

    return (
        <div className="mb-2 bg-slate-800 rounded-lg border border-slate-700 shadow-sm overflow-hidden transition-all">
            <button 
                type="button"
                className="w-full flex justify-between items-center p-2 cursor-pointer hover:bg-slate-750 transition-colors text-left"
                onClick={(e) => {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                }}
            >
                <div className="flex items-center space-x-3">
                    {item.img && (
                        <img 
                            src={item.img} 
                            alt={item.name} 
                            style={{ width: '32px', height: '32px', minWidth: '32px', objectFit: 'cover' }} 
                            className="rounded bg-slate-900 border border-slate-700" 
                        />
                    )}
                    <span className="text-sm font-bold text-slate-200">{item.name}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                    {childItems.length > 0 && (
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full border border-amber-500/30">
                            {childItems.length} Linked
                        </span>
                    )}
                    <span className="text-slate-400 text-xs w-4 text-center">
                        {isExpanded ? '▼' : '▶'}
                    </span>
                </div>
            </button>

            {isExpanded && (
                <div className="p-3 border-t border-slate-700 bg-slate-900/50">
                    <div 
                        className="text-xs text-slate-300 space-y-2 mb-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: item.system?.description?.value || 'No description provided.' }}
                    />
                    {childItems.length > 0 && (
                        <div className="mt-3 pl-3 border-l-2 border-slate-600 space-y-2">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Linked Features</h4>
                            {childItems.map(child => (
                                <CollapsibleFeature key={child.id} item={child} actor={actor} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App({ actor, sheet }) {
    const [tick, setTick] = useState(0);
    const [use10xMultiplier, setUse10xMultiplier] = useState(false);
    const [activeTab, setActiveTab] = useState('combat');

    useEffect(() => {
        const updateHandler = () => setTick(t => t + 1);
        Hooks.on('updateActor', (updatedActor) => {
            if (updatedActor.id === actor.id) updateHandler();
        });
        Hooks.on('updateItem', (item) => {
            if (item.parent?.id === actor.id) updateHandler();
        });
        Hooks.on('createItem', (item) => {
            if (item.parent?.id === actor.id) updateHandler();
        });
        Hooks.on('deleteItem', (item) => {
            if (item.parent?.id === actor.id) updateHandler();
        });
    }, [actor]);

    const handleDrop = async (e) => {
        e.preventDefault();
        try {
            // Let Foundry handle the complex data resolution safely
            await sheet._onDrop(e.nativeEvent || e);
        } catch (err) {
            console.error("Drop resolution failed safely:", err);
        }
    };

    const handleUpdate = (path, value, is10xStat = false) => {
        let finalValue = Number(value);
        if (is10xStat && use10xMultiplier) {
            finalValue = finalValue / 10;
        }
        actor.update({ [path]: finalValue });
    };

    // Item Creation Handler
    const createItem = async (type, name) => {
        await actor.createEmbeddedDocuments("Item", [{ name, type }]);
    };

    const stats = useMemo(() => {
        const mult = use10xMultiplier ? 10 : 1;
        const system = actor.system || {};
        
        return {
            hp: {
                current: (system.attributes?.hp?.value || 0) * mult,
                max: (system.attributes?.hp?.max || 0) * mult,
            },
            str: (system.abilities?.str?.value || 10) * mult,
            dex: (system.abilities?.dex?.value || 10) * mult,
            con: (system.abilities?.con?.value || 10) * mult,
        };
    }, [actor, use10xMultiplier, tick]); // Added tick to force recalculation

    const topLevelFeatures = useMemo(() => {
        try {
            const allFeatures = actor.items.filter(i => i.type === 'class' || i.type === 'feat');
            const childIds = new Set();
            
            allFeatures.forEach(item => {
                const classAssoc = item.flags?.pf1?.links?.classAssociations || {};
                Object.keys(classAssoc).forEach(id => childIds.add(id));
                
                const charges = item.system?.links?.charges;
                if (Array.isArray(charges)) {
                    charges.forEach(charge => {
                        const idMatch = charge.uuid?.match(/Item\.([a-zA-Z0-9]+)$/);
                        if (idMatch && idMatch[1]) childIds.add(idMatch[1]);
                    });
                }
            });

            return allFeatures.filter(f => !childIds.has(f.id));
        } catch (err) {
            console.error("Error building top level features:", err);
            return [];
        }
    }, [actor, actor.items, tick]); // Added tick to force recalculation

    return (
        <div 
            className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 overflow-hidden font-sans"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()}
        >
            {/* Header */}
            <header className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700 mb-4 shadow-md flex-shrink-0">
                <div>
                    <h1 className="text-xl font-black text-amber-400 tracking-wide">{actor.name}</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">PF1e React Engine</p>
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        setUse10xMultiplier(!use10xMultiplier);
                    }}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all border ${
                        use10xMultiplier 
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                            : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                >
                    {use10xMultiplier ? '10X ENGINE ACTIVE' : 'STANDARD MATH'}
                </button>
            </header>

            {/* Vitals Quick-Bar */}
            <div className="grid grid-cols-4 gap-2 mb-4 flex-shrink-0">
                <div className="bg-slate-800 p-2 rounded-lg text-center border border-slate-700 shadow-sm flex flex-col justify-center">
                    <label className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Health</label>
                    <div className="flex items-center justify-center space-x-1">
                        <input 
                            type="number" 
                            value={stats.hp.current}
                            onChange={(e) => handleUpdate('system.attributes.hp.value', e.target.value, true)}
                            className="w-10 bg-slate-900 border border-slate-600 rounded text-emerald-400 text-center text-sm font-bold focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                        <span className="text-slate-500 font-bold text-sm">/</span>
                        <input 
                            type="number" 
                            value={stats.hp.max}
                            onChange={(e) => handleUpdate('system.attributes.hp.max', e.target.value, true)}
                            className="w-10 bg-slate-900 border border-slate-600 rounded text-emerald-400 text-center text-sm font-bold focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                    </div>
                </div>
                
                {['str', 'dex', 'con'].map((stat) => (
                    <div key={stat} className="bg-slate-800 p-2 rounded-lg text-center border border-slate-700 shadow-sm">
                        <label className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider mb-1">{stat}</label>
                        <input 
                            type="number" 
                            value={stats[stat]}
                            onChange={(e) => handleUpdate(`system.abilities.${stat}.value`, e.target.value, true)}
                            className="w-full bg-slate-900 border border-slate-600 rounded py-1 text-amber-300 text-center text-base font-black focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <nav className="flex space-x-4 border-b border-slate-700 mb-4 px-2 flex-shrink-0">
                {['combat', 'inventory', 'spells', 'feats'].map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveTab(tab);
                        }}
                        className={`pb-2 text-xs font-bold capitalize transition-all ${
                            activeTab === tab 
                                ? 'border-b-2 border-amber-400 text-amber-400' 
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            {/* Dynamic Content Workspace */}
            <main className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
                
                {/* COMBAT TAB */}
                {activeTab === 'combat' && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-2">
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attacks & Weapons</h2>
                            <button 
                                type="button" 
                                onClick={() => createItem('attack', 'New Attack')}
                                className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded transition-colors"
                            >
                                + Add Attack
                            </button>
                        </div>
                        {actor.items.filter(i => i.type === 'weapon' || i.type === 'attack').map(weapon => (
                            <div key={weapon.id} className="flex justify-between items-center bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-sm hover:border-slate-500 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <img 
                                        src={weapon.img} 
                                        alt={weapon.name} 
                                        style={{ width: '32px', height: '32px', minWidth: '32px', objectFit: 'cover' }} 
                                        className="rounded bg-slate-900 border border-slate-700" 
                                    />
                                    <span className="text-sm font-bold text-slate-200">{weapon.name}</span>
                                </div>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        weapon.use();
                                    }}
                                    className="bg-slate-700 hover:bg-amber-600 text-[10px] px-3 py-1.5 rounded font-bold text-slate-200 hover:text-slate-950 transition-colors border border-slate-600 hover:border-amber-500"
                                >
                                    Attack
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* INVENTORY TAB */}
                {activeTab === 'inventory' && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-2">
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Equipment & Items</h2>
                            <button 
                                type="button" 
                                onClick={() => createItem('loot', 'New Item')}
                                className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded transition-colors"
                            >
                                + Add Item
                            </button>
                        </div>
                        {actor.items.filter(i => ['weapon', 'equipment', 'consumable', 'loot', 'container'].includes(i.type)).map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-sm">
                                <div className="flex items-center space-x-3">
                                    <img 
                                        src={item.img} 
                                        alt={item.name} 
                                        style={{ width: '32px', height: '32px', minWidth: '32px', objectFit: 'cover' }} 
                                        className="rounded bg-slate-900 border border-slate-700" 
                                    />
                                    <span className="text-sm font-bold text-slate-200">{item.name}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.type}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* SPELLS TAB */}
                {activeTab === 'spells' && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-2">
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spellbook</h2>
                            <button 
                                type="button" 
                                onClick={() => createItem('spell', 'New Spell')}
                                className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded transition-colors"
                            >
                                + Add Spell
                            </button>
                        </div>
                        {actor.items.filter(i => i.type === 'spell').map(spell => (
                            <div key={spell.id} className="flex justify-between items-center bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-sm">
                                <div className="flex items-center space-x-3">
                                    <img 
                                        src={spell.img} 
                                        alt={spell.name} 
                                        style={{ width: '32px', height: '32px', minWidth: '32px', objectFit: 'cover' }} 
                                        className="rounded bg-slate-900 border border-slate-700" 
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-200">{spell.name}</span>
                                        <span className="text-[10px] text-slate-500">Level {spell.system?.level || 0}</span>
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        spell.use();
                                    }}
                                    className="bg-slate-700 hover:bg-emerald-600 text-[10px] px-3 py-1.5 rounded font-bold text-slate-200 hover:text-slate-950 transition-colors border border-slate-600 hover:border-emerald-500"
                                >
                                    Cast
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* FEATS TAB */}
                {activeTab === 'feats' && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-2">
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classes & Features</h2>
                            <button 
                                type="button" 
                                onClick={() => createItem('feat', 'New Feature')}
                                className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded transition-colors"
                            >
                                + Add Feat
                            </button>
                        </div>
                        {topLevelFeatures.map(item => (
                            <CollapsibleFeature key={item.id} item={item} actor={actor} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}