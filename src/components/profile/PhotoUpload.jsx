import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Avatar from '../ui/Avatar';
import { photoService } from '../../services/photoService';
import { useAuth } from '../../hooks/useAuth';

/**
 * PhotoUpload — Drag-and-drop or click-to-upload photo component.
 * Handles single and multiple uploads.
 */
export default function PhotoUpload({ onUploaded, disabled = false }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState(null);

  const processFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed (JPEG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const result = await photoService.uploadPhoto(user.id, file, false);
      toast.success('Photo uploaded successfully');
      onUploaded?.(result);
      setPreview(null);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  return (
    <div
      className={`photo-upload-zone ${dragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload photo"
      onKeyDown={(e) => e.key === 'Enter' && !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => processFile(e.target.files[0])}
        disabled={disabled}
      />

      {uploading ? (
        <div className="upload-uploading">
          {preview && <img src={preview} alt="Uploading preview" className="upload-preview" />}
          <div className="upload-overlay">
            <Spinner size="md" />
            <p>Uploading...</p>
          </div>
        </div>
      ) : (
        <div className="upload-placeholder">
          <div className="upload-icon">📸</div>
          <p className="upload-text">
            {dragging ? 'Drop to upload' : 'Click or drag photo here'}
          </p>
          <p className="upload-hint">JPEG, PNG, WebP • Max 5MB</p>
        </div>
      )}
    </div>
  );
}
