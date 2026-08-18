'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { uploadFormSchema, type UploadFormValues } from '../schemas';
import { requestUpload, confirmUpload } from '../actions';
import { documentsQueryKey } from '../hooks/use-documents';
import { Button } from '@/components/ui/button';

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
      className="rounded-lg border border-dashed border-border bg-surface p-6"
    >
      <label htmlFor="pdf-upload" className="block text-sm font-medium text-text">
        Upload a PDF
      </label>
      <input
        key={inputKey}
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        disabled={isBusy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            setValue('file', file, { shouldValidate: true });
          }
        }}
        className="mt-2 block w-full text-sm text-text-muted file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      />
      {errors.file && <p className="mt-2 text-sm text-danger">{errors.file.message}</p>}
      {errorMessage && <p className="mt-2 text-sm text-danger">{errorMessage}</p>}
      <div className="mt-4">
        <Button type="submit" disabled={isBusy}>
          {state === 'uploading' && 'Uploading…'}
          {state === 'confirming' && 'Processing…'}
          {(state === 'idle' || state === 'error') && 'Upload'}
        </Button>
      </div>
    </form>
  );
}
