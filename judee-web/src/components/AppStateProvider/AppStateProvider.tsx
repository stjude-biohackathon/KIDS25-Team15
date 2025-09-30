import { createContext, useContext, useState } from 'react';

type AppState = Record<string, string>;
type Ctx = { appState: AppState; setKey: (k: string, v: string) => void };
const AppStateContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState<AppState>({});

  const setKey = (k: string, v: string) =>
    setAppState(prev => ({ ...prev, [k]: v }));

  return (
    <AppStateContext.Provider value={{ appState, setKey }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
    const ctx = useContext(AppStateContext);
    if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
    return ctx;
}