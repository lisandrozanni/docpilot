import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadDropzone } from './upload-dropzone';
import * as actions from '../actions';

vi.mock('../actions', () => ({
  requestUpload: vi.fn(),
  confirmUpload: vi.fn(),
}));

function renderWithQueryClient() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <UploadDropzone />
    </QueryClientProvider>,
  );
}

function pdfFile(name = 'report.pdf', sizeBytes = 1024) {
  const file = new File(['%PDF-1.4 fake content'], name, { type: 'application/pdf' });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

describe('UploadDropzone', () => {
  beforeEach(() => {
    vi.mocked(actions.requestUpload).mockReset();
    vi.mocked(actions.confirmUpload).mockReset();
    vi.unstubAllGlobals();
  });

  // The <input accept="application/pdf"> means a real browser's file picker
  // (and userEvent.upload, which emulates that behavior) never lets a
  // non-PDF file reach onChange in the first place — the schema's content
  // type refine is defense-in-depth for a path this component can't trigger
  // via file selection. It's still exercised directly in schemas.test.ts and
  // re-enforced server-side (Server Action, then apps/api).

  it('rejects a file over the size limit, without calling requestUpload', async () => {
    const user = userEvent.setup();
    renderWithQueryClient();

    const input = screen.getByLabelText('Upload a PDF');
    await user.upload(input, pdfFile('big.pdf', 11 * 1024 * 1024));
    await user.click(screen.getByRole('button', { name: 'Upload' }));

    expect(await screen.findByText('File must be 10MB or smaller')).toBeInTheDocument();
    expect(actions.requestUpload).not.toHaveBeenCalled();
  });

  it('runs requestUpload -> PUT to S3 -> confirmUpload for a valid PDF', async () => {
    const user = userEvent.setup();
    vi.mocked(actions.requestUpload).mockResolvedValue({
      documentId: 'doc-1',
      uploadUrl: 'https://s3.example.com/upload',
    });
    vi.mocked(actions.confirmUpload).mockResolvedValue(undefined);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    renderWithQueryClient();

    const input = screen.getByLabelText('Upload a PDF');
    await user.upload(input, pdfFile());
    await user.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => expect(actions.confirmUpload).toHaveBeenCalledWith('doc-1'));

    expect(actions.requestUpload).toHaveBeenCalledWith({
      filename: 'report.pdf',
      sizeBytes: 1024,
      contentType: 'application/pdf',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://s3.example.com/upload',
      expect.objectContaining({ method: 'PUT' }),
    );
    expect(screen.getByRole('button', { name: 'Upload' })).not.toBeDisabled();
  });

  it('shows an error and does not call confirmUpload when the S3 PUT fails', async () => {
    const user = userEvent.setup();
    vi.mocked(actions.requestUpload).mockResolvedValue({
      documentId: 'doc-1',
      uploadUrl: 'https://s3.example.com/upload',
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    renderWithQueryClient();

    const input = screen.getByLabelText('Upload a PDF');
    await user.upload(input, pdfFile());
    await user.click(screen.getByRole('button', { name: 'Upload' }));

    expect(await screen.findByText('Upload to storage failed')).toBeInTheDocument();
    expect(actions.confirmUpload).not.toHaveBeenCalled();
  });
});
