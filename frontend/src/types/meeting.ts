export interface CreateMeetingPayload {
  title: string;
  description?: string;
  scheduledAt?: string;
  durationMinutes?: number;
}

export interface MeetingResponse {
  id: string;
  roomName: string;
  title: string;
  created_at?: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
}