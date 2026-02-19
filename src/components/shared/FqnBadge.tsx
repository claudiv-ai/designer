import { useProject } from '../../hooks/useProject';

interface Props {
  fqn: string;
  clickable?: boolean;
}

/**
 * Clickable FQN display badge. Click navigates to the referenced component.
 */
export function FqnBadge({ fqn, clickable = true }: Props) {
  const { selectComponent } = useProject();

  // Parse FQN for display: highlight segments differently
  const parts = fqn.split('#');
  const scopePath = parts[0];
  const fragment = parts[1];

  const badge = (
    <span className="inline-flex items-center font-mono text-xs">
      <span className="text-gray-300">{scopePath}</span>
      {fragment && (
        <>
          <span className="text-gray-600">#</span>
          <span className="text-blue-400">{fragment}</span>
        </>
      )}
    </span>
  );

  if (!clickable) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 bg-gray-800 border border-gray-700 rounded">
        {badge}
      </span>
    );
  }

  return (
    <button
      onClick={() => selectComponent(scopePath)}
      className="inline-flex items-center px-2 py-0.5 bg-gray-800 border border-gray-700 rounded hover:border-blue-500 hover:bg-gray-750 transition-colors cursor-pointer"
      title={`Navigate to ${fqn}`}
    >
      {badge}
    </button>
  );
}
