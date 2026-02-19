import type { ComponentDefinition, InterfaceFacet, DependencyDefinition } from '@claudiv/core';

/**
 * Create a blank component definition.
 */
export function createBlankComponent(name: string, file: string): ComponentDefinition {
  return {
    fqn: { segments: [name], raw: name },
    name,
    file,
    interface: { facets: [] },
    constraints: {},
    requires: [],
    implementation: undefined,
  };
}

/**
 * Get display name for a facet type.
 */
export function facetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    api: 'API',
    compute: 'Compute',
    network: 'Network',
    storage: 'Storage',
    data: 'Data',
    events: 'Events',
    health: 'Health',
  };
  return labels[type] || type;
}

/**
 * Get a short summary of a component for display.
 */
export function componentSummary(comp: ComponentDefinition): string {
  const parts: string[] = [];
  if (comp.interface) {
    parts.push(`${comp.interface.facets.length} facet(s)`);
  }
  if (comp.requires && comp.requires.length > 0) {
    parts.push(`${comp.requires.length} dep(s)`);
  }
  return parts.join(', ') || 'empty';
}
