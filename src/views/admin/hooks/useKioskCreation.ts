import { useCallback, useState } from "react";
import { KioskFormData } from "../components/KioskForm";

const DEFAULT_KIOSK_FORM_DATA: KioskFormData = {
  name: "",
  location: "",
  accessCode: "",
  status: "online",
  assignedCampaigns: [],
  displayLayout: "grid",
};

type KioskFormUpdater =
  | KioskFormData
  | ((prev: KioskFormData) => KioskFormData);

export function useKioskCreation(initialData?: Partial<KioskFormData>) {
  const [formData, setFormDataState] = useState<KioskFormData>({
    ...DEFAULT_KIOSK_FORM_DATA,
    ...initialData,
  });

  const setFormData = useCallback((data: KioskFormUpdater) => {
    if (typeof data === "function") {
      setFormDataState((prev) => data(prev));
    } else {
      setFormDataState(data);
    }
  }, []);

  const resetFormData = useCallback(() => {
    setFormDataState({
      ...DEFAULT_KIOSK_FORM_DATA,
      ...initialData,
    });
  }, [initialData]);

  return { formData, setFormData, resetFormData };
}
