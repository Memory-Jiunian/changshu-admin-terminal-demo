import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useState,
} from "react";

import { warningMockData } from "@/data/warningMock";
import type { WarningItem } from "@/types/warning";

type AdminDataContextValue = {
  warnings: WarningItem[];
  setWarnings: Dispatch<SetStateAction<WarningItem[]>>;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: PropsWithChildren) {
  const [warnings, setWarnings] = useState<WarningItem[]>(() => warningMockData);

  return (
    <AdminDataContext.Provider value={{ warnings, setWarnings }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);

  if (!context) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }

  return context;
}
