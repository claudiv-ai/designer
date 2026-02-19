import { useEffect, useCallback } from 'react';
import { useProjectState, useProjectDispatch } from '../store/context';
import * as api from '../lib/api';
import type { ComponentDefinition } from '@claudiv/core';

export function useProject() {
  const state = useProjectState();
  const dispatch = useProjectDispatch();

  const loadProject = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const [project, components] = await Promise.all([
        api.getProject(),
        api.getComponents(),
      ]);
      dispatch({ type: 'SET_PROJECT', name: project.name, components });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: String(err) });
    }
  }, [dispatch]);

  const selectComponent = useCallback((fqn: string) => {
    dispatch({ type: 'SELECT_COMPONENT', fqn });
  }, [dispatch]);

  const updateComponent = useCallback(async (component: ComponentDefinition) => {
    try {
      await api.updateComponent(component.fqn.raw, component);
      dispatch({ type: 'UPDATE_COMPONENT', component });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: String(err) });
    }
  }, [dispatch]);

  const createComponent = useCallback(async (component: ComponentDefinition) => {
    try {
      await api.createComponent(component);
      dispatch({ type: 'ADD_COMPONENT', component });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: String(err) });
    }
  }, [dispatch]);

  const deleteComponent = useCallback(async (fqn: string) => {
    try {
      await api.deleteComponent(fqn);
      dispatch({ type: 'REMOVE_COMPONENT', fqn });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: String(err) });
    }
  }, [dispatch]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const selectedComponent = state.selectedFqn
    ? state.components.find((c) => c.fqn.raw === state.selectedFqn) ?? null
    : null;

  return {
    ...state,
    selectedComponent,
    selectComponent,
    updateComponent,
    createComponent,
    deleteComponent,
    reload: loadProject,
  };
}
