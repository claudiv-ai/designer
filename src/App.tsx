import { ProjectProvider } from './store/context';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MainPanel } from './components/layout/MainPanel';

export function App() {
  return (
    <ProjectProvider>
      <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainPanel />
        </div>
      </div>
    </ProjectProvider>
  );
}
