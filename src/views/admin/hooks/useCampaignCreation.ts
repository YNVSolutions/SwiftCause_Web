import { useCallback, useState } from "react";
import { CampaignFormData } from "../components/CampaignForm";

const DEFAULT_CAMPAIGN_FORM_DATA: CampaignFormData = {
  title: "",
  briefOverview: "",
  description: "",
  goal: 0,
  category: "",
  status: "active",
  coverImageUrl: "",
  videoUrl: "",
  galleryImages: [],
  predefinedAmounts: [10, 25, 50],
  startDate: "",
  endDate: "",
  enableRecurring: false,
  recurringIntervals: [],
  tags: [],
  isGlobal: false,
  assignedKiosks: [],
};

type CampaignFormUpdater =
  | CampaignFormData
  | ((prev: CampaignFormData) => CampaignFormData);

export function useCampaignCreation(initialData?: Partial<CampaignFormData>) {
  const [formData, setFormDataState] = useState<CampaignFormData>({
    ...DEFAULT_CAMPAIGN_FORM_DATA,
    ...initialData,
  });

  const setFormData = useCallback((data: CampaignFormUpdater) => {
    if (typeof data === "function") {
      setFormDataState((prev) => data(prev));
    } else {
      setFormDataState(data);
    }
  }, []);

  const resetFormData = useCallback(() => {
    setFormDataState({
      ...DEFAULT_CAMPAIGN_FORM_DATA,
      ...initialData,
    });
  }, [initialData]);

  return { formData, setFormData, resetFormData };
}
