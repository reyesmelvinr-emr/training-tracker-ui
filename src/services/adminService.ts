import axios from 'axios';

const API_BASE_URL = 'http://localhost:5115/api';

export interface StatisticsData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalCourses: number;
  requiredCourses: number;
  optionalCourses: number;
  totalEnrollments: number;
  pendingEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  completionRate: number;
}

export interface HealthData {
  apiStatus: string;
  databaseStatus: string;
  databaseError?: string;
  timestamp: string;
}

export interface BulkUpdateRequest {
  userIds: string[];
  isActive: boolean;
}

export interface BulkUpdateResponse {
  totalRequested: number;
  successCount: number;
  failedCount: number;
  errors: string[];
}

export const adminService = {
  async getStatistics(): Promise<StatisticsData> {
    const response = await axios.get<StatisticsData>(`${API_BASE_URL}/admin/statistics`);
    return response.data;
  },

  async getHealth(): Promise<HealthData> {
    const response = await axios.get<HealthData>(`${API_BASE_URL}/admin/health`);
    return response.data;
  },

  async bulkUpdateUserStatus(request: BulkUpdateRequest): Promise<BulkUpdateResponse> {
    const response = await axios.patch<BulkUpdateResponse>(
      `${API_BASE_URL}/admin/users/bulk-status`,
      request
    );
    return response.data;
  },
};
