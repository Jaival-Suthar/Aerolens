// jobProfileService.ts

import { 
  JobProfile, 
  JobProfileRequest, 
  ClientOption, 
  DepartmentOption,
  JobProfileFilters,
  ApiResponse,
  PaginatedResponse
} from '../types/jobProfileTypes';

//const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

// Mock data for clients
export const getClients = async (): Promise<ClientOption[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return [
    { id: 1, name: "Intuit" },
    { id: 2, name: "Microsoft" },
    { id: 3, name: "Google" },
    { id: 4, name: "Amazon" },
  ];
};

// Mock data for departments
export const getDepartments = async (): Promise<DepartmentOption[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return [
    { id: 1, name: "Payroll", clientId: 1 }, // Intuit
    { id: 2, name: "QuickBooks", clientId: 1 }, // Intuit
    { id: 3, name: "TurboTax", clientId: 1 }, // Intuit
    { id: 4, name: "Azure", clientId: 2 }, // Microsoft
    { id: 5, name: "Office 365", clientId: 2 }, // Microsoft
    { id: 6, name: "Search", clientId: 3 }, // Google
    { id: 7, name: "Cloud Platform", clientId: 3 }, // Google
    { id: 8, name: "AWS", clientId: 4 }, // Amazon
    { id: 9, name: "Prime", clientId: 4 }, // Amazon
  ];
};

// Mock job profiles data with proper typing aligned to API
const mockJobProfiles: JobProfile[] = [
  {
    jobProfileId: 1,
    clientName: "Intuit",
    clientId: 1,
    departmentName: "Payroll",
    departmentId: 1,
    jobProfileDescription: "Full stack developer having 6+ years of experience",
    jobRole: "Full Stack Developer",
    techSpecification: "Java, React, Spring Boot",
    positions: 3,
    receivedOn: "2025-09-12T00:00:00.000Z",
    estimatedCloseDate: "2025-09-20T00:00:00.000Z",
    location: "IDC",
    status: "In Progress",
  },
  {
    jobProfileId: 2,
    clientName: "Intuit",
    clientId: 1,
    departmentName: "Payroll",
    departmentId: 1,
    jobProfileDescription: "Backend developer having 5+ years of experience",
    jobRole: "Backend Engineer",
    techSpecification: "Java, Spring Boot, MySQL",
    positions: 1,
    receivedOn: "2025-09-16T00:00:00.000Z",
    estimatedCloseDate: "2025-09-20T00:00:00.000Z",
    location: "US",
    status: "Pending",
  },
  {
    jobProfileId: 3,
    clientName: "Microsoft",
    clientId: 2,
    departmentName: "Azure",
    departmentId: 4,
    jobProfileDescription: "Cloud architect with 8+ years of experience in Azure",
    jobRole: "Cloud Architect",
    techSpecification: "Azure, .NET, C#, Docker",
    positions: 2,
    receivedOn: "2025-09-10T00:00:00.000Z",
    estimatedCloseDate: "2025-09-30T00:00:00.000Z",
    location: "Seattle",
    status: "In Progress",
  },
  {
    jobProfileId: 4,
    clientName: "Google",
    clientId: 3,
    departmentName: "Search",
    departmentId: 6,
    jobProfileDescription: "Senior frontend engineer with React expertise",
    jobRole: "Frontend Engineer",
    techSpecification: "React, TypeScript, Node.js",
    positions: 4,
    receivedOn: "2025-09-15T00:00:00.000Z",
    estimatedCloseDate: "2025-10-15T00:00:00.000Z",
    location: "Mountain View",
    status: "Pending",
  },
];

// API call functions - replace with actual API calls in production
export const getJobProfiles = async (page?: number, limit?: number): Promise<PaginatedResponse<JobProfile>> => {
  try {
    // In production, replace with:
    // const response = await fetch(`${API_BASE_URL}/jobProfile?page=${page || 1}&limit=${limit || 10}`);
    // const data = await response.json();
    // if (!data.success) throw new Error(data.message);
    // return data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const currentPage = page || 1;
    const pageSize = limit || 10;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedData = [...mockJobProfiles].slice(startIndex, endIndex);
    
    return {
      success: true,
      message: "Job Profiles retrieved successfully",
      data: paginatedData,
      totalRecords: mockJobProfiles.length,
      currentPage,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch job profiles');
  }
};

export const getJobProfileById = async (id: number): Promise<ApiResponse<JobProfile>> => {
  try {
    // In production, replace with:
    // const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`);
    // const data = await response.json();
    // if (!data.success) throw new Error(data.message);
    // return data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const profile = mockJobProfiles.find(profile => profile.jobProfileId === id);
    if (!profile) {
      return {
        success: false,
        message: 'Job profile not found',
        data: {} as JobProfile
      };
    }
    
    return {
      success: true,
      message: 'Job profile retrieved successfully',
      data: profile
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch job profile');
  }
};

export const createJobProfile = async (jobProfileData: Omit<JobProfileRequest, 'jobProfileId'>): Promise<ApiResponse<JobProfile>> => {
  try {
    // In production, replace with:
    // const response = await fetch(`${API_BASE_URL}/jobProfile`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(jobProfileData)
    // });
    // const data = await response.json();
    // if (!data.success) throw new Error(data.message);
    // return data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const clients = await getClients();
    const departments = await getDepartments();
    
    const client = clients.find(c => c.id === jobProfileData.clientId);
    const department = departments.find(d => d.id === jobProfileData.departmentId);
    
    if (!client || !department) {
      return {
        success: false,
        message: 'Invalid client or department ID',
        data: {} as JobProfile
      };
    }
    
    if (department.clientId !== jobProfileData.clientId) {
      return {
        success: false,
        message: 'Department does not belong to the selected client',
        data: {} as JobProfile
      };
    }
    
    const newJobProfile: JobProfile = {
      jobProfileId: Math.max(...mockJobProfiles.map(p => p.jobProfileId || 0)) + 1,
      clientName: client.name,
      clientId: jobProfileData.clientId,
      departmentName: department.name,
      departmentId: jobProfileData.departmentId,
      jobProfileDescription: jobProfileData.jobProfileDescription,
      jobRole: jobProfileData.jobRole,
      techSpecification: jobProfileData.techSpecification,
      positions: jobProfileData.positions,
      receivedOn: new Date().toISOString(), // Auto-set on backend
      estimatedCloseDate: jobProfileData.estimatedCloseDate,
      location: jobProfileData.location,
      status: jobProfileData.status,
    };
    
    mockJobProfiles.push(newJobProfile);
    
    return {
      success: true,
      message: 'Job Profile created successfully',
      data: newJobProfile
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create job profile');
  }
};

export const updateJobProfile = async (id: number, jobProfileData: Partial<Omit<JobProfileRequest, 'jobProfileId'>>): Promise<ApiResponse<JobProfile>> => {
  try {
    // In production, replace with:
    // const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(jobProfileData)
    // });
    // const data = await response.json();
    // if (!data.success) throw new Error(data.message);
    // return data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockJobProfiles.findIndex(profile => profile.jobProfileId === id);
    if (index === -1) {
      return {
        success: false,
        message: 'Job profile not found',
        data: {} as JobProfile
      };
    }
    
    const clients = await getClients();
    const departments = await getDepartments();
    
    let client = clients.find(c => c.id === mockJobProfiles[index].clientId);
    let department = departments.find(d => d.id === mockJobProfiles[index].departmentId);
    
    if (jobProfileData.clientId) {
      client = clients.find(c => c.id === jobProfileData.clientId);
      if (!client) {
        return {
          success: false,
          message: 'Invalid client ID',
          data: {} as JobProfile
        };
      }
    }
    
    if (jobProfileData.departmentId) {
      department = departments.find(d => d.id === jobProfileData.departmentId);
      if (!department || department.clientId !== (jobProfileData.clientId || mockJobProfiles[index].clientId)) {
        return {
          success: false,
          message: 'Department does not belong to the selected client',
          data: {} as JobProfile
        };
      }
    }
    
    const updatedJobProfile: JobProfile = {
      ...mockJobProfiles[index],
      ...(jobProfileData.clientId && { clientId: jobProfileData.clientId, clientName: client!.name }),
      ...(jobProfileData.departmentId && { departmentId: jobProfileData.departmentId, departmentName: department!.name }),
      ...(jobProfileData.jobProfileDescription && { jobProfileDescription: jobProfileData.jobProfileDescription }),
      ...(jobProfileData.jobRole && { jobRole: jobProfileData.jobRole }),
      ...(jobProfileData.techSpecification && { techSpecification: jobProfileData.techSpecification }),
      ...(jobProfileData.positions && { positions: jobProfileData.positions }),
      ...(jobProfileData.estimatedCloseDate && { estimatedCloseDate: jobProfileData.estimatedCloseDate }),
      ...(jobProfileData.location && { location: jobProfileData.location }),
      ...(jobProfileData.status && { status: jobProfileData.status }),
    };
    
    mockJobProfiles[index] = updatedJobProfile;
    
    return {
      success: true,
      message: 'Job profile updated successfully',
      data: updatedJobProfile
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update job profile');
  }
};

export const deleteJobProfile = async (id: number): Promise<ApiResponse<null>> => {
  try {
    // In production, replace with:
    // const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
    //   method: 'DELETE'
    // });
    // const data = await response.json();
    // if (!data.success) throw new Error(data.message);
    // return data;
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockJobProfiles.findIndex(profile => profile.jobProfileId === id);
    if (index === -1) {
      return {
        success: false,
        message: 'Job profile not found',
        data: null
      };
    }
    
    mockJobProfiles.splice(index, 1);
    
    return {
      success: true,
      message: 'Job profile deleted successfully',
      data: null
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete job profile');
  }
};

// Get departments by client ID
export const getDepartmentsByClientId = async (clientId: number): Promise<DepartmentOption[]> => {
  const departments = await getDepartments();
  return departments.filter(dept => dept.clientId === clientId);
};

// Utility function to transform JobProfile to JobProfileRequest (for editing)
export const jobProfileToRequest = (jobProfile: JobProfile): JobProfileRequest => {
  return {
    jobProfileId: jobProfile.jobProfileId,
    clientId: jobProfile.clientId,
    departmentId: jobProfile.departmentId,
    jobProfileDescription: jobProfile.jobProfileDescription,
    jobRole: jobProfile.jobRole,
    techSpecification: jobProfile.techSpecification,
    positions: jobProfile.positions,
    estimatedCloseDate: jobProfile.estimatedCloseDate,
    location: jobProfile.location,
    status: jobProfile.status,
  };
};

// Search/Filter functionality with improved type safety
export const searchJobProfiles = async (filters: JobProfileFilters): Promise<JobProfile[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let filtered = [...mockJobProfiles];
  
  if (filters.clientId) {
    filtered = filtered.filter(profile => profile.clientId === filters.clientId);
  }
  
  if (filters.departmentId) {
    filtered = filtered.filter(profile => profile.departmentId === filters.departmentId);
  }
  
  if (filters.status) {
    filtered = filtered.filter(profile => profile.status === filters.status);
  }
  
  if (filters.location) {
    filtered = filtered.filter(profile => 
      profile.location.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }
  
  if (filters.jobRole) {
    filtered = filtered.filter(profile => 
      profile.jobRole.toLowerCase().includes(filters.jobRole!.toLowerCase())
    );
  }
  
  if (filters.dateFrom) {
    filtered = filtered.filter(profile => 
      new Date(profile.receivedOn) >= new Date(filters.dateFrom!)
    );
  }
  
  if (filters.dateTo) {
    filtered = filtered.filter(profile => 
      new Date(profile.receivedOn) <= new Date(filters.dateTo!)
    );
  }
  
  return filtered;
};

// Validation utilities
export const validateJobProfileRequest = (data: Partial<JobProfileRequest>): string[] => {
  const errors: string[] = [];
  
  if (!data.clientId) errors.push('Client is required');
  if (!data.departmentId) errors.push('Department is required');
  if (!data.jobProfileDescription?.trim()) errors.push('Job Profile Description is required');
  if (data.jobProfileDescription && data.jobProfileDescription.length < 10) errors.push('Job Profile Description must be at least 10 characters');
  if (data.jobProfileDescription && data.jobProfileDescription.length > 500) errors.push('Job Profile Description must not exceed 500 characters');
  if (!data.jobRole?.trim()) errors.push('Job Role is required');
  if (data.jobRole && data.jobRole.length < 2) errors.push('Job Role must be at least 2 characters');
  if (data.jobRole && data.jobRole.length > 100) errors.push('Job Role must not exceed 100 characters');
  if (!data.techSpecification?.trim()) errors.push('Tech Specification is required');
  if (!data.positions || data.positions < 1) errors.push('Positions must be at least 1');
  if (!data.estimatedCloseDate) errors.push('Estimated Close Date is required');
  if (!data.location?.trim()) errors.push('Location is required');
  if (!data.status) errors.push('Status is required');
  
  if (data.estimatedCloseDate) {
    const closeDate = new Date(data.estimatedCloseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (closeDate < today) {
      errors.push('Estimated Close Date must be in the future');
    }
  }
  
  return errors;
};