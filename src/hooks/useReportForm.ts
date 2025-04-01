
import { useReportFormState } from "@/hooks/useReportFormState";
import { useComplaintSubmission } from "@/hooks/useComplaintSubmission";

export const useReportForm = () => {
  const formState = useReportFormState();
  const { submitComplaint, isPending, user } = useComplaintSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitComplaint(formState.getFormData(), formState.setLoading);
    if (isPending) {
      // Reset form only if submission was successful
      // The actual reset happens after redirection via useComplaintSubmission
      formState.resetForm();
    }
  };

  return {
    ...formState,
    user,
    handleSubmit,
    isPending
  };
};
