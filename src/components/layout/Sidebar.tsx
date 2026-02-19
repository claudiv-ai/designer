import { useProject } from '../../hooks/useProject';
import { useWebSocket } from '../../hooks/useWebSocket';
import { componentSummary } from '../../lib/cdml';

export function Sidebar() {
  useWebSocket();
  const { components, selectedFqn, selectComponent, loading } = useProject();

  // Group components by directory
  const groups: Record<string, typeof components> = {};
  for (const comp of components) {
    const dir = comp.file.includes('/') ? comp.file.substring(0, comp.file.lastIndexOf('/')) : '.';
    if (!groups[dir]) groups[dir] = [];
    groups[dir].push(comp);
  }

  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-900 overflow-y-auto shrink-0">
      <div className="p-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Components</h2>

        {loading && (
          <p className="text-xs text-gray-600 px-2">Loading...</p>
        )}

        {!loading && components.length === 0 && (
          <p className="text-xs text-gray-600 px-2">No components found</p>
        )}

        {Object.entries(groups).map(([dir, comps]) => (
          <div key={dir} className="mb-3">
            <p className="text-xs text-gray-600 px-2 mb-1 font-mono">{dir}/</p>
            {comps.map((comp) => {
              const isSelected = comp.fqn.raw === selectedFqn;
              return (
                <button
                  key={comp.fqn.raw}
                  onClick={() => selectComponent(comp.fqn.raw)}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-900/50 text-blue-300'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                  title={comp.fqn.raw}
                >
                  <div className="font-medium truncate">{comp.name}</div>
                  <div className="text-xs text-gray-600 truncate">{componentSummary(comp)}</div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
