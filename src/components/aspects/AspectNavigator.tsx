import { useState, useEffect } from 'react';
import type { AspectDefinition } from '@claudiv/core';
import * as api from '../../lib/api';

interface Props {
  fqn: string;
}

/**
 * Navigator for switching between aspect views of a component.
 */
export function AspectNavigator({ fqn }: Props) {
  const [aspects, setAspects] = useState<AspectDefinition[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getAspects(fqn)
      .then((data) => {
        setAspects(data);
        setSelected(null);
      })
      .catch(() => setAspects([]))
      .finally(() => setLoading(false));
  }, [fqn]);

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading aspects...</p>;
  }

  if (aspects.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        <p>No aspect files found.</p>
        <p className="text-xs text-gray-600 mt-1">
          Create aspect files using the naming convention:{' '}
          <span className="font-mono">&lt;name&gt;.&lt;type&gt;.cdml</span>
        </p>
      </div>
    );
  }

  const selectedAspect = aspects.find((a) => a.type === selected);

  return (
    <div className="space-y-4">
      {/* Aspect tabs */}
      <div className="flex flex-wrap gap-2">
        {aspects.map((aspect) => (
          <button
            key={aspect.type}
            onClick={() => setSelected(selected === aspect.type ? null : aspect.type)}
            className={`px-3 py-1.5 rounded text-sm border transition-colors ${
              selected === aspect.type
                ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            {aspectLabel(aspect.type)}
          </button>
        ))}
      </div>

      {/* Selected aspect detail */}
      {selectedAspect && (
        <div className="border border-gray-800 rounded-lg p-4 bg-gray-900/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">
              {aspectLabel(selectedAspect.type)}
            </h4>
            <span className="text-xs text-gray-600 font-mono">{selectedAspect.file}</span>
          </div>
          <p className="text-xs text-gray-500">
            Component: <span className="font-mono text-gray-400">{selectedAspect.component}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function aspectLabel(type: string): string {
  const labels: Record<string, string> = {
    infrastructure: 'Infrastructure',
    infra: 'Infrastructure',
    api: 'API',
    data: 'Data',
    security: 'Security',
    monitoring: 'Monitoring',
  };
  return labels[type] || type;
}
