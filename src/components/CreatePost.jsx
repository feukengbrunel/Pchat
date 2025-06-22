import { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { v4 as uuidv4 } from 'uuid';
import { Image } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Avatar from 'react-avatar';

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CreatePost = ({ onPost }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { logout, currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  // Récupération des infos utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null); //  ligne pour éviter l'erreur si pas connecté
      }
    };
    fetchUserData();
  }, [currentUser]);
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      [{ 'color': [] }],
      ['clean']
    ],
  };

  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link',
    'color'
  ];

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    // Vérifications
    if (files.length === 0) return;
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Vous ne pouvez ajouter que ${MAX_IMAGES} images maximum`);
      return;
    }

    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setError(`Certains fichiers dépassent la taille maximale de 5MB`);
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          // Générer un nom de fichier unique
          const fileName = `${uuidv4()}-${file.name}`;
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'EchatApp');
          formData.append('public_id', fileName);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/dmz5oxfks/image/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error('Échec du téléchargement');
          }

          const data = await response.json();
          return {
            url: data.secure_url,
            id: data.public_id,
            width: data.width,
            height: data.height
          };
        })
      );

      setImages([...images, ...uploadedImages]);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      setError("Une erreur est survenue lors du téléchargement des images");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) {
      setError("Veuillez ajouter du texte ou des images");
      return;
    }

    try {
      await onPost({
        content: content.trim(),
        images: images.map(img => img.url)
      });

      // Réinitialiser après succès
      setContent('');
      setImages([]);
      setIsExpanded(false);
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      setError("Une erreur est survenue lors de la publication");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={`card shadow-sm mb-3 ${isExpanded ? 'border-primary' : ''}`}>
      <div className="card-body p-3">
        <form onSubmit={handleSubmit}>
          <div className="d-flex align-items-center mb-2">
            <div className="avatar avatar-image mr-2" style={{ width: "40px", height: "40px" }}>
              {userData?.photoURL ? (
                <img
                  src={userData?.photoURL || "/assets/images/avatars/thumb-3.jpg"}
                  alt="Avatar"
                  className="avatar-img rounded-circle"
                />
              ) :
                (
                  <Avatar
                    name={userData?.username || userData?.displayName || currentUser?.displayName || currentUser?.email || "Utilisateur"}
                    size="36"
                    round
                    className="border"
                  />
                )}
            </div>
            <button
              type="button"
              className="form-control text-start ps-3 bg-light border-0 rounded-pill"
              onClick={() => setIsExpanded(true)}
              style={{ height: '40px', cursor: 'pointer' }}
            >
              Quoi de neuf ? {userData?.username || userData?.displayName || userData?.email || 'Utilisateur'}
            </button>
          </div>

          {isExpanded && (
            <>
              {/* Zone d'édition de texte */}
              <div className="mb-3" style={{ border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  placeholder="Exprimez-vous..."
                  style={{
                    minHeight: '120px',
                    border: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Prévisualisation des images */}
              {images.length > 0 && (
                <div className="mb-3">
                  <div className="row g-2">
                    {images.map((img) => (
                      <div key={img.id} className="col-6 col-md-3 position-relative">
                        <div className="ratio ratio-1x1">
                          <Image
                            src={img.url}
                            alt={`Preview ${img.id}`}
                            className="rounded"
                            fluid
                            style={{
                              objectFit: 'cover',
                              width: '100%',
                              height: '100%'
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                          onClick={() => removeImage(img.id)}
                          style={{ width: '24px', height: '24px', padding: 0 }}
                        >
                          <i className="anticon anticon-close" style={{ fontSize: '12px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Barre d'outils */}
              <div className="d-flex justify-content-between align-items-center pt-2">
                <div className="d-flex gap-2 align-items-center">
                  <button
                    type="button"
                    className="btn btn-light btn-sm d-flex align-items-center"
                    onClick={triggerFileInput}
                    disabled={isUploading || images.length >= MAX_IMAGES}
                  >
                    <i className="anticon anticon-picture me-1" />
                    <span className="d-none d-md-inline">Média</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isUploading || images.length >= MAX_IMAGES}
                      style={{ display: 'none' }}
                    />
                  </button>

                  {isUploading && (
                    <div className="progress" style={{ width: '100px', height: '6px' }}>
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}

                  {images.length > 0 && (
                    <small className="text-muted">
                      {images.length}/{MAX_IMAGES} images
                    </small>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setContent('');
                      setImages([]);
                      setIsExpanded(false);
                      setError(null);
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-3"
                    disabled={(!content.trim() && images.length === 0) || isUploading}
                  >
                    {isUploading ? 'Publication...' : 'Publier'}
                  </button>
                </div>
              </div>

              {/* Affichage des erreurs */}
              {error && (
                <div className="alert alert-danger mt-3 mb-0 py-2">
                  <small>{error}</small>
                </div>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePost;