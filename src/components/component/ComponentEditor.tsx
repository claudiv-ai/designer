import { useProjectState, useProjectDispatch } from '../../store/context';
import type { ComponentDefinition } from '@claudiv/core';
import type { ComponentTab } from '../../store/types';
import { InterfaceEditor } from './InterfaceEditor';
import { ConstraintsEditor } from './ConstraintsEditor';
import { RequiresEditor } from './RequiresEditor';
import { ImplementationEditor } from './ImplementationEditor';
import { CdmlPreview } from '../shared/CdmlPreview';

const TABS: { id: ComponentTab; label: string }[] = [
  { id: 'interface', label: 'Interface' },
  { id: 'constraints', label: 'Constraints' },
  { id: 'requires', label: 'Requires' },
  { id: 'implementation', label: 'Implementation' },
  { id: 'cdml', label: 'CDML' },
];

interface Props {
  component: ComponentDefinition;
}

export function ComponentEditor({ component }: Props) {
  const { selectedTab } = useProjectState();
  const dispatch = useProjectDispatch();

  return (
    <div className="h-full flex flex-col">
      {/* Component header */}
      <div className="px-6 pt-4 pb-2 border-b border-gray-800 shrink-0">
        <h2 className="text-lg font-semibold text-gray-200">{component.name}</h2>
        <p className="text-xs text-gray-500 font-mono">{component.fqn.raw}</p>
        <p className="text-xs text-gray-600 mt-0.5">{component.file}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 px-6 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SELECT_TAB', tab: tab.id })}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              selectedTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedTab === 'interface' && <InterfaceEditor component={component} />}
        {selectedTab === 'constraints' && <ConstraintsEditor component={component} />}
        {selectedTab === 'requires' && <RequiresEditor component={component} />}
        {selectedTab === 'implementation' && <ImplementationEditor component={component} />}
        {selectedTab === 'cdml' && <CdmlPreview component={component} />}
      </div>
    </div>
  );
}
