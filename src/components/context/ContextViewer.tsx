import { useState, useEffect } from 'react';
import type { ContextManifest } from '@claudiv/core';
import * as api from '../../lib/api';
import { FqnBadge } from '../shared/FqnBadge';

interface Props {
  fqn: string;
}

/**
 * Shows the assembled context manifest for a component.
 */
export function ContextViewer({ fqn }: Props) {
  const [context, setContext] = useState<ContextManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedScope, setExpandedScope] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getContext(fqn)
      .then(setContext)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [fqn]);

  if (loading) {
    return <p className="text-gray-500 text-sm p-4">Loading context...</p>;
  }

  if (error) {
    return <p className="text-red-400 text-sm p-4">{error}</p>;
  }

  if (!context) {
    return <p className="text-gray-500 text-sm p-4">No context manifest found.</p>;
  }

  return (
    <div className="space-y-6 p-4 max-w-2xl">
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-1">Context for</h3>
        <p className="text-xs text-gray-500 font-mono">{context.forFile}</p>
      </div>

      {/* Global section */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2">Global</h4>
        {context.global.refs.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-gray-500">Refs</span>
            <div className="space-y-1 mt-1">
              {context.global.refs.map((ref, i) => (
                <div key={i} className="flex gap-2 items-center text-xs">
                  <span className="text-gray-400 font-mono">{ref.file}</span>
                  <span className="text-gray-600">({ref.role})</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {context.global.facts.length > 0 && (
          <div>
            <span className="text-xs text-gray-500">Facts</span>
            <ul className="mt-1 space-y-1">
              {context.global.facts.map((fact, i) => (
                <li key={i} className="text-xs text-gray-400">
                  {fact.content}
                  {fact.decision && (
                    <span className="text-gray-600 ml-1">({fact.decision})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Scopes */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2">
          Scopes ({context.scopes.length})
        </h4>
        <div className="space-y-2">
          {context.scopes.map((scope) => (
            <div key={scope.path} className="border border-gray-800 rounded-lg bg-gray-900/50">
              <button
                onClick={() =>
                  setExpandedScope(expandedScope === scope.path ? null : scope.path)
                }
                className="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-gray-800/50"
              >
                <span className="text-sm text-gray-300 font-mono">{scope.path}</span>
                <span className="text-xs text-gray-600">
                  {scope.refs.length} refs, {scope.facts.length} facts
                </span>
              </button>

              {expandedScope === scope.path && (
                <div className="px-4 pb-3 space-y-3 border-t border-gray-800">
                  {/* Interfaces */}
                  {(scope.interfaces.fulfills.length > 0 ||
                    scope.interfaces.depends.length > 0) && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Interfaces</span>
                      {scope.interfaces.fulfills.length > 0 && (
                        <div className="mt-1">
                          <span className="text-[10px] text-gray-600 uppercase">
                            Fulfills:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {scope.interfaces.fulfills.map((f, i) => (
                              <FqnBadge key={i} fqn={f.fqn} />
                            ))}
                          </div>
                        </div>
                      )}
                      {scope.interfaces.depends.length > 0 && (
                        <div className="mt-1">
                          <span className="text-[10px] text-gray-600 uppercase">
                            Depends:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {scope.interfaces.depends.map((d, i) => (
                              <span key={i} className="inline-flex items-center gap-1">
                                <FqnBadge fqn={d.fqn} />
                                {d.facet && (
                                  <span className="text-[10px] text-blue-400">
                                    [{d.facet}]
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Refs */}
                  {scope.refs.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">Refs</span>
                      <div className="space-y-1 mt-1">
                        {scope.refs.map((ref, i) => (
                          <div key={i} className="flex gap-2 items-center text-xs">
                            <span className="text-gray-400 font-mono">{ref.file}</span>
                            <span className="text-gray-600">({ref.role})</span>
                            {ref.lines && (
                              <span className="text-gray-600">L{ref.lines}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Facts */}
                  {scope.facts.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">Facts</span>
                      <ul className="mt-1 space-y-1">
                        {scope.facts.map((fact, i) => (
                          <li key={i} className="text-xs text-gray-400">
                            {fact.content}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tools */}
                  {scope.tools.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">Tools</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {scope.tools.map((tool, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-gray-800 rounded text-[10px] text-gray-400 font-mono"
                          >
                            {tool.name}: {tool.scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
