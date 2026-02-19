import type { ContextRef } from '@claudiv/core';

interface Props {
  refs: ContextRef[];
}

/**
 * Displays code file reference mappings from a context manifest scope.
 */
export function RefsViewer({ refs }: Props) {
  if (refs.length === 0) {
    return <p className="text-gray-500 text-sm">No file references.</p>;
  }

  // Group refs by role
  const byRole = new Map<string, ContextRef[]>();
  for (const ref of refs) {
    const role = ref.role || 'unknown';
    const group = byRole.get(role) || [];
    group.push(ref);
    byRole.set(role, group);
  }

  return (
    <div className="space-y-4">
      {Array.from(byRole.entries()).map(([role, roleRefs]) => (
        <div key={role}>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">{role}</h4>
          <div className="space-y-1">
            {roleRefs.map((ref, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/50 rounded text-sm"
              >
                <span className="text-gray-300 font-mono flex-1 truncate">{ref.file}</span>
                {ref.lines && (
                  <span className="text-xs text-gray-600 shrink-0">L{ref.lines}</span>
                )}
                {ref.keys && (
                  <span className="text-xs text-blue-400 shrink-0" title={ref.keys}>
                    keys: {ref.keys}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
