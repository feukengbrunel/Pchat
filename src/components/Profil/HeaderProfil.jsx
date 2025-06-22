import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import axios from 'axios';
import { useAuth } from "../../hooks/useAuth";
import Avatar from 'react-avatar';
const ProfilHeader = () => {
    const [userData, setUserData] = useState({
        displayName: 'FTB',
        username: 'sukali',
        profession: ' Developer, UI/UX Designer',
        email: 'Marshall123@gmail.com',
        phone: '+237-693049304',
        location: 'douala, bep',
        photoURL: 'assets/images/avatars/thumb-3.jpg',
        socialLinks: {
            facebook: '#',
            twitter: '#',
            behance: '#',
            dribbble: '#'
        }
    });
    const { logout, currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [specialtiesInput, setSpecialtiesInput] = useState('');
    const auth = getAuth();
    const user = auth.currentUser;
    const [profileComplete, setProfileComplete] = useState(false);
    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData({
                        ...data,
                        socialLinks: {
                            facebook: "#",
                            twitter: "#",
                            behance: "#",
                            dribbble: "#",
                            ...(data.socialLinks || {})
                        }
                    });
                    setFormData({
                        ...data,
                        socialLinks: {
                            facebook: "",
                            twitter: "#",
                            behance: "#",
                            dribbble: "#",
                            ...(data.socialLinks || {})
                        }
                    });

                    setProfileComplete(checkProfileComplete({
                        ...data,
                        specialties: Array.isArray(data.specialties) ? data.specialties : [],
                        socialLinks: {
                            facebook: "#",
                            twitter: "#",
                            behance: "#",
                            dribbble: "#",
                            ...(data.socialLinks || {})
                        }
                    }));
                    setSpecialtiesInput(Array.isArray(data.specialties) ? data.specialties.join(', ') : (data.specialties || ''));
                }
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "specialties") {
            setFormData(prev => ({
                ...prev,
                specialties: value.split(',').map(s => s.trim()).filter(Boolean)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, "users", user.uid), formData);
            setUserData(formData);
            // Fermer la modale avec jQuery (compatible avec Bootstrap)
            window.$('.modal').modal('hide');
        } catch (error) {
            console.error("Error updating document: ", error);
        }
        setProfileComplete(checkProfileComplete(formData));
        setShowModal(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'EchatApp');

        try {
            const response = await axios.post(
                'https://api.cloudinary.com/v1_1/dmz5oxfks/image/upload',
                formData
            );

            await updateDoc(doc(db, "users", user.uid), {
                photoURL: response.data.secure_url
            });

            setUserData(prev => ({ ...prev, photoURL: response.data.secure_url }));
            setFormData(prev => ({ ...prev, photoURL: response.data.secure_url }));
        } catch (error) {
            console.error('Erreur lors du téléchargement de la photo', error);
        } finally {
            setUploading(false);
        }
    };
    function checkProfileComplete(data) {
        return (
            data.displayName &&
            data.username &&
            data.profession &&
            data.email &&
            data.phone &&
            data.location &&
            data.photoURL &&
            data.bio &&
            Array.isArray(data.specialties) && data.specialties.length > 0 &&
            data.socialLinks &&
            data.socialLinks.facebook &&
            data.socialLinks.twitter &&
            data.socialLinks.behance &&
            data.socialLinks.dribbble
        );
    }


    return (
        <>
            <div className="card">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-7">
                            <div className="d-md-flex align-items-center">
                                <div className="text-center text-sm-left">
                                    <div className="avatar avatar-image position-relative avatar-wrapper mb-3" >

                                        {userData?.photoURL && userData.photoURL !== "" && userData.photoURL!=="assets/images/avatars/thumb-3.jpg"? (
                                            <img
                                                src={userData.photoURL}
                                                alt="Profile"
                                                className="profile-img"
                                                style={{
                                                    objectFit: 'cover',
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            />
                                        ) : (
                                            <Avatar
                                                name={userData?.username || userData?.displayName || currentUser?.displayName || currentUser?.email || "Utilisateur"}
                                                size="140"
                                                round
                                                className="border"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="text-center text-sm-left m-v-15 p-l-30">
                                    <h2 className="m-b-5">{userData.displayName}</h2>
                                    <p className="text-opacity font-size-13">@{userData.username}</p>
                                    <p className="text-dark m-b-20">{userData.profession} <span className={`ml-2 font-size-13 ${user ? 'text-success' : 'text-muted'}`}>
                                        {user ? 'En ligne' : 'Hors ligne'}
                                    </span></p>

                                    <div className="d-flex gap-2">
                                        <button className="btn btn-primary btn-tone">Contact</button>
                                        {user && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-tone"
                                                data-toggle="modal"
                                                data-target="#editProfileModal"
                                                onClick={() => setShowModal(true)}
                                            >
                                                Modifier
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div className="row">
                                <div className="d-md-block d-none border-left col-1"></div>
                                <div className="col">
                                    <ul className="list-unstyled m-t-10">
                                        <li className="row">
                                            <p className="col-sm-4 col-4 font-weight-semibold text-dark m-b-5">
                                                <i className="m-r-10 text-primary anticon anticon-mail"></i>
                                                <span>Email: </span>
                                            </p>
                                            <p className="col font-weight-semibold">{userData.email}</p>
                                        </li>
                                        <li className="row">
                                            <p className="col-sm-4 col-4 font-weight-semibold text-dark m-b-5">
                                                <i className="m-r-10 text-primary anticon anticon-phone"></i>
                                                <span>Phone: </span>
                                            </p>
                                            <p className="col font-weight-semibold">{userData.phone}</p>
                                        </li>
                                        <li className="row">
                                            <p className="col-sm-4 col-5 font-weight-semibold text-dark m-b-5">
                                                <i className="m-r-10 text-primary anticon anticon-compass"></i>
                                                <span>Location: </span>
                                            </p>
                                            <p className="col font-weight-semibold">{userData.location}</p>
                                        </li>
                                    </ul>
                                    <div className="d-flex font-size-22 m-t-15">
                                        <a href={userData.socialLinks.facebook} className="text-gray p-r-20">
                                            <i className="anticon anticon-facebook"></i>
                                        </a>
                                        <a href={userData.socialLinks.twitter} className="text-gray p-r-20">
                                            <i className="anticon anticon-twitter"></i>
                                        </a>
                                        <a href={userData.socialLinks.behance} className="text-gray p-r-20">
                                            <i className="anticon anticon-behance"></i>
                                        </a>
                                        <a href={userData.socialLinks.dribbble} className="text-gray p-r-20">
                                            <i className="anticon anticon-dribbble"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modale Bootstrap */}
            {showModal && (
                <div className="modal-backdrop show"></div>
            )}
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} id="editProfileModal" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg modal-dialog-scrollable" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title h4">Modifier le profil</h5>
                            <button type="button" className="close" data-dismiss="modal" onClick={() => setShowModal(false)}>
                                <i className="anticon anticon-close"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Photo de profil</label>
                                    <div className="d-flex  avatar-wrapper mb-3" style={{ height: '100px' }}>
                                          {userData?.photoURL && userData.photoURL !== "" && userData.photoURL!=="assets/images/avatars/thumb-3.jpg"? (
                                            <img
                                                src={userData.photoURL}
                                                alt="Profile"
                                                className="profile-img"
                                                style={{
                                                    objectFit: 'cover',
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            />
                                        ) : (
                                            <Avatar
                                                name={userData?.username || userData?.displayName || currentUser?.displayName || currentUser?.email || "Utilisateur"}
                                                size="140"
                                                round
                                                className="border"
                                            />
                                        )}
                                        <div>
                                            <input
                                                type="file"
                                                id="profileImage"
                                                onChange={handleImageUpload}
                                                className="d-none"
                                                accept="image/*"

                                            />
                                            <label
                                                htmlFor="profileImage"
                                                className="btn btn-outline-primary"
                                                disabled={uploading}
                                            >
                                                {uploading ? 'Téléchargement...' : 'Changer la photo'}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Nom complet</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="displayName"
                                        value={formData.displayName || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Nom d'utilisateur</label>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">@</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            value={formData.username || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Profession</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="profession"
                                        value={formData.profession || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Téléphone</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Localisation</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="location"
                                        value={formData.location || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Liens sociaux</label>
                                    <div className="row">
                                        <div className="col-md-6 mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="facebook"
                                                placeholder="Lien Facebook"
                                                value={formData.socialLinks?.facebook || ''}
                                                onChange={e =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="twitter"
                                                placeholder="Lien Twitter"
                                                value={formData.socialLinks?.twitter || ''}
                                                onChange={e =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="behance"
                                                placeholder="Lien Behance"
                                                value={formData.socialLinks?.behance || ''}
                                                onChange={e =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        socialLinks: { ...prev.socialLinks, behance: e.target.value }
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="dribbble"
                                                placeholder="Lien Dribbble"
                                                value={formData.socialLinks?.dribbble || ''}
                                                onChange={e =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        socialLinks: { ...prev.socialLinks, dribbble: e.target.value }
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Bio</label>
                                    <textarea
                                        className="form-control"
                                        name="bio"
                                        rows={3}
                                        value={formData.bio || ''}
                                        onChange={handleInputChange}
                                        placeholder="Votre bio..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Spécialités (séparées par une virgule)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="specialties"
                                        value={specialtiesInput}
                                        onChange={e => {
                                            setSpecialtiesInput(e.target.value);
                                            setFormData(prev => ({
                                                ...prev,
                                                specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                            }));
                                        }}
                                        placeholder="ex: React, UI/UX, Figma"
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        data-dismiss="modal"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={uploading}
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
           

 .avatar-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f1f1f1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  background: #fafbfc;
  display: block;
}

            .modal-backdrop.show {
                opacity: 0.5;
            }
            `}</style>
        </>
    );
};

export default ProfilHeader;