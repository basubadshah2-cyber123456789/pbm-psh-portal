'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, UserRound } from 'lucide-react';

export function ProfessionalProfilePhoto() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/pbm/career/profile-photo?metadata=1')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load your profile photo.');
        if (!cancelled) setHasPhoto(Boolean(result.hasProfilePhoto));
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load your profile photo.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadPhoto = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setSuccess('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Choose an image no larger than 4 MB.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/pbm/career/profile-photo', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save your profile photo.');
      setHasPhoto(true);
      setPhotoVersion(Date.now());
      setSuccess('Profile photo saved.');
    } catch (uploadError: unknown) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to save your profile photo.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <section className="mb-6 rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-emerald-100 bg-emerald-50 text-emerald-700">
          {hasPhoto ? (
            <img
              key={photoVersion}
              src={`/api/pbm/career/profile-photo?version=${photoVersion}`}
              alt="Your profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound className="h-10 w-10" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-900">Profile Photo</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Add a clear photo so your personal education and professional profile is easy to identify. JPEG, PNG, or WebP; maximum 4 MB.
          </p>
          {error && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{error}</p>}
          {success && <p role="status" className="mt-2 text-sm font-medium text-emerald-700">{success}</p>}
        </div>
        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="sr-only"
            aria-label="Choose a profile photo"
            onChange={(event) => void uploadPhoto(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading || uploading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            <Camera className="h-4 w-4" />
            {loading ? 'Loading…' : uploading ? 'Uploading…' : hasPhoto ? 'Change Photo' : 'Upload Photo'}
          </button>
        </div>
      </div>
    </section>
  );
}
