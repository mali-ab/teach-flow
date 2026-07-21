export interface CreateMeetingPayload {
  creator_id: number;
  title: string;
}

export interface MeetingResponse {
  meeting: {
    id: number;
    title: string;
    created_at: string;
  };
  room: {
    server_url: string;
    room_name: string;
    join_url: string;
  };
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
}
