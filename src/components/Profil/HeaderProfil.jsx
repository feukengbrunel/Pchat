import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import axios from 'axios';
import { useAuth } from "../../hooks/useAuth";
import Avatar from 'react-avatar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { ClipLoader } from 'react-spinners';
import { InputGroup } from 'react-bootstrap';

const ProfilHeader = () => {
    const [userData, setUserData] = useState({
        displayName: '',
        username: '',
        profession: '',
        email: '',
        phone: '',
        location: '',
        photoURL: '',
        bio: '',
        specialties: [],
        socialLinks: {
            facebook: '',
            twitter: '',
            behance: '',
            dribbble: ''
        }
    });

    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [specialtiesInput, setSpecialtiesInput] = useState('');
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(prev => ({
                        ...prev,
                        ...data,
                        socialLinks: {
                            ...prev.socialLinks,
                            ...(data.socialLinks || {})
                        }
                    }));
                    
                    setFormData({
                        ...data,
                        socialLinks: {
                            ...data.socialLinks || {}
                        }
                    });

                    setSpecialtiesInput(Array.isArray(data.specialties) ? 
                        data.specialties.join(', ') : 
                        (data.specialties || ''));
                }
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialLinkChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [name]: value
            }
        }));
    };

    const handleSpecialtiesChange = (e) => {
        const value = e.target.value;
        setSpecialtiesInput(value);
        setFormData(prev => ({
            ...prev,
            specialties: value.split(',').map(s => s.trim()).filter(Boolean)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, "users", user.uid), formData);
            setUserData(formData);
            setShowModal(false);
        } catch (error) {
            console.error("Error updating document: ", error);
        }
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

            const newPhotoURL = response.data.secure_url;
            
            await updateDoc(doc(db, "users", user.uid), {
                photoURL: newPhotoURL
            });

            setUserData(prev => ({ ...prev, photoURL: newPhotoURL }));
            setFormData(prev => ({ ...prev, photoURL: newPhotoURL }));
        } catch (error) {
            console.error('Erreur lors du téléchargement de la photo', error);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <ClipLoader color="#4a6cf7" size={50} />
            </div>
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
                                    <div className="avatar avatar-image position-relative avatar-wrapper mb-3">
                                        {userData?.photoURL ? (
                                            <img
                                                src={userData.photoURL}
                                                alt="Profile"
                                                className="profile-img"
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
                                    <p className="text-dark m-b-20">{userData.profession}</p>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-primary btn-tone">Contact</button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-tone"
                                            onClick={() => setShowModal(true)}
                                        >
                                            Modifier
                                        </button>
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
                                        {userData.socialLinks.facebook && (
                                            <a href={userData.socialLinks.facebook} className="text-gray p-r-20">
                                                <i className="anticon anticon-facebook"></i>
                                            </a>
                                        )}
                                        {userData.socialLinks.twitter && (
                                            <a href={userData.socialLinks.twitter} className="text-gray p-r-20">
                                                <i className="anticon anticon-twitter"></i>
                                            </a>
                                        )}
                                        {userData.socialLinks.behance && (
                                            <a href={userData.socialLinks.behance} className="text-gray p-r-20">
                                                <i className="anticon anticon-behance"></i>
                                            </a>
                                        )}
                                        {userData.socialLinks.dribbble && (
                                            <a href={userData.socialLinks.dribbble} className="text-gray p-r-20">
                                                <i className="anticon anticon-dribbble"></i>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal React Bootstrap */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Modifier le profil</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Photo de profil</Form.Label>
                            <div className="d-flex align-items-center mb-3">
                                <div className="avatar-wrapper me-3">
                                    {formData?.photoURL ? (
                                        <img
                                            src={formData.photoURL}
                                            alt="Profile"
                                            className="profile-img"
                                        />
                                    ) : (
                                        <Avatar
                                            name={formData?.username || formData?.displayName || "Utilisateur"}
                                            size="80"
                                            round
                                            className="border"
                                        />
                                    )}
                                </div>
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
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nom complet</Form.Label>
                            <Form.Control
                                type="text"
                                name="displayName"
                                value={formData.displayName || ''}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nom d'utilisateur</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>@</InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={formData.username || ''}
                                    onChange={handleInputChange}
                                />
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Profession</Form.Label>
                            <Form.Control
                                type="text"
                                name="profession"
                                value={formData.profession || ''}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email || ''}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Téléphone</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Localisation</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={formData.location || ''}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Bio</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="bio"
                                value={formData.bio || ''}
                                onChange={handleInputChange}
                                placeholder="Votre bio..."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Spécialités (séparées par une virgule)</Form.Label>
                            <Form.Control
                                type="text"
                                name="specialties"
                                value={specialtiesInput}
                                onChange={handleSpecialtiesChange}
                                placeholder="ex: React, UI/UX, Figma"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Liens sociaux</Form.Label>
                            <div className="row">
                                <div className="col-md-6 mb-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Lien Facebook"
                                        name="facebook"
                                        value={formData.socialLinks?.facebook || ''}
                                        onChange={handleSocialLinkChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Lien Twitter"
                                        name="twitter"
                                        value={formData.socialLinks?.twitter || ''}
                                        onChange={handleSocialLinkChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Lien Behance"
                                        name="behance"
                                        value={formData.socialLinks?.behance || ''}
                                        onChange={handleSocialLinkChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Lien Dribbble"
                                        name="dribbble"
                                        value={formData.socialLinks?.dribbble || ''}
                                        onChange={handleSocialLinkChange}
                                    />
                                </div>
                            </div>
                        </Form.Group>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Annuler
                            </Button>
                            <Button variant="primary" type="submit" disabled={uploading}>
                                Enregistrer
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

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
            `}</style>
        </>
    );
};

export default ProfilHeader;