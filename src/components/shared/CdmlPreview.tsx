import type { ComponentDefinition } from '@claudiv/core';

interface Props {
  component: ComponentDefinition;
}

/**
 * Read-only CDML preview with basic syntax highlighting.
 * Shows the serialized CDML for the current component state.
 */
export function CdmlPreview({ component }: Props) {
  const cdml = serializeForPreview(component);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-400">Generated CDML</h3>
        <button
          onClick={() => navigator.clipboard.writeText(cdml)}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Copy
        </button>
      </div>
      <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre leading-relaxed">
        {highlightCdml(cdml)}
      </pre>
    </div>
  );
}

/**
 * Basic client-side serialization for preview purposes.
 * Mirrors server/serializer.ts logic but runs in the browser.
 */
function serializeForPreview(component: ComponentDefinition): string {
  const lines: string[] = [];
  const fqnAttr = component.fqn.raw ? ` fqn="${component.fqn.raw}"` : '';
  lines.push(`<component name="${component.name}"${fqnAttr}>`);

  if (component.interface) {
    const impl = component.interface.implements ? ` implements="${component.interface.implements}"` : '';
    const ext = component.interface.extends ? ` extends="${component.interface.extends}"` : '';
    lines.push('');
    lines.push(`  <interface${impl}${ext}>`);
    for (const facet of component.interface.facets) {
      const content = typeof facet.content === 'string' ? facet.content.trim() : JSON.stringify(facet.content);
      lines.push(`    <facet type="${facet.type}">`);
      lines.push(`      ${content}`);
      lines.push('    </facet>');
    }
    lines.push('  </interface>');
  }

  if (component.constraints) {
    const attrs: string[] = [];
    if (component.constraints.os) attrs.push(`os="${component.constraints.os}"`);
    if (component.constraints.distro) attrs.push(`distro="${component.constraints.distro}"`);
    if (component.constraints.arch) attrs.push(`arch="${component.constraints.arch}"`);
    const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
    lines.push('');
    lines.push(`  <constraints${attrStr}>`);
    if (component.constraints.resources) {
      for (const [key, val] of Object.entries(component.constraints.resources)) {
        lines.push(`    <${key} value="${val}" />`);
      }
    }
    if (component.constraints.ports?.length) {
      lines.push('    <ports>');
      for (const p of component.constraints.ports) {
        lines.push(`      <map external="${p.external}" internal="${p.internal}" />`);
      }
      lines.push('    </ports>');
    }
    if (component.constraints.services?.length) {
      lines.push('    <services>');
      for (const svc of component.constraints.services) {
        const svcAttrs = Object.entries(svc)
          .filter(([k]) => k !== 'name')
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        lines.push(`      <${svc.name}${svcAttrs ? ' ' + svcAttrs : ''} />`);
      }
      lines.push('    </services>');
    }
    lines.push('  </constraints>');
  }

  if (component.requires?.length) {
    lines.push('');
    lines.push('  <requires>');
    for (const dep of component.requires) {
      const attrs = [`fqn="${dep.fqn.raw}"`];
      if (dep.facets?.length) attrs.push(`facet="${dep.facets.join(',')}"`);
      if (dep.usage) attrs.push(`usage="${dep.usage}"`);
      lines.push(`    <dependency ${attrs.join(' ')} />`);
    }
    lines.push('  </requires>');
  }

  if (component.implementation) {
    const implAttrs: string[] = [];
    if (component.implementation.target) implAttrs.push(`target="${component.implementation.target}"`);
    if (component.implementation.framework) implAttrs.push(`framework="${component.implementation.framework}"`);
    const implAttrStr = implAttrs.length > 0 ? ' ' + implAttrs.join(' ') : '';
    lines.push('');
    lines.push(`  <implementation${implAttrStr}>`);
    if (component.implementation.content) {
      lines.push(`    ${component.implementation.content.trim()}`);
    }
    lines.push('  </implementation>');
  }

  lines.push('');
  lines.push('</component>');
  return lines.join('\n');
}

/**
 * Very basic CDML syntax highlighting using spans.
 * Returns JSX elements with color classes.
 */
function highlightCdml(cdml: string): React.ReactNode[] {
  return cdml.split('\n').map((line, i) => {
    const highlighted = line
      .replace(/(&lt;|<)(\/?)([a-zA-Z][\w:-]*)/g, '<span class="text-blue-400">&lt;$2$3</span>')
      .replace(/(\w+)="([^"]*)"/g, '<span class="text-purple-400">$1</span>=<span class="text-green-400">"$2"</span>')
      .replace(/(\/?>)/g, '<span class="text-blue-400">$1</span>');

    return (
      <span key={i}>
        <span
          className="text-gray-600 select-none inline-block w-8 text-right mr-3"
        >
          {i + 1}
        </span>
        <span dangerouslySetInnerHTML={{ __html: highlighted }} />
        {'\n'}
      </span>
    );
  });
}
