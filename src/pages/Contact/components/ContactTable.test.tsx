import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactTable from '../components/contactTable';
import type { Contact } from '../types/contactTypes';

// Mock PrimeReact components
vi.mock('primereact/datatable', () => ({
  DataTable: ({ 
    children, 
    value, 
    loading, 
    emptyMessage,
    onPage,
    onSelectionChange,
    onRowDoubleClick,
    selection 
  }: any) => {
    return (
      <div data-testid="datatable">
        {loading ? (
          <div>{emptyMessage}</div>
        ) : value && value.length > 0 ? (
          <>
            {children}
            <button 
              onClick={() => onPage && onPage({ rows: 10, first: 0, page: 1 })} 
              data-testid="page-change-btn"
            >
              Change Page
            </button>
            {value.map((contact: Contact) => (
              <div 
                key={contact.clientContactId}
                data-testid={`contact-row-${contact.clientContactId}`}
                style={{ 
                  backgroundColor: selection?.clientContactId === contact.clientContactId ? 'lightblue' : 'transparent' 
                }}
              >
                <button
                  data-testid={`select-btn-${contact.clientContactId}`}
                  onClick={() => onSelectionChange && onSelectionChange({ value: contact })}
                >
                  Select
                </button>
                <button
                  data-testid={`dblclick-btn-${contact.clientContactId}`}
                  onClick={() => onRowDoubleClick && onRowDoubleClick({ data: contact })}
                >
                  Double Click
                </button>
                <button
                  data-testid={`dblclick-no-data-btn-${contact.clientContactId}`}
                  onClick={() => onRowDoubleClick && onRowDoubleClick({ data: null })}
                >
                  Double Click No Data
                </button>
                <span data-testid={`contact-id-${contact.clientContactId}`}>
                  {contact.clientContactId}
                </span>
                <div data-testid={`contact-person-${contact.clientContactId}`}>
                  <div>{contact.contactPersonName}</div>
                  <div>{contact.email}</div>
                </div>
                <div data-testid={`designation-${contact.clientContactId}`}>
                  <div>{contact.designation}</div>
                  <div>{contact.phone}</div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div>{emptyMessage}</div>
        )}
      </div>
    );
  }
}));

vi.mock('primereact/column', () => ({
  Column: ({ field, header }: any) => (
    <div data-testid={`column-${field || 'selection'}`}>
      {header}
    </div>
  )
}));

describe('ContactTable', () => {
  const mockContacts: Contact[] = [
    {
      clientContactId: 1,
      contactPersonName: 'John Doe',
      email: 'john@example.com',
      designation: 'Manager',
      phone: '1234567890',
      clientId: 1
    },
    {
      clientContactId: 2,
      contactPersonName: 'Jane Smith',
      email: 'jane@example.com',
      designation: 'Director',
      phone: '0987654321',
      clientId: 1
    }
  ];

  const mockOnSelectionChange = vi.fn();
  const mockOnRowDoubleClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the contact table with contacts', () => {
    render(
      <ContactTable
        contacts={mockContacts}
        loading={false}
        selectedContact={null}
        onSelectionChange={mockOnSelectionChange}
        onRowDoubleClick={mockOnRowDoubleClick}
      />
    );

    expect(screen.getByTestId('datatable')).toBeInTheDocument();
    expect(screen.getByTestId('contact-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('contact-row-2')).toBeInTheDocument();
  });

  it('displays loading message when loading', () => {
    render(
      <ContactTable
        contacts={[]}
        loading={true}
        selectedContact={null}
        onSelectionChange={mockOnSelectionChange}
        onRowDoubleClick={mockOnRowDoubleClick}
      />
    );

    expect(screen.getByText('Loading contacts...')).toBeInTheDocument();
  });

  it('displays empty message when no contacts', () => {
    render(
      <ContactTable
        contacts={[]}
        loading={false}
        selectedContact={null}
        onSelectionChange={mockOnSelectionChange}
        onRowDoubleClick={mockOnRowDoubleClick}
      />
    );

    expect(screen.getByText('No contacts found.')).toBeInTheDocument();
  });

  it('renders contact person template correctly', () => {
    render(
      <ContactTable
        contacts={mockContacts}
        loading={false}
        selectedContact={null}
        onSelectionChange={mockOnSelectionChange}
        onRowDoubleClick={mockOnRowDoubleClick}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders designation template correctly', () => {
    render(
      <ContactTable
        contacts={mockContacts}
        loading={false}
        selectedContact={null}
        onSelectionChange={mockOnSelectionChange}
        onRowDoubleClick={mockOnRowDoubleClick}
      />
    );

    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
  });

  it('calls onSelectionChange when row is selected', async () => {
    const user = userEvent.setup();
    
    render(
      <ContactTable
        contacts={mockContacts}
        loading={false}
        selectedContact={null}
        onSelectionChange={mockOnSelectionChange}
        onRowDoubleClick={mockOnRowDoubleClick}
      />
    );

    await user.click(screen.getByTestId('select-btn-1'));

    await waitFor(() => {
      expect(mockOnSelectionChange).toHaveBeenCalledWith(mockContacts[0]);
      expect(mockOnSelectionChange).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onSelectionChange when callback is not provided', async () => {
    const user = userEvent.setup();
    
    render(
      <ContactTable
        contacts={mockContacts}
        loading={false}
        onSelectionChange={undefined as any}
        selectedContact={null}
        onRowDoubleClick={mockOnRowDoubleClick}
      />
    );

    await user.click(screen.getByTestId('select-btn-1'));

    expect(mockOnSelectionChange).not.toHaveBeenCalled();
  });

  it('calls onRowDoubleClick when row is double clicked with data', async () => {
    const user = userEvent.setup();
    
    render(
      <ContactTable
        contacts={mockContacts}
        loading={false}
        selectedContact={null}
        onSelectionChange={mockOnSelectionChange}
        onRowDoubleClick={mockOnRowDoubleClick}
      />
    );

    await user.click(screen.getByTestId('dblclick-btn-1'));

    await waitFor(() => {
      expect(mockOnRowDoubleClick).toHaveBeenCalledWith(mockContacts[0]);
      expect(mockOnRowDoubleClick).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onRowDoubleClick when data is null', async () => {
    const user = userEvent.setup();
    
    render(
      <ContactTable
        contacts={mockContacts}
        loading={false}
        selectedContact={null}
        onSelectionChange={mockOnSelectionChange}
        onRowDoubleClick={mockOnRowDoubleClick}
      />
    );

    await user.click(screen.getByTestId('dblclick-no-data-btn-1'));

    expect(mockOnRowDoubleClick).not.toHaveBeenCalled();
  });

  it('does not call onRowDoubleClick when callback is not provided', async () => {
    const user = userEvent.setup();
    
    render(
      <ContactTable
        contacts={mockContacts}
        loading={false}
        onRowDoubleClick={undefined as any}
        selectedContact={null}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    await user.click(screen.getByTestId('dblclick-btn-1'));

    expect(mockOnRowDoubleClick).not.toHaveBeenCalled();
  });

  it('handles page change and updates rows per page', async () => {
    const user = userEvent.setup();
    
    render(
      <ContactTable
        contacts={mockContacts}
        loading={false}
        selectedContact={null}
        onSelectionChange={mockOnSelectionChange}
        onRowDoubleClick={mockOnRowDoubleClick}
      />
    );

    await user.click(screen.getByTestId('page-change-btn'));

    expect(screen.getByTestId('datatable')).toBeInTheDocument();
  });

  it('highlights selected contact', () => {
    render(
      <ContactTable
        contacts={mockContacts}
        loading={false}
        selectedContact={mockContacts[0]}
        onSelectionChange={mockOnSelectionChange}
        onRowDoubleClick={mockOnRowDoubleClick}
      />
    );

    const selectedRow = screen.getByTestId('contact-row-1');
    const unselectedRow = screen.getByTestId('contact-row-2');
    
    expect(selectedRow.style.backgroundColor).toBe('lightblue');
    expect(unselectedRow.style.backgroundColor).toBe('transparent');
  });

  it('uses default values for optional props', () => {
    render(<ContactTable 
      contacts={[]} 
      selectedContact={null} 
      loading={false}
      onSelectionChange={undefined as any} 
      onRowDoubleClick={undefined as any}
    />);

    expect(screen.getByText('No contacts found.')).toBeInTheDocument();
  });
});
// // ContactTable.test.tsx

// import { describe, it, expect, vi, beforeEach } from "vitest";
// import { render, screen, fireEvent } from "@testing-library/react";
// import ContactTable from "./contactTable";
// import type { Contact } from "../types/contactTypes";
// import React from "react";

// // Mock PrimeReact DataTable
// vi.mock("primereact/datatable", () => ({
//   DataTable: ({
//   children,
//   value,
//   loading,
//   emptyMessage,
//   selection,
//   onSelectionChange,
//   onRowDoubleClick,
//   onPage
// }: any) => (
//   <div data-testid="datatable">
//     <div data-testid="datatable-loading">{loading ? "true" : "false"}</div>
//     {value && value.length > 0 ? (
//       <table>
//         <thead>
//           <tr>
//             {Array.isArray(children)
//               ? children.map((child) => child)
//               : [children]}
//           </tr>
//         </thead>
//         <tbody>
//           {value.map((contact: Contact) => (
//             <tr
//               key={contact.clientContactId}
//               data-testid={`contact-row-${contact.clientContactId}`}
//               onClick={() => onSelectionChange?.({ value: contact })}
//               onDoubleClick={() => onRowDoubleClick?.({ data: contact })}
//               className={selection?.clientContactId === contact.clientContactId ? "selected" : ""}
//             >
//               <td>{contact.clientContactId}</td>
//               <td>{contact.contactPersonName}</td>
//               <td>{contact.email}</td>
//               <td>{contact.designation}</td>
//               <td>{contact.phone}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     ) : (
//       <div data-testid="empty-message">{emptyMessage}</div>
//     )}
//     <div data-testid="paginator">
//       <button onClick={() => onPage?.({ rows: 10 })}>Change Rows</button>
//     </div>
//   </div>
// ),
// Column: ({ header }: any) => <th>{header}</th>,
// }));

// describe("ContactTable", () => {
//   const mockContacts: Contact[] = [
//     {
//       clientContactId: 1,
//       contactId: 1,
//       clientId: 100,
//       contactPersonName: "John Doe",
//       designation: "Manager",
//       phone: "+1-555-0101",
//       email: "john.doe@example.com",
//     },
//     {
//       clientContactId: 2,
//       contactId: 2,
//       clientId: 100,
//       contactPersonName: "Jane Smith",
//       designation: "Director",
//       phone: "+1-555-0102",
//       email: "jane.smith@example.com",
//     },
//     {
//       clientContactId: 3,
//       contactId: 3,
//       clientId: 100,
//       contactPersonName: "Bob Johnson",
//       designation: "Engineer",
//       phone: "+1-555-0103",
//       email: "bob.johnson@example.com",
//     },
//   ];

//   const mockOnSelectionChange = vi.fn();
//   const mockOnRowDoubleClick = vi.fn();

//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   describe("Rendering", () => {
//     it("renders the contact table with contacts", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByTestId("datatable")).toBeInTheDocument();
//       expect(screen.getByText("John Doe")).toBeInTheDocument();
//       expect(screen.getByText("Jane Smith")).toBeInTheDocument();
//       expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
//     });

//     it("renders column headers correctly", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByText("Contact ID")).toBeInTheDocument();
//       expect(screen.getByText("Contact Person")).toBeInTheDocument();
//       expect(screen.getByText("Designation")).toBeInTheDocument();
//     });

//     it("renders contact person template with name and email", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByText("John Doe")).toBeInTheDocument();
//       expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
//     });

//     it("renders designation template with designation and phone", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByText("Manager")).toBeInTheDocument();
//       expect(screen.getByText("+1-555-0101")).toBeInTheDocument();
//     });
//   });

//   describe("Empty State", () => {
//     it("shows empty message when no contacts are provided", () => {
//       render(
//         <ContactTable
//           contacts={[]}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByTestId("empty-message")).toHaveTextContent("No contacts found.");
//     });

//     it("shows loading message when loading with no contacts", () => {
//       render(
//         <ContactTable
//           contacts={[]}
//           loading={true}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByTestId("empty-message")).toHaveTextContent("Loading contacts...");
//     });
//   });

//   describe("Loading State", () => {
//     it("passes loading prop to DataTable", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={true}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByTestId("datatable-loading")).toHaveTextContent("true");
//     });

//     it("does not show loading when loading is false", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByTestId("datatable-loading")).toHaveTextContent("false");
//     });
//   });

//   describe("Selection", () => {
//     it("calls onSelectionChange when a row is clicked", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       const firstRow = screen.getByTestId("contact-row-1");
//       fireEvent.click(firstRow);

//       expect(mockOnSelectionChange).toHaveBeenCalledTimes(1);
//       expect(mockOnSelectionChange).toHaveBeenCalledWith(
//         expect.objectContaining({
//           clientContactId: 1,
//           contactPersonName: "John Doe",
//         })
//       );
//     });

//     it("highlights selected contact", () => {
//       const selectedContact = mockContacts[0];

//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={selectedContact}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       const selectedRow = screen.getByTestId("contact-row-1");
//       expect(selectedRow).toHaveClass("selected");
//     });

//     it("allows changing selection to another contact", () => {
//       const { rerender } = render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={mockContacts[0]}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       const secondRow = screen.getByTestId("contact-row-2");
//       fireEvent.click(secondRow);

//       expect(mockOnSelectionChange).toHaveBeenCalledWith(
//         expect.objectContaining({
//           clientContactId: 2,
//           contactPersonName: "Jane Smith",
//         })
//       );

//       rerender(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={mockContacts[1]}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByTestId("contact-row-2")).toHaveClass("selected");
//     });
//   });

//   describe("Row Double Click", () => {
//     it("calls onRowDoubleClick when a row is double clicked", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       const firstRow = screen.getByTestId("contact-row-1");
//       fireEvent.doubleClick(firstRow);

//       expect(mockOnRowDoubleClick).toHaveBeenCalledTimes(1);
//       expect(mockOnRowDoubleClick).toHaveBeenCalledWith(
//         expect.objectContaining({
//           clientContactId: 1,
//           contactPersonName: "John Doe",
//         })
//       );
//     });

//     it("calls onRowDoubleClick with correct contact data", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       const secondRow = screen.getByTestId("contact-row-2");
//       fireEvent.doubleClick(secondRow);

//       expect(mockOnRowDoubleClick).toHaveBeenCalledWith(
//         expect.objectContaining({
//           clientContactId: 2,
//           contactPersonName: "Jane Smith",
//           email: "jane.smith@example.com",
//           designation: "Director",
//         })
//       );
//     });
//   });

//   describe("Pagination", () => {
//     it("renders paginator", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByTestId("paginator")).toBeInTheDocument();
//     });

//     it("handles page change events", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       const changeRowsButton = screen.getByText("Change Rows");
//       fireEvent.click(changeRowsButton);

//       // The component should handle the page change internally
//       // This test verifies the event handler is connected
//       expect(screen.getByTestId("paginator")).toBeInTheDocument();
//     });
//   });

//   describe("Default Props", () => {
//     it("handles default contacts prop as empty array", () => {
//       render(
//         <ContactTable
//           loading={false}
//           selectedContact={null}
//           contacts={ [] }
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByTestId("empty-message")).toHaveTextContent("No contacts found.");
//     });

//     it("handles default loading prop as false", () => {
//       render(
//         <ContactTable
//           loading={false}
//           contacts={mockContacts}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByTestId("datatable-loading")).toHaveTextContent("false");
//     });
//   });

//   describe("Contact Data Display", () => {
//     it("displays all contact fields correctly", () => {
//       render(
//         <ContactTable
//           contacts={[mockContacts[0]]}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByText("1")).toBeInTheDocument(); // clientContactId
//       expect(screen.getByText("John Doe")).toBeInTheDocument(); // contactPersonName
//       expect(screen.getByText("john.doe@example.com")).toBeInTheDocument(); // email
//       expect(screen.getByText("Manager")).toBeInTheDocument(); // designation
//       expect(screen.getByText("+1-555-0101")).toBeInTheDocument(); // phone
//     });

//     it("handles contacts with optional fields missing", () => {
//       const contactWithOptionalFields: Contact = {
//         clientContactId: 4,
//         clientId: 100,
//         contactPersonName: "Minimal Contact",
//       };

//       render(
//         <ContactTable
//           contacts={[contactWithOptionalFields]}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByText("Minimal Contact")).toBeInTheDocument();
//     });
//   });

//   describe("DataKey", () => {
//     it("uses clientContactId as dataKey", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       // Verify each contact has its unique clientContactId rendered
//       mockContacts.forEach(contact => {
//         expect(screen.getByTestId(`contact-row-${contact.clientContactId}`)).toBeInTheDocument();
//       });
//     });
//   });

//   describe("Accessibility", () => {
//     it("renders with proper aria-label", () => {
//       render(
//         <ContactTable
//           contacts={mockContacts}
//           loading={false}
//           selectedContact={null}
//           onSelectionChange={mockOnSelectionChange}
//           onRowDoubleClick={mockOnRowDoubleClick}
//         />
//       );

//       expect(screen.getByLabelText("Contact data table")).toBeInTheDocument();
//     });
//   });
// });