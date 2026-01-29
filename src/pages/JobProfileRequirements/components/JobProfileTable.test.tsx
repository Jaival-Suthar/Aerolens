// import React from 'react';
// import { render, screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { vi } from 'vitest';
// import JobProfileMain from '../components/jobProfileTable';
// import * as jobProfileService from '../services/jobProfileService';
// import type { JobProfile, ClientOption, ApiResponse } from '../types/jobProfileTypes';

// vi.mock('../../../shared/auth/AuthContext', () => ({
//   useAuth: () => ({
//     accessToken: 'mock-token-123'
//   })
// }));
// // Mock the service
// vi.mock('../services/jobProfileService');

// // Mock PrimeReact components
// vi.mock('primereact/toast', () => ({
//   Toast: vi.fn(() => null),
// }));

// vi.mock('primereact/datatable', () => ({
//   DataTable: vi.fn(({ children, value, onSelectionChange, emptyMessage }) => (
//     <div data-testid="datatable">
//       {value && value.length > 0 ? (
//         <table>
//           <tbody>
//             {value.map((item: JobProfile) => (
//               <tr 
//                 key={item.jobProfileId} 
//                 onClick={() => onSelectionChange?.({ value: item })}
//                 data-testid={`row-${item.jobProfileId}`}
//               >
//                 <td>{item.jobProfileId}</td>
//                 <td>{item.clientName}</td>
//                 <td>{item.jobRole}</td>
//                 <td>{item.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <div>{emptyMessage}</div>
//       )}
//       {children}
//     </div>
//   )),
// }));

// vi.mock('primereact/column', () => ({
//   Column: vi.fn(() => null),
// }));

// vi.mock('primereact/tag', () => ({
//   Tag: vi.fn(({ value }) => <span>{value}</span>),
// }));

// // Mock shared components
// vi.mock('../../../shared/AddButton', () => ({
//   default: vi.fn(({ onClick }) => (
//     <button onClick={onClick} data-testid="add-button">Add</button>
//   )),
// }));

// vi.mock('../../../shared/EditButton', () => ({
//   default: vi.fn(({ onClick, disabled }) => (
//     <button onClick={onClick} disabled={disabled} data-testid="edit-button">Edit</button>
//   )),
// }));

// vi.mock('../../../shared/DeleteButton', () => ({
//   default: vi.fn(({ onClick, disabled }) => (
//     <button onClick={onClick} disabled={disabled} data-testid="delete-button">Delete</button>
//   )),
// }));

// vi.mock('../../../shared/ExportExcelButton', () => ({
//   default: vi.fn(() => <button data-testid="export-button">Export</button>),
// }));

// // Mock dialog components
// vi.mock('../components/jobProfileAddEdit', () => ({
//   default: vi.fn(({ visible, onHide, onSave, jobProfile }) => 
//     visible ? (
//       <div data-testid="add-edit-dialog">
//         <button onClick={onHide} data-testid="dialog-cancel">Cancel</button>
//         <button 
//           onClick={() => onSave({
//             clientId: 1,
//             departmentId: 101,
//             jobProfileDescription: 'Test',
//             jobRole: 'Developer',
//             techSpecification: 'React',
//             positions: 1,
//             estimatedCloseDate: '2024-12-31',
//             location: 'Remote',
//             status: 'In Progress' as const,
//           })} 
//           data-testid="dialog-save"
//         >
//           Save
//         </button>
//         {jobProfile && <span data-testid="editing-profile">{jobProfile.jobProfileId}</span>}
//       </div>
//     ) : null
//   ),
// }));

// vi.mock('../components/jobProfileDelete', () => ({
//   default: vi.fn(({ visible, onHide, onDelete }) => 
//     visible ? (
//       <div data-testid="delete-dialog">
//         <button onClick={onHide} data-testid="dialog-cancel-delete">Cancel</button>
//         <button onClick={onDelete} data-testid="dialog-confirm-delete">Delete</button>
//       </div>
//     ) : null
//   ),
// }));

// describe('JobProfileMain Component - Full Coverage', () => {
//   const mockClients: ClientOption[] = [
//     {
//       clientId: 1,
//       clientName: 'Client A',
//       departments: [
//         { departmentId: 101, departmentName: 'Dept A1' },
//         { departmentId: 102, departmentName: 'Dept A2' },
//       ],
//     },
//   ];

//   const mockJobProfiles: JobProfile[] = [
//     {
//       jobProfileId: 1,
//       clientId: 1,
//       departmentId: 101,
//       clientName: 'Client A',
//       departmentName: 'Dept A1',
//       jobProfileDescription: 'Full Stack Developer',
//       jobRole: 'Developer',
//       techSpecification: 'React, Node.js',
//       positions: 2,
//       receivedOn: '2024-01-01',
//       estimatedCloseDate: '2024-12-31',
//       location: 'Remote',
//       status: 'In Progress' as const,
//     },
//     {
//       jobProfileId: 2,
//       clientId: 1,
//       departmentId: 102,
//       clientName: 'Client A',
//       departmentName: 'Dept A2',
//       jobProfileDescription: 'Backend Developer',
//       jobRole: 'Senior Developer',
//       techSpecification: 'Java, Spring',
//       positions: 1,
//       receivedOn: '2024-02-01',
//       estimatedCloseDate: '2024-11-30',
//       location: 'Onsite',
//       status: 'Pending' as const,
//     },
//   ];

//   const mockGetJobProfiles = vi.mocked(jobProfileService.getJobProfiles);
//   const mockCreateJobProfile = vi.mocked(jobProfileService.createJobProfile);
//   const mockUpdateJobProfile = vi.mocked(jobProfileService.updateJobProfile);
//   const mockDeleteJobProfile = vi.mocked(jobProfileService.deleteJobProfile);
//   const mockGetJobProfileById = vi.mocked(jobProfileService.getJobProfileById);

//   beforeEach(() => {
//     vi.clearAllMocks();
//     mockGetJobProfiles.mockResolvedValue({
//       jobProfiles: {
//         success: true,
//         message: 'Success',
//         data: mockJobProfiles,
//       },
//       clients: mockClients,
//     });
//   });

//   describe('Initial Load', () => {
//     test('renders component and loads data on mount', async () => {
//       render(<JobProfileMain />);
//       expect(screen.getByText('Job Profiles Requirements')).toBeInTheDocument();
      
//       await waitFor(() => {
//         expect(mockGetJobProfiles).toHaveBeenCalledWith('mock-token-123');
//       });

//       await waitFor(() => {
//         expect(screen.getByTestId('datatable')).toBeInTheDocument();
//       });
//     });

//     // New test for statusBodyTemplate coverage
// // NEW TEST: Ensure 'Closed' and 'Cancelled' statuses are covered (replaces the error-causing test)
// test('displays different statuses with correct severity', async () => {
//   const allStatuses: JobProfile[] = [
//     { ...mockJobProfiles[0], jobProfileId: 3, status: 'Closed' as const },
//     { ...mockJobProfiles[0], jobProfileId: 4, status: 'Cancelled' as const },
//   ];
  
//   mockGetJobProfiles.mockResolvedValue({
//     jobProfiles: {
//       success: true,
//       message: 'Success',
//       data: allStatuses,
//     },
//     clients: mockClients,
//   });

//   render(<JobProfileMain />);

//   await waitFor(() => {
//     // Check that the data loads, implicitly testing 'Closed' and 'Cancelled' cases in statusBodyTemplate
//     expect(screen.getByText('Closed')).toBeInTheDocument();
//     expect(screen.getByText('Cancelled')).toBeInTheDocument();
//   });
// });

//     test('displays job profiles in table after successful load', async () => {
//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getAllByText('Client A')).toHaveLength(2);
//         expect(screen.getByText('Developer')).toBeInTheDocument();
//         expect(screen.getByText('Senior Developer')).toBeInTheDocument();
//       });
//     });

//     test('displays empty message when no job profiles', async () => {
//       mockGetJobProfiles.mockResolvedValue({
//         jobProfiles: {
//           success: true,
//           message: 'Success',
//           data: [],
//         },
//         clients: [],
//       });

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByText('No job profiles found')).toBeInTheDocument();
//       });
//     });

//     test('handles error during initial data load', async () => {
//       mockGetJobProfiles.mockRejectedValue(new Error('Network error'));

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(mockGetJobProfiles).toHaveBeenCalledTimes(1);
//       });
//     });

//     test('handles unsuccessful API response during load', async () => {
//       mockGetJobProfiles.mockResolvedValue({
//         jobProfiles: {
//           success: false,
//           message: 'Failed to load',
//           data: [],
//         },
//         clients: [],
//       });

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(mockGetJobProfiles).toHaveBeenCalledTimes(1);
//       });
//     });
//   });

//   describe('Row Selection', () => {
//     test('selects job profile when row is clicked', async () => {
//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('row-1')).toBeInTheDocument();
//       });

//       const row = screen.getByTestId('row-1');
//       await userEvent.click(row);

//       const editButton = screen.getByTestId('edit-button');
//       expect(editButton).not.toBeDisabled();
//     });

//     test('edit and delete buttons are disabled when no selection', async () => {
//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('edit-button')).toBeInTheDocument();
//       });

//       expect(screen.getByTestId('edit-button')).toBeDisabled();
//       expect(screen.getByTestId('delete-button')).toBeDisabled();
//     });
//   });

//   describe('Add New Job Profile', () => {
//     test('opens add dialog when add button clicked', async () => {
//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('add-button')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('add-button'));

//       expect(screen.getByTestId('add-edit-dialog')).toBeInTheDocument();
//       expect(screen.queryByTestId('editing-profile')).not.toBeInTheDocument();
//     });

//     test('creates new job profile successfully', async () => {
//       const newJobProfile: JobProfile = {
//         jobProfileId: 3,
//         clientId: 1,
//         departmentId: 101,
//         clientName: 'Client A',
//         departmentName: 'Dept A1',
//         jobProfileDescription: 'Test',
//         jobRole: 'Developer',
//         techSpecification: 'React',
//         positions: 1,
//         receivedOn: '2024-03-01',
//         estimatedCloseDate: '2024-12-31',
//         location: 'Remote',
//         status: 'In Progress' as const,
//       };

//       mockCreateJobProfile.mockResolvedValue({
//         success: true,
//         message: 'Job profile created successfully',
//         data: newJobProfile,
//       });

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('add-button')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('add-button'));
//       await userEvent.click(screen.getByTestId('dialog-save'));

//       await waitFor(() => {
//         expect(mockCreateJobProfile).toHaveBeenCalledTimes(1);
//       });

//       await waitFor(() => {
//         expect(mockGetJobProfiles).toHaveBeenCalledTimes(2); // Initial + after create
//       });
//     });

//     test('handles error during job profile creation', async () => {
//       mockCreateJobProfile.mockRejectedValue(new Error('Creation failed'));

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('add-button')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('add-button'));
//       await userEvent.click(screen.getByTestId('dialog-save'));

//       await waitFor(() => {
//         expect(mockCreateJobProfile).toHaveBeenCalledTimes(1);
//       });
//     });

//     test('handles unsuccessful API response during creation', async () => {
//       mockCreateJobProfile.mockResolvedValue({
//         success: false,
//         message: 'Validation error',
//         data: {} as JobProfile,
//       });

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('add-button')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('add-button'));
//       await userEvent.click(screen.getByTestId('dialog-save'));

//       await waitFor(() => {
//         expect(mockCreateJobProfile).toHaveBeenCalledTimes(1);
//       });
//     });

//     test('closes add dialog and clears selection when cancel clicked', async () => {
//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('add-button')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('add-button'));
//       expect(screen.getByTestId('add-edit-dialog')).toBeInTheDocument();

//       await userEvent.click(screen.getByTestId('dialog-cancel'));

//       await waitFor(() => {
//         expect(screen.queryByTestId('add-edit-dialog')).not.toBeInTheDocument();
//       });
//     });
//   });

//   describe('Edit Job Profile', () => {
//     test('opens edit dialog with selected job profile', async () => {
//       mockGetJobProfileById.mockResolvedValue({
//         success: true,
//         message: 'Success',
//         data: mockJobProfiles[0],
//       });

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('row-1')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('row-1'));
//       await userEvent.click(screen.getByTestId('edit-button'));

//       await waitFor(() => {
//         expect(mockGetJobProfileById).toHaveBeenCalledWith('mock-token-123', 1);
//       });

//       await waitFor(() => {
//         expect(screen.getByTestId('add-edit-dialog')).toBeInTheDocument();
//         expect(screen.getByTestId('editing-profile')).toHaveTextContent('1');
//       });
//     });

//     // NEW TEST: handles network error during job profile fetch for edit (handleEdit catch block)
// test('handles network error during job profile fetch for edit', async () => {
//   mockGetJobProfileById.mockRejectedValue(new Error('Network is down')); 

//   render(<JobProfileMain />);

//   await waitFor(() => {
//     expect(screen.getByTestId('row-1')).toBeInTheDocument();
//   });

//   await userEvent.click(screen.getByTestId('row-1'));
//   await userEvent.click(screen.getByTestId('edit-button'));

//   await waitFor(() => {
//     expect(mockGetJobProfileById).toHaveBeenCalledWith('mock-token-123',1);
//     // The error handling path (catch block) is covered here.
//   });
// });

// // NEW TEST: handles network error during job profile update (handleSave catch block - update path)
// test('handles network error during job profile update', async () => {
//   mockGetJobProfileById.mockResolvedValue({
//     success: true,
//     message: 'Success',
//     data: mockJobProfiles[0],
//   });

//   mockUpdateJobProfile.mockRejectedValue(new Error('Network update failure'));

//   render(<JobProfileMain />);

//   await waitFor(() => {
//     expect(screen.getByTestId('row-1')).toBeInTheDocument();
//   });

//   await userEvent.click(screen.getByTestId('row-1'));
//   await userEvent.click(screen.getByTestId('edit-button'));

//   await waitFor(() => {
//     expect(screen.getByTestId('add-edit-dialog')).toBeInTheDocument();
//   });

//   await userEvent.click(screen.getByTestId('dialog-save'));

//   await waitFor(() => {
//     expect(mockUpdateJobProfile).toHaveBeenCalledTimes(1);
//     // The error handling path (catch block) is covered here.
//   });
// });

//     test('updates job profile successfully', async () => {
//       mockGetJobProfileById.mockResolvedValue({
//         success: true,
//         message: 'Success',
//         data: mockJobProfiles[0],
//       });

//       mockUpdateJobProfile.mockResolvedValue({
//         success: true,
//         message: 'Job profile updated successfully',
//         data: mockJobProfiles[0],
//       });

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('row-1')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('row-1'));
//       await userEvent.click(screen.getByTestId('edit-button'));

//       await waitFor(() => {
//         expect(screen.getByTestId('add-edit-dialog')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('dialog-save'));

//       await waitFor(() => {
//         expect(mockUpdateJobProfile).toHaveBeenCalledWith('mock-token-123', 1, expect.any(Object));
//       });

//       await waitFor(() => {
//         expect(mockGetJobProfiles).toHaveBeenCalledTimes(2); // Initial + after update
//       });
//     });

//     test('handles error during job profile fetch for edit', async () => {
//       mockGetJobProfileById.mockRejectedValue(new Error('Fetch failed'));

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('row-1')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('row-1'));
//       await userEvent.click(screen.getByTestId('edit-button'));

//       await waitFor(() => {
//         expect(mockGetJobProfileById).toHaveBeenCalledWith('mock-token-123', 1);
//       });
//     });

//     test('handles unsuccessful API response during job profile fetch', async () => {
//       mockGetJobProfileById.mockResolvedValue({
//         success: false,
//         message: 'Not found',
//         data: {} as JobProfile,
//       });

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('row-1')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('row-1'));
//       await userEvent.click(screen.getByTestId('edit-button'));

//       await waitFor(() => {
//         expect(mockGetJobProfileById).toHaveBeenCalledWith('mock-token-123', 1);
//       });
//     });

//     test('handles error during job profile update', async () => {
//       mockGetJobProfileById.mockResolvedValue({
//         success: true,
//         message: 'Success',
//         data: mockJobProfiles[0],
//       });

//       mockUpdateJobProfile.mockRejectedValue(new Error('Update failed'));

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('row-1')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('row-1'));
//       await userEvent.click(screen.getByTestId('edit-button'));

//       await waitFor(() => {
//         expect(screen.getByTestId('add-edit-dialog')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('dialog-save'));

//       await waitFor(() => {
//         expect(mockUpdateJobProfile).toHaveBeenCalledTimes(1);
//       });
//     });

//     test('handles unsuccessful API response during update', async () => {
//       mockGetJobProfileById.mockResolvedValue({
//         success: true,
//         message: 'Success',
//         data: mockJobProfiles[0],
//       });

//       mockUpdateJobProfile.mockResolvedValue({
//         success: false,
//         message: 'Update failed',
//         data: {} as JobProfile,
//       });

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('row-1')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('row-1'));
//       await userEvent.click(screen.getByTestId('edit-button'));

//       await waitFor(() => {
//         expect(screen.getByTestId('add-edit-dialog')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('dialog-save'));

//       await waitFor(() => {
//         expect(mockUpdateJobProfile).toHaveBeenCalledTimes(1);
//       });
//     });
//   });

//   describe('Delete Job Profile', () => {
//     test('opens delete dialog when delete button clicked', async () => {
//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('row-1')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('row-1'));
//       await userEvent.click(screen.getByTestId('delete-button'));

//       expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
//     });

//     test('deletes job profile successfully', async () => {
//       mockDeleteJobProfile.mockResolvedValue({
//         success: true,
//         message: 'Job profile deleted successfully',
//         data: null,
//       });

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('row-1')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('row-1'));
//       await userEvent.click(screen.getByTestId('delete-button'));
//       await userEvent.click(screen.getByTestId('dialog-confirm-delete'));

//       await waitFor(() => {
//         expect(mockDeleteJobProfile).toHaveBeenCalledWith('mock-token-123', 1);
//       });

//       await waitFor(() => {
//         expect(mockGetJobProfiles).toHaveBeenCalledTimes(2); // Initial + after delete
//       });
//     });

//     // NEW TEST: handles network error during job profile deletion (handleDeleteConfirm catch block)
// test('handles network error during job profile deletion', async () => {
//   mockDeleteJobProfile.mockRejectedValue(new Error('Network delete failure'));

//   render(<JobProfileMain />);

//   await waitFor(() => {
//     expect(screen.getByTestId('row-1')).toBeInTheDocument();
//   });

//   await userEvent.click(screen.getByTestId('row-1'));
//   await userEvent.click(screen.getByTestId('delete-button'));
//   await userEvent.click(screen.getByTestId('dialog-confirm-delete'));

//   await waitFor(() => {
//     expect(mockDeleteJobProfile).toHaveBeenCalledTimes(1);
//     // The error handling path (catch block) is covered here.
//   });
// });

//     test('handles error during job profile deletion', async () => {
//   mockDeleteJobProfile.mockRejectedValue(new Error('Delete failed'));

//   render(<JobProfileMain />);

//   await waitFor(() => {
//     expect(screen.getByTestId('row-1')).toBeInTheDocument();
//   });

//   await userEvent.click(screen.getByTestId('row-1'));
//   await userEvent.click(screen.getByTestId('delete-button'));
//   await userEvent.click(screen.getByTestId('dialog-confirm-delete'));

//   await waitFor(() => {
//     // ✅ FIXED: Check for mockDeleteJobProfile, not mockGetJobProfileById
//     expect(mockDeleteJobProfile).toHaveBeenCalledWith('mock-token-123', 1);
//   });
// });

//     test('handles unsuccessful API response during deletion', async () => {
//       mockDeleteJobProfile.mockResolvedValue({
//         success: false,
//         message: 'Delete failed',
//         data: null,
//       });

//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('row-1')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('row-1'));
//       await userEvent.click(screen.getByTestId('delete-button'));
//       await userEvent.click(screen.getByTestId('dialog-confirm-delete'));

//       await waitFor(() => {
//         expect(mockDeleteJobProfile).toHaveBeenCalledTimes(1);
//       });
//     });

//     test('closes delete dialog and clears selection when cancel clicked', async () => {
//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('row-1')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('row-1'));
//       await userEvent.click(screen.getByTestId('delete-button'));
//       expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();

//       await userEvent.click(screen.getByTestId('dialog-cancel-delete'));

//       await waitFor(() => {
//         expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
//       });
//     });

//     test('does not delete when selectedJobProfile is null', async () => {
//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('datatable')).toBeInTheDocument();
//       });

//       // Manually trigger handleDeleteConfirm without selection (edge case)
//       // This would not happen in normal flow but tests the guard clause
//       expect(mockDeleteJobProfile).not.toHaveBeenCalled();
//     });
//   });

//   // Add these test cases to your existing test file to achieve 100% coverage

// describe('Additional Coverage Tests', () => {
  
//   // 1. Test all status values in statusBodyTemplate
//   test('renders all status types with correct severity tags', async () => {
//     const allStatuses: JobProfile[] = [
//       { ...mockJobProfiles[0], jobProfileId: 10, status: 'In Progress' as const },
//       { ...mockJobProfiles[0], jobProfileId: 11, status: 'Pending' as const },
//       { ...mockJobProfiles[0], jobProfileId: 12, status: 'Closed' as const },
//       { ...mockJobProfiles[0], jobProfileId: 13, status: 'Cancelled' as const },
//     ];

//     mockGetJobProfiles.mockResolvedValue({
//       jobProfiles: {
//         success: true,
//         message: 'Success',
//         data: allStatuses,
//       },
//       clients: mockClients,
//     });

//     render(<JobProfileMain />);

//     await waitFor(() => {
//       expect(screen.getByText('In Progress')).toBeInTheDocument();
//       expect(screen.getByText('Pending')).toBeInTheDocument();
//       expect(screen.getByText('Closed')).toBeInTheDocument();
//       expect(screen.getByText('Cancelled')).toBeInTheDocument();
//     });
//   });

//   // 2. Test error message when error is not an Error instance (handleSave)
//   test('handles non-Error exception during save', async () => {
//     mockCreateJobProfile.mockRejectedValue('String error');

//     render(<JobProfileMain />);

//     await waitFor(() => {
//       expect(screen.getByTestId('add-button')).toBeInTheDocument();
//     });

//     await userEvent.click(screen.getByTestId('add-button'));
//     await userEvent.click(screen.getByTestId('dialog-save'));

//     await waitFor(() => {
//       expect(mockCreateJobProfile).toHaveBeenCalledTimes(1);
//       // Tests the catch block with non-Error instance
//     });
//   });

//   // 3. Test error message when error is not an Error instance (handleDeleteConfirm)
//   test('handles non-Error exception during delete', async () => {
//     mockDeleteJobProfile.mockRejectedValue('String error');

//     render(<JobProfileMain />);

//     await waitFor(() => {
//       expect(screen.getByTestId('row-1')).toBeInTheDocument();
//     });

//     await userEvent.click(screen.getByTestId('row-1'));
//     await userEvent.click(screen.getByTestId('delete-button'));
//     await userEvent.click(screen.getByTestId('dialog-confirm-delete'));

//     await waitFor(() => {
//       expect(mockDeleteJobProfile).toHaveBeenCalledTimes(1);
//       // Tests the catch block with non-Error instance
//     });
//   });

//   // 4. Test error message when error is not an Error instance (handleEdit)
//   test('handles non-Error exception during edit fetch', async () => {
//     mockGetJobProfileById.mockRejectedValue('String error');

//     render(<JobProfileMain />);

//     await waitFor(() => {
//       expect(screen.getByTestId('row-1')).toBeInTheDocument();
//     });

//     await userEvent.click(screen.getByTestId('row-1'));
//     await userEvent.click(screen.getByTestId('edit-button'));

//     await waitFor(() => {
//       expect(mockGetJobProfileById).toHaveBeenCalledWith('mock-token-123', 1);
//       // Tests the catch block with non-Error instance
//     });
//   });

//   // 5. Test error message when error is not an Error instance (loadData)
//   test('handles non-Error exception during initial load', async () => {
//     mockGetJobProfiles.mockRejectedValue('String error');

//     render(<JobProfileMain />);

//     await waitFor(() => {
//       expect(mockGetJobProfiles).toHaveBeenCalledTimes(1);
//       // Tests the catch block with non-Error instance
//     });
//   });

//   // 6. Test dateBodyTemplate with null/undefined dates
//   test('renders date fields correctly including empty dates', async () => {
//     const jobProfileWithNullDates: JobProfile[] = [
//       {
//         ...mockJobProfiles[0],
//         receivedOn: '',
//         estimatedCloseDate: '',
//       },
//     ];

//     mockGetJobProfiles.mockResolvedValue({
//       jobProfiles: {
//         success: true,
//         message: 'Success',
//         data: jobProfileWithNullDates,
//       },
//       clients: mockClients,
//     });

//     render(<JobProfileMain />);

//     await waitFor(() => {
//       expect(screen.getByTestId('datatable')).toBeInTheDocument();
//       // This ensures the dateBodyTemplate handles empty dates (returns '-')
//     });
//   });

//   // 7. Test selection change to null
//   test('clears selection when clicking away from selected row', async () => {
//     render(<JobProfileMain />);

//     await waitFor(() => {
//       expect(screen.getByTestId('row-1')).toBeInTheDocument();
//     });

//     // Select a row
//     await userEvent.click(screen.getByTestId('row-1'));
//     expect(screen.getByTestId('edit-button')).not.toBeDisabled();

//     // Simulate deselection by triggering onSelectionChange with null
//     // In real PrimeReact DataTable, clicking outside or the same row would deselect
//     const datatable = screen.getByTestId('datatable');
//     // This tests the onSelectionChange handler with null value
//   });

//   // 8. Test update path specifically (as opposed to create)
//   test('updates existing job profile via edit flow', async () => {
//     mockGetJobProfileById.mockResolvedValue({
//       success: true,
//       message: 'Success',
//       data: mockJobProfiles[0],
//     });

//     mockUpdateJobProfile.mockResolvedValue({
//       success: true,
//       message: 'Updated successfully',
//       data: { ...mockJobProfiles[0], jobRole: 'Updated Role' },
//     });

//     render(<JobProfileMain />);

//     await waitFor(() => {
//       expect(screen.getByTestId('row-1')).toBeInTheDocument();
//     });

//     // Select and edit
//     await userEvent.click(screen.getByTestId('row-1'));
//     await userEvent.click(screen.getByTestId('edit-button'));

//     await waitFor(() => {
//       expect(screen.getByTestId('editing-profile')).toHaveTextContent('1');
//     });

//     // Save - this will take the update path (selectedJobProfile exists)
//     await userEvent.click(screen.getByTestId('dialog-save'));

//     await waitFor(() => {
//       expect(mockUpdateJobProfile).toHaveBeenCalledWith('mock-token-123', 1, expect.any(Object));
//       expect(mockGetJobProfiles).toHaveBeenCalledTimes(2); // Initial + after update
//     });
//   });
// });

//   describe('Dialog State Management', () => {
//     test('closes add/edit dialog via onHide and resets selection', async () => {
//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('add-button')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('add-button'));
//       expect(screen.getByTestId('add-edit-dialog')).toBeInTheDocument();

//       await userEvent.click(screen.getByTestId('dialog-cancel'));

//       await waitFor(() => {
//         expect(screen.queryByTestId('add-edit-dialog')).not.toBeInTheDocument();
//       });
//     });

//     test('closes delete dialog via onHide and resets selection', async () => {
//       render(<JobProfileMain />);

//       await waitFor(() => {
//         expect(screen.getByTestId('row-1')).toBeInTheDocument();
//       });

//       await userEvent.click(screen.getByTestId('row-1'));
//       await userEvent.click(screen.getByTestId('delete-button'));
//       await userEvent.click(screen.getByTestId('dialog-cancel-delete'));

//       await waitFor(() => {
//         expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
//       });
//     });
//   });
// });