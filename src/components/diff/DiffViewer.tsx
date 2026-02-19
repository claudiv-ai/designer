import { useState, useEffect } from 'react';
import type { CdmlDiffResult, CdmlElementChange } from '@claudiv/core';
import * as api from '../../lib/api';

interface Props {
  file: string;
}

/**
 * Side-by-side CDML diff display.
 * Uses diffCdml() from @claudiv/core via the backend API.
 */
export function DiffViewer({ file }: Props) {
  const [diff, setDiff] = useState<CdmlDiffResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getDiff(file)
      .then(setDiff)
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [file]);

  if (loading) {
    return <p className="text-gray-500 text-sm p-4">Loading diff...</p>;
  }

  if (error) {
    return <p className="text-red-400 text-sm p-4">{error}</p>;
  }

  if (!diff || !diff.hasChanges) {
    return <p className="text-gray-500 text-sm p-4">No changes detected.</p>;
  }

  return (
    <div className="space-y-4 p-4">
      {/* Summary */}
      <div className="flex gap-4 text-xs">
        {diff.summary.added > 0 && (
          <span className="text-green-400">+{diff.summary.added} added</span>
        )}
        {diff.summary.removed > 0 && (
          <span className="text-red-400">-{diff.summary.removed} removed</span>
        )}
        {diff.summary.modified > 0 && (
          <span className="text-amber-400">~{diff.summary.modified} modified</span>
        )}
        <span className="text-gray-600">{diff.summary.unchanged} unchanged</span>
      </div>

      {/* Change tree */}
      <div className="border border-gray-800 rounded-lg bg-gray-950 p-4 font-mono text-sm overflow-x-auto">
        {diff.changes.map((change, i) => (
          <ChangeNode key={i} change={change} depth={0} />
        ))}
      </div>
    </div>
  );
}

function ChangeNode({ change, depth }: { change: CdmlElementChange; depth: number }) {
  const indent = '  '.repeat(depth);
  const colorClass = {
    added: 'text-green-400',
    removed: 'text-red-400',
    modified: 'text-amber-400',
    unchanged: 'text-gray-500',
  }[change.type];

  const prefix = {
    added: '+ ',
    removed: '- ',
    modified: '~ ',
    unchanged: '  ',
  }[change.type];

  return (
    <>
      <div className={`${colorClass} whitespace-pre`}>
        {indent}{prefix}&lt;{change.tagName}&gt;
        {change.type === 'modified' && change.oldText && change.newText && (
          <span className="text-gray-500">
            {' '}{change.oldText.trim().substring(0, 30)} → {change.newText.trim().substring(0, 30)}
          </span>
        )}
      </div>
      {change.children?.map((child, i) => (
        <ChangeNode key={i} change={child} depth={depth + 1} />
      ))}
    </>
  );
}
