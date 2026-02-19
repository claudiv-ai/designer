import { useState } from 'react';
import type { ComponentDefinition, DependencyDefinition } from '@claudiv/core';
import { useProject } from '../../hooks/useProject';
import { FqnBadge } from '../shared/FqnBadge';

interface Props {
  component: ComponentDefinition;
}

export function RequiresEditor({ component }: Props) {
  const { updateComponent, components } = useProject();
  const requires = component.requires || [];
  const [showAdd, setShowAdd] = useState(false);
  const [newFqn, setNewFqn] = useState('');
  const [newUsage, setNewUsage] = useState('');
  const [newFacets, setNewFacets] = useState('');

  function updateDep(index: number, updated: DependencyDefinition) {
    const deps = [...requires];
    deps[index] = updated;
    updateComponent({ ...component, requires: deps });
  }

  function removeDep(index: number) {
    const deps = requires.filter((_, i) => i !== index);
    updateComponent({ ...component, requires: deps.length > 0 ? deps : [] });
  }

  function addDep() {
    if (!newFqn.trim()) return;
    const dep: DependencyDefinition = {
      fqn: { segments: newFqn.trim().split(':'), raw: newFqn.trim() },
      usage: newUsage.trim() || undefined,
      facets: newFacets.trim() ? newFacets.split(',').map((f) => f.trim()) : undefined,
    };
    updateComponent({ ...component, requires: [...requires, dep] });
    setNewFqn('');
    setNewUsage('');
    setNewFacets('');
    setShowAdd(false);
  }

  // Available FQNs for autocomplete (excluding self)
  const availableFqns = components
    .filter((c) => c.fqn.raw !== component.fqn.raw)
    .map((c) => c.fqn.raw);

  return (
    <div className="space-y-4 max-w-2xl">
      {requires.length === 0 && !showAdd && (
        <p className="text-gray-500 text-sm">No dependencies defined.</p>
      )}

      {requires.map((dep, i) => (
        <div key={i} className="border border-gray-800 rounded-lg p-4 bg-gray-900/50">
          <div className="flex items-start justify-between mb-3">
            <FqnBadge fqn={dep.fqn.raw} />
            <button
              onClick={() => removeDep(i)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">FQN</label>
              <input
                type="text"
                value={dep.fqn.raw}
                onChange={(e) =>
                  updateDep(i, {
                    ...dep,
                    fqn: { segments: e.target.value.split(':'), raw: e.target.value },
                  })
                }
                list="fqn-options"
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Usage</label>
              <input
                type="text"
                value={dep.usage || ''}
                onChange={(e) =>
                  updateDep(i, { ...dep, usage: e.target.value || undefined })
                }
                placeholder="e.g., cache, persistence"
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs text-gray-500 mb-1">
              Facets <span className="text-gray-600">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={dep.facets?.join(', ') || ''}
              onChange={(e) =>
                updateDep(i, {
                  ...dep,
                  facets: e.target.value
                    ? e.target.value.split(',').map((f) => f.trim())
                    : undefined,
                })
              }
              placeholder="api, data, compute"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {dep.config && Object.keys(dep.config).length > 0 && (
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Config</label>
              <div className="space-y-1">
                {Object.entries(dep.config).map(([key, val]) => (
                  <div key={key} className="flex gap-2 items-center">
                    <span className="text-xs text-gray-500 font-mono w-24">{key}</span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const config = { ...dep.config, [key]: e.target.value };
                        updateDep(i, { ...dep, config });
                      }}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {showAdd ? (
        <div className="border border-blue-900/50 rounded-lg p-4 bg-blue-950/20">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Add Dependency</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">FQN</label>
              <input
                type="text"
                value={newFqn}
                onChange={(e) => setNewFqn(e.target.value)}
                list="fqn-options"
                placeholder="redis#api"
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Usage</label>
                <input
                  type="text"
                  value={newUsage}
                  onChange={(e) => setNewUsage(e.target.value)}
                  placeholder="cache"
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Facets</label>
                <input
                  type="text"
                  value={newFacets}
                  onChange={(e) => setNewFacets(e.target.value)}
                  placeholder="api, data"
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addDep}
                disabled={!newFqn.trim()}
                className="px-3 py-1.5 bg-blue-900/50 text-blue-300 rounded text-sm hover:bg-blue-900/70 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-3 py-1.5 text-gray-400 hover:text-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          + Add dependency
        </button>
      )}

      {/* FQN datalist for autocomplete */}
      <datalist id="fqn-options">
        {availableFqns.map((fqn) => (
          <option key={fqn} value={fqn} />
        ))}
      </datalist>
    </div>
  );
}
