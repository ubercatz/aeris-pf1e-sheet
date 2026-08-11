import React, { useState, useEffect, useMemo } from 'react';

export default function App({ actor }) {
    const [, setTick] = useState(0);
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
    }, [actor]);

    const handleDrop = async (e) => {
        e.preventDefault();
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (data.type === 'Item') {
                const item = await Item.implementation.fromDropData(data);
                if (item) await actor.createEmbeddedDocuments('Item', [item.toObject()]);
            }
        } catch (err) {
            console.error('Failed to drop item:', err);
        }
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
            int: (system.abilities?.int?.value || 10) * mult,
            wis: (system.abilities?.wis?.value || 10) * mult,
            cha: (system.abilities?.cha?.value || 10) * mult,
        };
    }, [actor, use10xMultiplier]);

    const rollNativeAttack = (item) => item.use();

    return (
        <div 
            className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 overflow-hidden font-sans select-none"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()} // <-- THIS PREVENTS REFRESH ON ALL BUTTON CLICKS
        >
            {/* Header / Vitals Bar */}
            <header className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700 mb-3">
                <div>
                    <h1 className="text-xl font-bold text-amber-400">{actor.name}</h1>
                    <p className="text-xs text-slate-400">Pathfinder 1e React Engine</p>
                </div>
                
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        setUse10xMultiplier(!use10xMultiplier);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                        use10xMultiplier 
                            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                    {use10xMultiplier ? '10x Engine Active' : 'Standard PF1e Math'}
                </button>
            </header>

            {/* Vitals Quick-Bar */}
            <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-slate-800 p-2 rounded text-center border border-slate-700">
                    <span className="text-xs text-slate-400 block">Health</span>
                    <span className="text-lg font-bold text-emerald-400">{stats.hp.current} / {stats.hp.max}</span>
                </div>
                <div className="bg-slate-800 p-2 rounded text-center border border-slate-700">
                    <span className="text-xs text-slate-400 block">STR</span>
                    <span className="text-lg font-bold text-amber-300">{stats.str}</span>
                </div>
                <div className="bg-slate-800 p-2 rounded text-center border border-slate-700">
                    <span className="text-xs text-slate-400 block">DEX</span>
                    <span className="text-lg font-bold text-amber-300">{stats.dex}</span>
                </div>
                <div className="bg-slate-800 p-2 rounded text-center border border-slate-700">
                    <span className="text-xs text-slate-400 block">CON</span>
                    <span className="text-lg font-bold text-amber-300">{stats.con}</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex space-x-2 border-b border-slate-700 mb-3">
                {['combat', 'inventory', 'spells', 'feats'].map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveTab(tab);
                        }}
                        className={`px-4 py-2 text-xs font-bold capitalize transition-colors ${
                            activeTab === tab 
                                ? 'border-b-2 border-amber-400 text-amber-400' 
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            {/* Dynamic Content Workspace */}
            <main className="flex-1 overflow-y-auto pr-1">
                {activeTab === 'combat' && (
                    <div className="space-y-2">
                        <h2 className="text-sm font-bold text-slate-300">Attacks & Weapons</h2>
                        {actor.items.filter(i => i.type === 'weapon').map(weapon => (
                            <div key={weapon.id} className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700">
                                <span className="text-sm">{weapon.name}</span>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        rollNativeAttack(weapon);
                                    }}
                                    className="bg-amber-600 hover:bg-amber-500 text-xs px-2 py-1 rounded font-semibold text-slate-950"
                                >
                                    Roll Attack
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="text-xs text-slate-400">
                        Drag and drop items from compendiums anywhere onto this window to add them.
                    </div>
                )}
            </main>
        </div>
    );
}