import React, { useState, useEffect, useMemo } from 'react';

// --- NEW COMPONENT: Collapsible Nested Features ---
const CollapsibleFeature = ({ item, actor }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // 1. Identify Child Items dynamically based on PF1e native data structures
    const childItems = useMemo(() => {
        const children = [];
        
        // Check for Class Associations (e.g., Samurai -> Challenge)
        const classAssoc = item.flags?.pf1?.links?.classAssociations || {};
        Object.keys(classAssoc).forEach(id => {
            const child = actor.items.get(id);
            if (child) children.push(child);
        });

        // Check for Charges/Nested Abilities (e.g., Hero Points -> Extra Action)
        const charges = item.system?.links?.charges || [];
        charges.forEach(charge => {
            const idMatch = charge.uuid?.match(/Item\.([a-zA-Z0-9]+)$/);
            if (idMatch && idMatch[1]) {
                const child = actor.items.get(idMatch[1]);
                if (child && !children.some(c => c.id === child.id)) {
                    children.push(child);
                }
            }
        });

        return children;
    }, [item, actor]);

    return (
        <div className="mb-2 bg-slate-800 rounded-lg border border-slate-700 shadow-sm overflow-hidden transition-all">
            {/* Clickable Header */}
            <button 
                type="button"
                className="w-full flex justify-between items-center p-3 cursor-pointer hover:bg-slate-750 transition-colors text-left"
                onClick={(e) => {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                }}
            >
                <div className="flex items-center space-x-3">
                    {item.img && (
                        <img src={item.img} alt={item.name} className="w-8 h-8 rounded bg-slate-900 border border-slate-700 object-cover" />
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

            {/* Expandable Content Body */}
            {isExpanded && (
                <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                    {/* Item Description (Parses PF1e HTML formatting) */}
                    <div 
                        className="text-xs text-slate-300 space-y-2 mb-4 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: item.system?.description?.value || 'No description provided.' }}
                    />
                    
                    {/* Render Nested Children Recursively */}
                    {childItems.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-slate-600 space-y-2">
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

export default function App({ actor, sheet }) {
    const [, setTick] = useState(0);
    const [use10xMultiplier, setUse10xMultiplier] = useState(false);
    const [activeTab, setActiveTab] = useState('feats'); // Defaulting to feats to test the new layout

    useEffect(() => {
        const updateHandler = () => setTick(t => t + 1);
        Hooks.on('updateActor', (updatedActor) => {
            if (updatedActor.id === actor.id) updateHandler();
        });
        Hooks.on('updateItem', (item) => {
            if (item.parent?.id === actor.id) updateHandler();
        });
    }, [actor]);

    const handleDrop = (e) => {
        e.preventDefault();
        sheet._onDrop(e.nativeEvent || e);
    };

    const handleUpdate = (path, value, is10xStat = false) => {
        let finalValue = Number(value);
        if (is10xStat && use10xMultiplier) {
            finalValue = finalValue / 10;
        }
        actor.update({ [path]: finalValue });
    };

    const stats = useMemo(() => {
        const mult = use10xMultiplier ? 10 : 1;
        const system = actor.system;
        
        return {
            hp: {
                current: (system.attributes?.hp?.value || 0) * mult,
                max: (system.attributes?.hp?.max || 0) * mult,
            },
            str: (system.abilities?.str?.value || 10) * mult,
            dex: (system.abilities?.dex?.value || 10) * mult,
            con: (system.abilities?.con?.value || 10) * mult,
        };
    }, [actor, use10xMultiplier]);

    // Gather top-level classes and feats (filtering out ones that act as children)
    const topLevelFeatures = useMemo(() => {
        const allFeatures = actor.items.filter(i => i.type === 'class' || i.type === 'feat');
        
        // Build a set of all item IDs that are children of something else
        const childIds = new Set();
        allFeatures.forEach(item => {
            const classAssoc = item.flags?.pf1?.links?.classAssociations || {};
            Object.keys(classAssoc).forEach(id => childIds.add(id));
            
            const charges = item.system?.links?.charges || [];
            charges.forEach(charge => {
                const idMatch = charge.uuid?.match(/Item\.([a-zA-Z0-9]+)$/);
                if (idMatch && idMatch[1]) childIds.add(idMatch[1]);
            });
        });

        // Only return features that are NOT in the childIds set
        return allFeatures.filter(f => !childIds.has(f.id));
    }, [actor, actor.items]);

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
                    <h1 className="text-2xl font-black text-amber-400 tracking-wide">{actor.name}</h1>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">PF1e React Engine</p>
                </div>
                
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        setUse10xMultiplier(!use10xMultiplier);
                    }}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all border ${
                        use10xMultiplier 
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                            : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                >
                    {use10xMultiplier ? '10X ENGINE ACTIVE' : 'STANDARD MATH'}
                </button>
            </header>

            {/* Editable Vitals Quick-Bar */}
            <div className="grid grid-cols-4 gap-3 mb-4 flex-shrink-0">
                <div className="bg-slate-800 p-2 rounded-lg text-center border border-slate-700 shadow-sm flex flex-col justify-center">
                    <label className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Health</label>
                    <div className="flex items-center justify-center space-x-1">
                        <input 
                            type="number" 
                            value={stats.hp.current}
                            onChange={(e) => handleUpdate('system.attributes.hp.value', e.target.value, true)}
                            className="w-12 bg-slate-900 border border-slate-600 rounded text-emerald-400 text-center font-bold focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                        <span className="text-slate-500 font-bold">/</span>
                        <input 
                            type="number" 
                            value={stats.hp.max}
                            onChange={(e) => handleUpdate('system.attributes.hp.max', e.target.value, true)}
                            className="w-12 bg-slate-900 border border-slate-600 rounded text-emerald-400 text-center font-bold focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                    </div>
                </div>
                
                {['str', 'dex', 'con'].map((stat) => (
                    <div key={stat} className="bg-slate-800 p-2 rounded-lg text-center border border-slate-700 shadow-sm">
                        <label className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-1">{stat}</label>
                        <input 
                            type="number" 
                            value={stats[stat]}
                            onChange={(e) => handleUpdate(`system.abilities.${stat}.value`, e.target.value, true)}
                            className="w-full bg-slate-900 border border-slate-600 rounded py-1 text-amber-300 text-center text-lg font-black focus:ring-1 focus:ring-amber-500 outline-none transition-all"
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
                        className={`pb-2 text-sm font-bold capitalize transition-all ${
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
                {activeTab === 'combat' && (
                    <div className="space-y-2">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-1 mb-2">Weapons</h2>
                        {actor.items.filter(i => i.type === 'weapon').map(weapon => (
                            <div key={weapon.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-sm hover:border-slate-500 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <img src={weapon.img} alt={weapon.name} className="w-8 h-8 rounded bg-slate-900 border border-slate-700" />
                                    <span className="text-sm font-bold text-slate-200">{weapon.name}</span>
                                </div>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        weapon.use();
                                    }}
                                    className="bg-slate-700 hover:bg-amber-600 text-xs px-3 py-1.5 rounded font-bold text-slate-200 hover:text-slate-950 transition-colors border border-slate-600 hover:border-amber-500"
                                >
                                    Attack
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'feats' && (
                    <div className="space-y-2">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-1 mb-3">Classes & Features</h2>
                        {/* Map over our filtered top-level features */}
                        {topLevelFeatures.map(item => (
                            <CollapsibleFeature key={item.id} item={item} actor={actor} />
                        ))}
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 border-2 border-dashed border-slate-700 rounded-lg p-10 bg-slate-800/50">
                        <span className="text-4xl mb-2">📥</span>
                        <p className="text-sm font-bold">Drop Compendium Items Here</p>
                        <p className="text-xs mt-1">Native Foundry drag-and-drop is active.</p>
                    </div>
                )}
            </main>
        </div>
    );
}