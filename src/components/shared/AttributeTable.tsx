import { useState } from 'react';

interface Props {
  attributes: Record<string, string>;
  onChange: (attributes: Record<string, string>) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  readonly?: boolean;
}

/**
 * Generic key-value attribute editor table.
 */
export function AttributeTable({
  attributes,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  readonly = false,
}: Props) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const entries = Object.entries(attributes);

  function updateValue(key: string, value: string) {
    onChange({ ...attributes, [key]: value });
  }

  function removeEntry(key: string) {
    const updated = { ...attributes };
    delete updated[key];
    onChange(updated);
  }

  function addEntry() {
    if (!newKey.trim()) return;
    onChange({ ...attributes, [newKey.trim()]: newValue });
    setNewKey('');
    setNewValue('');
  }

  return (
    <div className="space-y-2">
      {entries.length === 0 && (
        <p className="text-xs text-gray-600">No entries</p>
      )}

      {entries.map(([key, val]) => (
        <div key={key} className="flex gap-2 items-center">
          <span className="text-xs text-gray-400 font-mono w-28 truncate" title={key}>
            {key}
          </span>
          {readonly ? (
            <span className="flex-1 text-sm text-gray-300 font-mono">{val}</span>
          ) : (
            <input
              type="text"
              value={val}
              onChange={(e) => updateValue(key, e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            />
          )}
          {!readonly && (
            <button
              onClick={() => removeEntry(key)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      {!readonly && (
        <div className="flex gap-2 items-center mt-2">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder={keyPlaceholder}
            className="w-28 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && addEntry()}
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && addEntry()}
          />
          <button
            onClick={addEntry}
            disabled={!newKey.trim()}
            className="px-3 py-1.5 bg-blue-900/50 text-blue-300 rounded text-sm hover:bg-blue-900/70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
