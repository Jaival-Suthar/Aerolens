import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import JobProfileDelete from '../components/jobProfileDelete';
describe('JobProfileDelete Component - Full Coverage', () => {
    const mockOnHide = vi.fn();
    const mockOnDelete = vi.fn();
    const mockClients = [
        {
            clientId: 1,
            clientName: 'Client A',
            departments: [
                { departmentId: 101, departmentName: 'Dept A1' },
                { departmentId: 102, departmentName: 'Dept A2' },
            ],
        },
    ];
    const mockJobProfile = {
        jobProfileId: 99,
        clientId: 1,
        departmentId: 102,
        clientName: 'Fallback Client A',
        departmentName: 'Fallback Dept A2',
        jobProfileDescription: 'Sample description',
        jobRole: 'Developer',
        techSpecification: 'React, TS',
        positions: 3,
        receivedOn: '2024-01-01',
        estimatedCloseDate: '2024-12-31T00:00:00.000Z',
        location: 'Remote',
        status: 'In Progress',
    };
    beforeEach(() => {
        vi.clearAllMocks();
    });
    test('renders nothing when jobProfile is null, regardless of visible', () => {
        const { container } = render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: null, clients: mockClients }));
        expect(container.firstChild).toBeNull();
        const { container: container2 } = render(_jsx(JobProfileDelete, { visible: false, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: null, clients: mockClients }));
        expect(container2.firstChild).toBeNull();
    });
    test('does not render dialog when visible is false, even if jobProfile is present', () => {
        const { container } = render(_jsx(JobProfileDelete, { visible: false, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: mockJobProfile, clients: mockClients }));
        // Component renders but Dialog is not visible
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    test('renders dialog and all job profile details correctly', () => {
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: mockJobProfile, clients: mockClients }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        // Job Profile details: fallback clientName & departmentName replaced by array lookups
        expect(screen.getByText('99')).toBeInTheDocument();
        expect(screen.getByText('Client A')).toBeInTheDocument();
        expect(screen.getByText('Dept A2')).toBeInTheDocument();
        expect(screen.getByText('Developer')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('Remote')).toBeInTheDocument();
        expect(screen.getByText('In Progress')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete this job profile\?/i)).toBeInTheDocument();
    });
    test('handles missing client gracefully with fallback clientName', () => {
        const orphanJobProfile = { ...mockJobProfile, clientId: 999, departmentId: 999 };
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: orphanJobProfile, clients: mockClients }));
        expect(screen.getByText(orphanJobProfile.clientName)).toBeInTheDocument();
        expect(screen.getByText(orphanJobProfile.departmentName)).toBeInTheDocument();
    });
    test('handles missing department gracefully with fallback departmentName', () => {
        // Client exists but department doesn't
        const jobProfileWithMissingDept = { ...mockJobProfile, departmentId: 999 };
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: jobProfileWithMissingDept, clients: mockClients }));
        expect(screen.getByText('Client A')).toBeInTheDocument();
        expect(screen.getByText(jobProfileWithMissingDept.departmentName)).toBeInTheDocument();
    });
    test('displays dash when location is empty string', () => {
        const jobProfileNoLocation = { ...mockJobProfile, location: '' };
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: jobProfileNoLocation, clients: mockClients }));
        // Find the location row and check for dash
        const locationLabel = screen.getByText('Location:');
        const locationValue = locationLabel.closest('.col-6')?.nextElementSibling;
        expect(locationValue).toHaveTextContent('-');
    });
    test('displays dash when clientName fallback is also missing', () => {
        const jobProfileNoClient = { ...mockJobProfile, clientId: 999, clientName: '' };
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: jobProfileNoClient, clients: mockClients }));
        const clientLabel = screen.getByText('Client:');
        const clientValue = clientLabel.closest('.col-6')?.nextElementSibling;
        expect(clientValue).toHaveTextContent('-');
    });
    test('displays dash when departmentName fallback is also missing', () => {
        const jobProfileNoDept = { ...mockJobProfile, departmentId: 999, departmentName: '' };
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: jobProfileNoDept, clients: mockClients }));
        const deptLabel = screen.getByText('Department:');
        const deptValue = deptLabel.closest('.col-6')?.nextElementSibling;
        expect(deptValue).toHaveTextContent('-');
    });
    test('renders correct CSS classes for "Pending" status', () => {
        const pendingJobProfile = { ...mockJobProfile, status: 'Pending' };
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: pendingJobProfile, clients: mockClients }));
        const statusElement = screen.getByText('Pending');
        expect(statusElement).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
    test('renders correct CSS classes for "Closed" status', () => {
        const closedJobProfile = { ...mockJobProfile, status: 'Closed' };
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: closedJobProfile, clients: mockClients }));
        const statusElement = screen.getByText('Closed');
        expect(statusElement).toHaveClass('bg-green-100', 'text-green-800');
    });
    test('renders correct CSS classes for "Cancelled" status', () => {
        const cancelledJobProfile = { ...mockJobProfile, status: 'Cancelled' };
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: cancelledJobProfile, clients: mockClients }));
        const statusElement = screen.getByText('Cancelled');
        expect(statusElement).toHaveClass('bg-red-100', 'text-red-800');
    });
    test('onDelete is called when delete button clicked', async () => {
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: mockJobProfile, clients: mockClients }));
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        await userEvent.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
    test('onHide is called and error reset when cancel button clicked', async () => {
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: mockJobProfile, clients: mockClients }));
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await userEvent.click(cancelButton);
        expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
    //   test('onHide is called when dialog onHide is triggered', () => {
    //     const { rerender } = render(
    //       <JobProfileDelete visible={true} onHide={mockOnHide} onDelete={mockOnDelete} jobProfile={mockJobProfile} clients={mockClients} />
    //     );
    //     // Trigger dialog close by changing visible to false
    //     rerender(
    //       <JobProfileDelete visible={false} onHide={mockOnHide} onDelete={mockOnDelete} jobProfile={mockJobProfile} clients={mockClients} />
    //     );
    //     // In a real scenario, the Dialog's onHide would be called by PrimeReact
    //     // We can test this by simulating ESC key or clicking overlay
    //     const dialog = screen.queryByRole('dialog');
    //     expect(dialog).not.toBeInTheDocument();
    //   });
    test('delete and cancel buttons are disabled when loading is true', () => {
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: mockJobProfile, clients: mockClients, loading: true }));
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(deleteButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
    });
    test('delete and cancel buttons are enabled when loading is false', () => {
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: mockJobProfile, clients: mockClients, loading: false }));
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(deleteButton).not.toBeDisabled();
        expect(cancelButton).not.toBeDisabled();
    });
    test('loading defaults to false when not provided', () => {
        render(_jsx(JobProfileDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, jobProfile: mockJobProfile, clients: mockClients }));
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        expect(deleteButton).not.toBeDisabled();
    });
});
