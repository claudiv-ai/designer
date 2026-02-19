import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { ProjectState, ProjectAction } from './types';

const initialState: ProjectState = {
  name: '',
  components: [],
  selectedFqn: null,
  selectedTab: 'interface',
  loading: true,
  error: null,
  connected: false,
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, name: action.name, components: action.components, loading: false };
    case 'SET_COMPONENTS':
      return { ...state, components: action.components };
    case 'SELECT_COMPONENT':
      return { ...state, selectedFqn: action.fqn, selectedTab: 'interface' };
    case 'SELECT_TAB':
      return { ...state, selectedTab: action.tab };
    case 'UPDATE_COMPONENT':
      return {
        ...state,
        components: state.components.map((c) =>
          c.fqn.raw === action.component.fqn.raw ? action.component : c
        ),
      };
    case 'ADD_COMPONENT':
      return { ...state, components: [...state.components, action.component] };
    case 'REMOVE_COMPONENT':
      return {
        ...state,
        components: state.components.filter((c) => c.fqn.raw !== action.fqn),
        selectedFqn: state.selectedFqn === action.fqn ? null : state.selectedFqn,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_CONNECTED':
      return { ...state, connected: action.connected };
    default:
      return state;
  }
}

const ProjectContext = createContext<ProjectState>(initialState);
const ProjectDispatchContext = createContext<Dispatch<ProjectAction>>(() => {});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  return (
    <ProjectContext.Provider value={state}>
      <ProjectDispatchContext.Provider value={dispatch}>
        {children}
      </ProjectDispatchContext.Provider>
    </ProjectContext.Provider>
  );
}

export function useProjectState() {
  return useContext(ProjectContext);
}

export function useProjectDispatch() {
  return useContext(ProjectDispatchContext);
}
