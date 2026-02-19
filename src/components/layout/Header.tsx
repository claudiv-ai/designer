import { useProjectState } from '../../store/context';

export function Header() {
  const { name, connected } = useProjectState();

  return (
    <header className="h-12 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900 shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-mono font-bold text-sm tracking-wider text-gray-300">CLAUDIV</span>
        {name && (
          <>
            <span className="text-gray-600">/</span>
            <span className="text-sm text-gray-400">{name}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </header>
  );
}
