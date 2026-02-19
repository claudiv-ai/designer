import type { ComponentDefinition, InterfaceFacet } from '@claudiv/core';

/**
 * Serialize a ComponentDefinition back to a CDML string.
 */
export function serializeComponent(component: ComponentDefinition): string {
  const lines: string[] = [];
  const fqnAttr = component.fqn.raw ? ` fqn="${component.fqn.raw}"` : '';

  lines.push(`<component name="${component.name}"${fqnAttr}>`);
  lines.push('');

  // Interface section
  if (component.interface) {
    const impl = component.interface.implements ? ` implements="${component.interface.implements}"` : '';
    const ext = component.interface.extends ? ` extends="${component.interface.extends}"` : '';
    lines.push(`  <interface${impl}${ext}>`);
    for (const facet of component.interface.facets) {
      if (typeof facet.content === 'string') {
        lines.push(`    <facet type="${facet.type}">`);
        lines.push(`      ${facet.content.trim()}`);
        lines.push('    </facet>');
      } else {
        lines.push(`    <facet type="${facet.type}">`);
        lines.push(`      ${JSON.stringify(facet.content)}`);
        lines.push('    </facet>');
      }
    }
    lines.push('  </interface>');
    lines.push('');
  }

  // Constraints section
  if (component.constraints) {
    const attrs: string[] = [];
    if (component.constraints.os) attrs.push(`os="${component.constraints.os}"`);
    if (component.constraints.distro) attrs.push(`distro="${component.constraints.distro}"`);
    if (component.constraints.arch) attrs.push(`arch="${component.constraints.arch}"`);
    const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
    lines.push(`  <constraints${attrStr}>`);

    if (component.constraints.resources) {
      for (const [key, val] of Object.entries(component.constraints.resources)) {
        const [tag, attr] = key.split('.');
        lines.push(`    <${tag} ${attr}="${val}" />`);
      }
    }

    if (component.constraints.ports && component.constraints.ports.length > 0) {
      lines.push('    <ports>');
      for (const port of component.constraints.ports) {
        lines.push(`      <map external="${port.external}" internal="${port.internal}" />`);
      }
      lines.push('    </ports>');
    }

    if (component.constraints.services && component.constraints.services.length > 0) {
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
    lines.push('');
  }

  // Requires section
  if (component.requires && component.requires.length > 0) {
    lines.push('  <requires>');
    for (const dep of component.requires) {
      const attrs = [`fqn="${dep.fqn.raw}"`];
      if (dep.facets && dep.facets.length > 0) attrs.push(`facet="${dep.facets.join(',')}"`);
      if (dep.usage) attrs.push(`usage="${dep.usage}"`);
      if (dep.config) {
        for (const [k, v] of Object.entries(dep.config)) {
          attrs.push(`${k}="${v}"`);
        }
      }
      lines.push(`    <dependency ${attrs.join(' ')} />`);
    }
    lines.push('  </requires>');
    lines.push('');
  }

  // Implementation section
  if (component.implementation) {
    const implAttrs: string[] = [];
    if (component.implementation.target) implAttrs.push(`target="${component.implementation.target}"`);
    if (component.implementation.framework) implAttrs.push(`framework="${component.implementation.framework}"`);
    const implAttrStr = implAttrs.length > 0 ? ' ' + implAttrs.join(' ') : '';
    lines.push(`  <implementation${implAttrStr}>`);
    if (component.implementation.content) {
      lines.push(`    ${component.implementation.content.trim()}`);
    }
    lines.push('  </implementation>');
    lines.push('');
  }

  lines.push('</component>');
  return lines.join('\n');
}

/**
 * Serialize a system project to CDML.
 */
export function serializeSystem(system: { name: string; components: Array<{ name: string; type: string; submodule: boolean; description?: string }> }): string {
  const lines: string[] = [];
  lines.push(`<system name="${system.name}">`);
  for (const comp of system.components) {
    const subAttr = comp.submodule ? ' submodule="true"' : '';
    if (comp.description) {
      lines.push(`  <${comp.name} type="${comp.type}"${subAttr}>${comp.description}</${comp.name}>`);
    } else {
      lines.push(`  <${comp.name} type="${comp.type}"${subAttr} />`);
    }
  }
  lines.push('</system>');
  return lines.join('\n');
}
