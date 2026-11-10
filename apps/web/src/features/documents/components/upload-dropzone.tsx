'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { uploadFormSchema, type UploadFormValues } from '../schemas';
import { requestUpload, confirmUpload } from '../actions';
import { documentsQueryKey } from '../hooks/use-documents';
import { Button } from '@/components/ui/button';
import { UploadIcon } from '@/components/ui/icons';

type UploadState = 'idle' | 'uploading' | 'confirming' | 'error';

export function UploadDropzone() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<UploadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
  });

  const onSubmit = handleSubmit(async ({ file }) => {
    setErrorMessage(null);
    setState('uploading');

    try {
      const { documentId, uploadUrl } = await requestUpload({
        filename: file.name,
        sizeBytes: file.size,
        contentType: 'application/pdf',
      });

      const putResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: file,
      });

      if (!putResponse.ok) {
        throw new Error('Upload to storage failed');
      }

      setState('confirming');
      await confirmUpload(documentId);

      await queryClient.invalidateQueries({ queryKey: documentsQueryKey });
      setState('idle');
      setInputKey((key) => key + 1);
    } catch (error) {
      setState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    }
  });

  const isBusy = state === 'uploading' || state === 'confirming';

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <UploadIcon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-semibold text-text">Add a document</h2>
          <p className="mt-0.5 text-xs text-text-muted">Choose a PDF up to 10 MB.</p>
        </div>
      </div>
      <label htmlFor="pdf-upload" className="sr-only">
        Upload a PDF
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          key={inputKey}
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          disabled={isBusy}
          aria-invalid={errors.file ? true : undefined}
          aria-describedby={errors.file ? 'pdf-upload-error' : undefined}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              setValue('file', file, { shouldValidate: true });
            }
          }}
          className="block h-11 min-w-0 w-full rounded-xl border border-dashed border-border bg-background p-1 text-xs text-text-muted file:mr-3 file:h-full file:cursor-pointer file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-0 file:text-xs file:font-semibold file:text-primary hover:file:bg-border disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button className="sm:shrink-0" type="submit" disabled={isBusy}>
          {state === 'uploading' && 'Uploading…'}
          {state === 'confirming' && 'Processing…'}
          {(state === 'idle' || state === 'error') && 'Upload'}
        </Button>
      </div>
      {errors.file && (
        <p id="pdf-upload-error" className="mt-2 text-sm text-danger">
          {errors.file.message}
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
