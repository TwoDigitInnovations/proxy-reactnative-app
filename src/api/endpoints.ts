import { apiClient } from './client';

export type UserRole = 'user' | 'provider';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export const authApi = {
  login: (data: LoginPayload) => apiClient.post('auth/login', data),
  register: (data: RegisterPayload) => apiClient.post('auth/register', data),
  sendOTPForSignUp: (data: { email: string }) => apiClient.post('sendOTPForSignUp', data),
  sendOTP: (data: { email: string }) => apiClient.post('auth/sendOTP', data),
  verifyOTP: (data: { otp: string; token: string }) => apiClient.post('auth/verifyOTP', data),
  changePassword: (data: { password: string; token: string }) => apiClient.post('auth/changePassword', data),
  fileUpload: (data: FormData) => apiClient.post('auth/user/fileupload', data),
  getProfile: () => apiClient.get('auth/getProfile'),
  updateProfile: (data: FormData) => apiClient.post('auth/updateProfile', data),
};

export const categoryApi = {
  getCategory: () => apiClient.get('category/getCategory'),
};

export interface NearMeServicePayload {
  category: string;
  location: [number, number];
}

export const serviceApi = {
  nearMeServicebyCategory: (data: NearMeServicePayload) =>
    apiClient.post('service/nearMeServicebyCategory', data),
  createService: (data: FormData) => apiClient.post('service/createService', data),
  getService: () => apiClient.get('service/getService'),
  updateService: (data: FormData) => apiClient.post('service/updateService', data),
};

export interface CreateAppointmentPayload {
  name: string;
  email: string;
  phone: string;
  gender: string;
  purpose_of_visit: string;
  date: string;
  time: string;
  service: string;
  full_date: string;
  service_provider: string;
  service_ref: string;
}

export interface PageParams {
  limit: number;
  page: number;
}

export const appointmentApi = {
  createAppointment: (data: CreateAppointmentPayload) =>
    apiClient.post('appointment/createAppointment', data),
  getRequestAppointmentById: (id: string) =>
    apiClient.get(`appointment/getRequestAppointmentById/${id}`),
  getAppointmentByUser: (params: PageParams) =>
    apiClient.get('appointment/getAppointmentByUser', params),
  getAppointmentByProvider: (params: PageParams) =>
    apiClient.get('appointment/getAppointmentByProvider', params),
  getRequestAppointmentByProviderId: (id: string) =>
    apiClient.get(`appointment/getRequestAppointmentByProviderId/${id}`),
  updateAppointmentStatusByProvider: (data: { status: string; id: string }) =>
    apiClient.post('appointment/updateAppointmentStatusByProvider', data),
  getHistoryByUserId: (id: string, params: PageParams) =>
    apiClient.get(`appointment/getHistoryByUserId/${id}`, params),
  getHistoryByProviderId: (id: string, params: PageParams) =>
    apiClient.get(`appointment/getHistoryByProviderId/${id}`, params),
  getVisitorsStatus: () => apiClient.get('appointment/getVisitorsStatus'),
};

export const contentApi = {
  getContent: () => apiClient.get('content/getContent'),
};
