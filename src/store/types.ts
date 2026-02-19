import type { ComponentDefinition, CdmlDiffResult, ContextManifest } from '@claudiv/core';

export interface ProjectState {
  name: string;
  components: ComponentDefinition[];
  selectedFqn: string | null;
  selectedTab: ComponentTab;
  loading: boolean;
  error: string | null;
  connected: boolean;
}

export type ComponentTab = 'interface' | 'constraints' | 'requires' | 'implementation' | 'cdml';

export type ProjectAction =
  | { type: 'SET_PROJECT'; name: string; components: ComponentDefinition[] }
  | { type: 'SET_COMPONENTS'; components: ComponentDefinition[] }
  | { type: 'SELECT_COMPONENT'; fqn: string }
  | { type: 'SELECT_TAB'; tab: ComponentTab }
  | { type: 'UPDATE_COMPONENT'; component: ComponentDefinition }
  | { type: 'ADD_COMPONENT'; component: ComponentDefinition }
  | { type: 'REMOVE_COMPONENT'; fqn: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_CONNECTED'; connected: boolean };
