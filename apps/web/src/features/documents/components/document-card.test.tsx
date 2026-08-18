import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DocumentCard, type DocumentCardData } from './document-card';

function makeDocument(overrides: Partial<DocumentCardData> = {}): DocumentCardData {
  return {
    id: '1',
    filename: 'report.pdf',
    status: 'ready',
    pageCount: 12,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('DocumentCard', () => {
  it('renders the filename and page count', () => {
    render(<DocumentCard document={makeDocument()} onDelete={() => {}} isDeleting={false} />);

    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('12 pages')).toBeInTheDocument();
  });

  it('shows a fallback when the page count is not known yet', () => {
    render(
      <DocumentCard
        document={makeDocument({ pageCount: null })}
        onDelete={() => {}}
        isDeleting={false}
      />,
    );

    expect(screen.getByText('Page count pending')).toBeInTheDocument();
  });

  it.each([
    ['pending', 'Pending'],
    ['processing', 'Processing'],
    ['ready', 'Ready'],
    ['failed', 'Failed'],
  ] as const)('renders the %s status as "%s"', (status, label) => {
    render(
      <DocumentCard document={makeDocument({ status })} onDelete={() => {}} isDeleting={false} />,
    );

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('calls onDelete when the delete button is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(<DocumentCard document={makeDocument()} onDelete={onDelete} isDeleting={false} />);
    await user.click(screen.getByRole('button', { name: 'Delete report.pdf' }));

    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('disables the delete button and shows a busy label while deleting', () => {
    render(<DocumentCard document={makeDocument()} onDelete={() => {}} isDeleting={true} />);

    const button = screen.getByRole('button', { name: 'Delete report.pdf' });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Deleting…');
  });
});
