import { useState } from 'react';
import type { ComponentDefinition, InterfaceFacet } from '@claudiv/core';
import { useProject } from '../../hooks/useProject';
import { facetTypeLabel } from '../../lib/cdml';
import { AttributeTable } from '../shared/AttributeTable';

interface Props {
  component: ComponentDefinition;
}

export function InterfaceEditor({ component }: Props) {
  const { updateComponent } = useProject();
  const iface = component.interface;
  const [newFacetType, setNewFacetType] = useState('');

  if (!iface) {
    return (
      <div className="text-gray-500 text-sm">
        <p>No interface defined.</p>
        <button
          onClick={() => updateComponent({ ...component, interface: { facets: [] } })}
          className="mt-2 px-3 py-1.5 bg-blue-900/50 text-blue-300 rounded text-sm hover:bg-blue-900/70"
        >
          Add interface
        </button>
      </div>
    );
  }

  function updateFacet(index: number, updated: InterfaceFacet) {
    if (!iface) return;
    const facets = [...iface.facets];
    facets[index] = updated;
    updateComponent({ ...component, interface: { ...iface, facets } });
  }

  function removeFacet(index: number) {
    if (!iface) return;
    const facets = iface.facets.filter((_, i) => i !== index);
    updateComponent({ ...component, interface: { ...iface, facets } });
  }

  function addFacet() {
    if (!iface || !newFacetType.trim()) return;
    const facets = [...iface.facets, { type: newFacetType.trim(), content: '' }];
    updateComponent({ ...component, interface: { ...iface, facets } });
    setNewFacetType('');
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Implements / Extends */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Implements</label>
          <input
            type="text"
            value={iface.implements || ''}
            onChange={(e) =>
              updateComponent({
                ...component,
                interface: { ...iface, implements: e.target.value || undefined },
              })
            }
            placeholder="e.g., sql-database"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Extends</label>
          <input
            type="text"
            value={iface.extends || ''}
            onChange={(e) =>
              updateComponent({
                ...component,
                interface: { ...iface, extends: e.target.value || undefined },
              })
            }
            placeholder="e.g., base-service"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Facets */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Facets</h3>
        {iface.facets.length === 0 && (
          <p className="text-xs text-gray-600 mb-3">No facets defined</p>
        )}

        {iface.facets.map((facet, i) => (
          <div key={i} className="mb-4 border border-gray-800 rounded-lg p-4 bg-gray-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">
                {facetTypeLabel(facet.type)}
              </span>
              <button
                onClick={() => removeFacet(i)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
            <textarea
              value={typeof facet.content === 'string' ? facet.content : JSON.stringify(facet.content, null, 2)}
              onChange={(e) => updateFacet(i, { ...facet, content: e.target.value })}
              rows={4}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-300 focus:border-blue-500 focus:outline-none resize-y"
            />
          </div>
        ))}

        {/* Add facet */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newFacetType}
            onChange={(e) => setNewFacetType(e.target.value)}
            placeholder="Facet type (api, compute, network...)"
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && addFacet()}
          />
          <button
            onClick={addFacet}
            disabled={!newFacetType.trim()}
            className="px-3 py-1.5 bg-blue-900/50 text-blue-300 rounded text-sm hover:bg-blue-900/70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add facet
          </button>
        </div>
      </div>
    </div>
  );
}
