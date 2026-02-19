import { useProjectState } from '../../store/context';
import { useProjectDispatch } from '../../store/context';
import { componentSummary } from '../../lib/cdml';

export function ProjectOverview() {
  const { name, components } = useProjectState();
  const dispatch = useProjectDispatch();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-200 mb-1">{name || 'Claudiv Designer'}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {components.length} component{components.length !== 1 ? 's' : ''} discovered
      </p>

      {components.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg mb-2">No components found</p>
          <p className="text-sm">Create a .cdml component file or run claudiv init</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {components.map((comp) => (
            <button
              key={comp.fqn.raw}
              onClick={() => dispatch({ type: 'SELECT_COMPONENT', fqn: comp.fqn.raw })}
              className="text-left p-4 rounded-lg border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors"
            >
              <h3 className="font-medium text-gray-200 mb-1">{comp.name}</h3>
              <p className="text-xs text-gray-500 font-mono mb-2 truncate">{comp.fqn.raw}</p>
              <p className="text-xs text-gray-600">{componentSummary(comp)}</p>
              <p className="text-xs text-gray-700 mt-1 truncate">{comp.file}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
