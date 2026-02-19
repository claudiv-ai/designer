import { useProject } from '../../hooks/useProject';
import type { ComponentDefinition } from '@claudiv/core';

interface Props {
  component: ComponentDefinition;
}

export function ImplementationEditor({ component }: Props) {
  const { updateComponent } = useProject();
  const impl = component.implementation;

  if (!impl) {
    return (
      <div className="text-gray-500 text-sm">
        <p>No implementation defined.</p>
        <button
          onClick={() =>
            updateComponent({ ...component, implementation: { target: '', framework: '', content: '' } })
          }
          className="mt-2 px-3 py-1.5 bg-blue-900/50 text-blue-300 rounded text-sm hover:bg-blue-900/70"
        >
          Add implementation
        </button>
      </div>
    );
  }

  function update(partial: Record<string, any>) {
    updateComponent({ ...component, implementation: { ...impl, ...partial } });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Target / Framework */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Target</label>
          <input
            type="text"
            value={impl.target || ''}
            onChange={(e) => update({ target: e.target.value || undefined })}
            placeholder="typescript"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Framework</label>
          <input
            type="text"
            value={impl.framework || ''}
            onChange={(e) => update({ framework: e.target.value || undefined })}
            placeholder="express"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Content / Description */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Implementation Details</label>
        <textarea
          value={typeof impl.content === 'string' ? impl.content : JSON.stringify(impl.content || '', null, 2)}
          onChange={(e) => update({ content: e.target.value })}
          rows={10}
          placeholder="Describe modules, structure, or paste implementation content..."
          className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-gray-300 placeholder-gray-600 focus:border-blue-500 focus:outline-none resize-y"
        />
      </div>

      {/* Remove implementation */}
      <div>
        <button
          onClick={() => updateComponent({ ...component, implementation: undefined })}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Remove implementation
        </button>
      </div>
    </div>
  );
}
