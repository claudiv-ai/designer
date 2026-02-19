import { useProject } from '../../hooks/useProject';
import type { ComponentDefinition, ConstraintDefinition } from '@claudiv/core';

interface Props {
  component: ComponentDefinition;
}

export function ConstraintsEditor({ component }: Props) {
  const { updateComponent } = useProject();
  const constraints = component.constraints;

  function update(partial: Partial<ConstraintDefinition>) {
    updateComponent({
      ...component,
      constraints: { ...constraints, ...partial },
    });
  }

  if (!constraints) {
    return (
      <div className="text-gray-500 text-sm">
        <p>No constraints defined.</p>
        <button
          onClick={() => updateComponent({ ...component, constraints: {} })}
          className="mt-2 px-3 py-1.5 bg-blue-900/50 text-blue-300 rounded text-sm hover:bg-blue-900/70"
        >
          Add constraints
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* OS / Distro / Arch */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Platform</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">OS</label>
            <input
              type="text"
              value={constraints.os || ''}
              onChange={(e) => update({ os: e.target.value || undefined })}
              placeholder="linux"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Distro</label>
            <input
              type="text"
              value={constraints.distro || ''}
              onChange={(e) => update({ distro: e.target.value || undefined })}
              placeholder="ubuntu"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Arch</label>
            <input
              type="text"
              value={constraints.arch || ''}
              onChange={(e) => update({ arch: e.target.value || undefined })}
              placeholder="amd64"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Resources */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Resources</h3>
        {constraints.resources && Object.keys(constraints.resources).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(constraints.resources).map(([key, val]) => (
              <div key={key} className="flex gap-2 items-center">
                <span className="text-xs text-gray-500 font-mono w-24">{key}</span>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => {
                    const resources = { ...constraints.resources, [key]: e.target.value };
                    update({ resources });
                  }}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const resources = { ...constraints.resources };
                    delete resources[key];
                    update({ resources: Object.keys(resources).length > 0 ? resources : undefined });
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600">No resources defined</p>
        )}
      </div>

      {/* Ports */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Port Mappings</h3>
        {constraints.ports && constraints.ports.length > 0 ? (
          <div className="space-y-2">
            {constraints.ports.map((port, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={port.external}
                  onChange={(e) => {
                    const ports = [...(constraints.ports || [])];
                    ports[i] = { ...ports[i], external: e.target.value };
                    update({ ports });
                  }}
                  placeholder="External"
                  className="w-24 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <span className="text-gray-600">-&gt;</span>
                <input
                  type="text"
                  value={port.internal}
                  onChange={(e) => {
                    const ports = [...(constraints.ports || [])];
                    ports[i] = { ...ports[i], internal: e.target.value };
                    update({ ports });
                  }}
                  placeholder="Internal"
                  className="w-24 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const ports = constraints.ports?.filter((_, j) => j !== i);
                    update({ ports: ports && ports.length > 0 ? ports : undefined });
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600">No port mappings</p>
        )}
        <button
          onClick={() => {
            const ports = [...(constraints.ports || []), { external: '', internal: '' }];
            update({ ports });
          }}
          className="mt-2 text-xs text-blue-400 hover:text-blue-300"
        >
          + Add port mapping
        </button>
      </div>

      {/* Services */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Required Services</h3>
        {constraints.services && constraints.services.length > 0 ? (
          <div className="space-y-2">
            {constraints.services.map((svc, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={svc.name}
                  onChange={(e) => {
                    const services = [...(constraints.services || [])];
                    services[i] = { ...services[i], name: e.target.value };
                    update({ services });
                  }}
                  placeholder="Service name"
                  className="w-32 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={svc.port || ''}
                  onChange={(e) => {
                    const services = [...(constraints.services || [])];
                    services[i] = { ...services[i], port: e.target.value };
                    update({ services });
                  }}
                  placeholder="Port"
                  className="w-20 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const services = constraints.services?.filter((_, j) => j !== i);
                    update({ services: services && services.length > 0 ? services : undefined });
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600">No required services</p>
        )}
        <button
          onClick={() => {
            const services = [...(constraints.services || []), { name: '', port: '' }];
            update({ services });
          }}
          className="mt-2 text-xs text-blue-400 hover:text-blue-300"
        >
          + Add service
        </button>
      </div>
    </div>
  );
}
