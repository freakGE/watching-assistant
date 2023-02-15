import { createContext, ReactNode, useContext, useState } from "react";

type AppStateContextType = {
  currentSearch: string;
  setCurrentSearch: (search: string) => void;
};

export const AppStateContext = createContext<AppStateContextType>({
  currentSearch: "",
  setCurrentSearch: () => {},
});

export const useAppState = () => useContext(AppStateContext);

type Props = {
  children: ReactNode;
};

export const AppStateProvider = ({ children }: Props) => {
  const [currentSearch, setCurrentSearch] = useState("");

  return (
    <AppStateContext.Provider value={{ currentSearch, setCurrentSearch }}>
      {children}
    </AppStateContext.Provider>
  );
};
