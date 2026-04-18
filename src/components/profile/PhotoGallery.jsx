import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import PhotoUpload from './PhotoUpload';
import { photoService } from '../../services/photoService';
import { useAuth } from '../../hooks/useAuth';

/**
 * PhotoGallery — Displays a user's photo gallery with watermarks.
 * Owner can set primary photo and delete photos.
 * Other users see photos based on photo_visibility + watermark.
 */
export default function PhotoGallery({ userId, isOwner = false }) {
  const { user } = useAuth();
  const [photos, setPhotos]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const raw = await photoService.getUserPhotos(userId);
      // Apply watermarks for non-owners
      if (!isOwner && user?.id) {
        const watermarked = await Promise.all(
          raw.map(async (photo) => {
            if (!photo.signed_url) return photo;
            try {
              const wUrl = await photoService.applyWatermark(photo.signed_url, user.id);
              return { ...photo, display_url: wUrl };
            } catch {
              return { ...photo, display_url: photo.signed_url };
            }
          })
        );
        setPhotos(watermarked);
      } else {
        setPhotos(raw.map((p) => ({ ...p, display_url: p.signed_url })));
      }
    } catch {
      toast.error('Could not load photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPhotos(); }, [userId]);

  const handleSetPrimary = async (photoId) => {
    try {
      await photoService.setPrimaryPhoto(photoId, userId);
      toast.success('Profile photo updated');
      loadPhotos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (photo) => {
    if (!window.confirm('Delete this photo?')) return;
    setDeleting(photo.id);
    try {
      await photoService.deletePhoto(photo.id, userId, photo.storage_path);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      toast.success('Photo deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="gallery-loading"><Spinner /></div>;

  return (
    <div className="photo-gallery">
      {photos.length === 0 ? (
        <div className="gallery-empty">
          <p>No photos uploaded yet</p>
          {isOwner && <PhotoUpload onUploaded={loadPhotos} />}
        </div>
      ) : (
        <>
          <div className="gallery-grid">
            {photos.map((photo) => (
              <div key={photo.id} className={`gallery-item ${photo.is_primary ? 'gallery-primary' : ''}`}>
                {photo.display_url ? (
                  <img
                    src={photo.display_url}
                    alt="Profile"
                    className="gallery-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="gallery-img-placeholder">🔒</div>
                )}
                {photo.is_primary && <span className="gallery-primary-badge">Primary</span>}
                {isOwner && (
                  <div className="gallery-overlay">
                    {!photo.is_primary && (
                      <Button size="sm" variant="ghost" onClick={() => handleSetPrimary(photo.id)}>
                        Set Primary
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      loading={deleting === photo.id}
                      onClick={() => handleDelete(photo)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isOwner && photos.length < 10 && (
              <div className="gallery-add">
                <PhotoUpload onUploaded={loadPhotos} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
