interface Props {
  scope: string;
  instruction: string;
  existingChildren?: string[];
}

/**
 * Shows the status and content of a plan directive.
 */
export function PlanDirectivePanel({ scope, instruction, existingChildren }: Props) {
  return (
    <div className="border border-amber-900/50 rounded-lg p-4 bg-amber-950/20 max-w-xl">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        <h3 className="text-sm font-medium text-amber-300">Plan Directive</h3>
      </div>

      <div className="mb-3">
        <span className="text-xs text-gray-500">Scope</span>
        <p className="text-sm text-gray-300 font-mono">{scope}</p>
      </div>

      <div className="mb-3">
        <span className="text-xs text-gray-500">Instruction</span>
        <p className="text-sm text-gray-200">{instruction}</p>
      </div>

      {existingChildren && existingChildren.length > 0 && (
        <div>
          <span className="text-xs text-gray-500">Immutable children (constraints)</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {existingChildren.map((child) => (
              <span
                key={child}
                className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 font-mono"
              >
                {child}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
