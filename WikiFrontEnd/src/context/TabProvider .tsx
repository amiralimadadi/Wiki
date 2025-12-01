import { createContext, useContext, useState, type ReactNode } from "react";

type TabContextType = {
  activeKey: string;
  setActiveKey: (key: string) => void;
};

const TabContext = createContext<TabContextType | undefined>(undefined);

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTabContext باید داخل TabProvider استفاده شود");
  }
  return context;
};

export const TabProvider = ({ children }: { children: ReactNode }) => {
  const [activeKey, setActiveKey] = useState("knowledgeContent");

  return (
    <TabContext.Provider value={{ activeKey, setActiveKey }}>
      {children}
    </TabContext.Provider>
  );
};
