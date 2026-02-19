import { useProjectState } from '../../store/context';
import { ComponentEditor } from '../component/ComponentEditor';
import { ProjectOverview } from '../project/ProjectOverview';

export function MainPanel() {
  const { selectedFqn, components } = useProjectState();

  const selected = selectedFqn
    ? components.find((c) => c.fqn.raw === selectedFqn) ?? null
    : null;

  return (
    <main className="flex-1 overflow-y-auto bg-gray-950">
      {selected ? (
        <ComponentEditor component={selected} />
      ) : (
        <ProjectOverview />
      )}
    </main>
  );
}
