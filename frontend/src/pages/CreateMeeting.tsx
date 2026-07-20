import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import MeetingForm from "../components/meetings/MeetingForm";
import api from "../lib/axios";
import type { 
  CreateMeetingPayload, 
  MeetingResponse, 
  ApiErrorResponse 
} from "../types/meeting";

export default function CreateMeeting() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateMeeting = async (formData: CreateMeetingPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<MeetingResponse>("/meetings", formData);
      const roomPath = response.data.roomName
        ? `/meeting/${response.data.roomName}`
        : "/dashboard";

      navigate(roomPath);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.message ||
          "Failed to create meeting. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}
        <MeetingForm onSubmit={handleCreateMeeting} isLoading={loading} />
      </main>
    </div>
  );
}