import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { Nav } from "react-bootstrap";
import { Collapse } from "react-bootstrap";

export function HelpModal({ show, onClose }) {
  const [activeSection, setActiveSection] = useState("guide");
  const [openFaq, setOpenFaq] = useState({
    creation: false,
    connexion: false,
    suppression: false
  });

  if (!show) return null;

  const toggleFaq = (faqKey) => {
    setOpenFaq(prev => ({ ...prev, [faqKey]: !prev[faqKey] }));
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-light">
            <h5 className="modal-title">
              <i className="anticon anticon-question-circle text-primary mr-2"></i>
              Centre d'aide MPC
            </h5>
            <button 
              type="button" 
              className="close" 
              onClick={onClose}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          
          <div className="modal-body p-0">
            {/* Navigation par onglets en haut */}
            <Nav variant="tabs" className="px-3 pt-2 custom-tabs" activeKey={activeSection}>
              <Nav.Item>
                <Nav.Link
                  eventKey="guide"
                  onClick={() => setActiveSection("guide")}
                  className="d-flex align-items-center"
                >
                  <i className="anticon anticon-book mr-2"></i>
                  Guide d'utilisation
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="contact"
                  onClick={() => setActiveSection("contact")}
                  className="d-flex align-items-center"
                >
                  <i className="anticon anticon-customer-service mr-2"></i>
                  Contact rapide
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="faq"
                  onClick={() => setActiveSection("faq")}
                  className="d-flex align-items-center"
                >
                  <i className="anticon anticon-question-circle mr-2"></i>
                  FAQ
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="privacy"
                  onClick={() => setActiveSection("privacy")}
                  className="d-flex align-items-center"
                >
                  <i className="anticon anticon-safety mr-2"></i>
                  Confidentialité
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Contenu des onglets */}
            <div className="tab-content p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Guide d'utilisation */}
              {activeSection === "guide" && (
                <div>
                  <h5 className="mb-4">Guide d'utilisation</h5>
                  <div className="mb-4">
                    <h6><i className="anticon anticon-info-circle mr-2"></i> Fonctionnalités principales</h6>
                    <ul className="list-unstyled">
                      <li className="mb-2"><i className="anticon anticon-edit mr-2 text-primary"></i> <strong>Publications</strong> - Créez et partagez du contenu avec votre réseau</li>
                      <li className="mb-2"><i className="anticon anticon-team mr-2 text-primary"></i> <strong>Réseau</strong> - Connectez-vous avec d'autres utilisateurs</li>
                      <li className="mb-2"><i className="anticon anticon-message mr-2 text-primary"></i> <strong>Messagerie</strong> Envoyez des messages en temps reel</li>
                      <li className="mb-2"><i className="anticon anticon-bell mr-2 text-primary"></i> <strong>Notifications</strong> - Restez informé des activités</li>
                      <li className="mb-2"><i className="anticon anticon-setting mr-2 text-primary"></i> <strong>Paramètres</strong> - Personnalisez votre expérience</li>
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h6><i className="anticon anticon-safety mr-2"></i> Bonnes pratiques</h6>
                    <div className="alert alert-light">
                      <ul className="mb-0">
                        <li>Utilisez un mot de passe robuste et unique</li>
                        <li>Vérifiez régulièrement vos paramètres de confidentialité</li>
                        <li>Signalez tout contenu inapproprié</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact rapide */}
              {activeSection === "contact" && (
                <div>
                  <h5 className="mb-4">Contactez notre équipe</h5>
                  
                  <div className="card mb-4">
                    <div className="card-body">
                      <h6><i className="anticon anticon-phone mr-2"></i> Assistance téléphonique</h6>
                      <div className="d-flex flex-column mt-3">
                        <a href="tel:693049304" className="btn btn-outline-primary mb-2 text-left">
                          <i className="anticon anticon-phone mr-2"></i> 693 049 304 (Support technique)
                        </a>
                        <a href="tel:620976643" className="btn btn-outline-primary mb-2 text-left">
                          <i className="anticon anticon-phone mr-2"></i> 620 976 643 (Service commercial)
                        </a>
                        <a href="tel:673236960" className="btn btn-outline-primary text-left">
                          <i className="anticon anticon-phone mr-2"></i> 673 236 960 (Urgences)
                        </a>
                      </div>
                      <p className="mt-3 mb-0 text-muted small">
                        <i className="anticon anticon-clock-circle mr-1"></i> Disponibilité: Lundi-Vendredi 8h-19h, Samedi 9h-13h
                      </p>
                    </div>
                  </div>
                  
                  <div className="card">
                    <div className="card-body">
                      <h6><i className="anticon anticon-mail mr-2"></i> Contact par email</h6>
                      <div className="mt-3">
                        <a href="mailto:support@minireseau.com" className="btn btn-outline-secondary mb-2">
                          <i className="anticon anticon-mail mr-2"></i>feukengbrunel@gmail.com
                        </a>
                        <p className="text-muted small mb-0">Réponse garantie sous 24h ouvrées</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ */}
              {activeSection === "faq" && (
                <div>
                  <h5 className="mb-4">Foire aux questions</h5>
                  
                  <div className="faq-list">
                    {/* Question 1 */}
                    <div className="card mb-2">
                      <div className="card-header">
                        <button
                          className="btn btn-link btn-block text-left d-flex justify-content-between align-items-center"
                          onClick={() => toggleFaq("creation")}
                          aria-expanded={openFaq.creation}
                        >
                          <span><i className="anticon anticon-user-add mr-2"></i> Création de compte</span>
                          <i className={`anticon ${openFaq.creation ? 'anticon-up' : 'anticon-down'}`}></i>
                        </button>
                      </div>
                      <Collapse in={openFaq.creation}>
                        <div className="card-body">
                          <p>Pour créer un compte :</p>
                          <ol>
                            <li>Cliquez sur "S'inscrire" depuis la page d'accueil</li>
                            <li>Remplissez le formulaire avec vos informations</li>
                            <li>Validez votre adresse email via le lien reçu</li>
                            <li>Complétez votre profil</li>
                          </ol>
                          <p className="text-muted small">
                            <i className="anticon anticon-info-circle mr-1"></i> Un mot de passe doit contenir au moins 8 caractères dont une majuscule et un chiffre.
                          </p>
                        </div>
                      </Collapse>
                    </div>
                    
                    {/* Question 2 */}
                    <div className="card mb-2">
                      <div className="card-header">
                        <button
                          className="btn btn-link btn-block text-left d-flex justify-content-between align-items-center"
                          onClick={() => toggleFaq("connexion")}
                          aria-expanded={openFaq.connexion}
                        >
                          <span><i className="anticon anticon-lock mr-2"></i> Problèmes de connexion</span>
                          <i className={`anticon ${openFaq.connexion ? 'anticon-up' : 'anticon-down'}`}></i>
                        </button>
                      </div>
                      <Collapse in={openFaq.connexion}>
                        <div className="card-body">
                          <p>Si vous ne parvenez pas à vous connecter :</p>
                          <ul>
                            <li>Vérifiez que votre email est correct</li>
                            <li>Utilisez la fonction "Mot de passe oublié" si nécessaire</li>
                            <li>Videz le cache de votre navigateur</li>
                            <li>Essayez avec un autre navigateur</li>
                          </ul>
                          <button className="btn btn-sm btn-link" onClick={() => setActiveSection('contact')}>
                            <i className="anticon anticon-customer-service mr-1"></i> Contacter le support
                          </button>
                        </div>
                      </Collapse>
                    </div>
                    
                    {/* Question 3 */}
                    <div className="card">
                      <div className="card-header">
                        <button
                          className="btn btn-link btn-block text-left d-flex justify-content-between align-items-center"
                          onClick={() => toggleFaq("suppression")}
                          aria-expanded={openFaq.suppression}
                        >
                          <span><i className="anticon anticon-delete mr-2"></i> Gestion du compte</span>
                          <i className={`anticon ${openFaq.suppression ? 'anticon-up' : 'anticon-down'}`}></i>
                        </button>
                      </div>
                      <Collapse in={openFaq.suppression}>
                        <div className="card-body">
                          <h6>Suppression de compte :</h6>
                          <p>Pour supprimer définitivement votre compte :</p>
                          <ol>
                            <li>Allez dans "Paramètres du compte"</li>
                            <li>Sélectionnez "Confidentialité et sécurité"</li>
                            <li>Cliquez sur "Supprimer mon compte"</li>
                            <li>Confirmez votre mot de passe</li>
                          </ol>
                          <div className="alert alert-warning mt-3">
                            <i className="anticon anticon-warning mr-2"></i>
                            Cette action est irréversible et supprimera toutes vos données.
                          </div>
                        </div>
                      </Collapse>
                    </div>
                  </div>
                </div>
              )}

              {/* Confidentialité */}
              {activeSection === "privacy" && (
                <div>
                  <h5 className="mb-4">Politique de confidentialité</h5>
                  
                  <div className="card mb-4">
                    <div className="card-body">
                      <h6><i className="anticon anticon-shield mr-2"></i> Protection des données</h6>
                      <p>Nous nous engageons à protéger vos données personnelles conformément au RGPD.</p>
                      
                      <h6 className="mt-4"><i className="anticon anticon-eye mr-2"></i> Visibilité</h6>
                      <p>Vous pouvez contrôler la visibilité de :</p>
                      <ul>
                        <li>Vos publications</li>
                        <li>Votre profil</li>
                        <li>Vos informations personnelles</li>
                      </ul>
                      
                      <h6 className="mt-4"><i className="anticon anticon-download mr-2"></i> Export des données</h6>
                      <p>Vous pouvez demander une copie de toutes vos données depuis les paramètres du compte.</p>
                      
                      <button className="btn btn-sm btn-outline-primary mt-2">
                        <i className="anticon anticon-file-text mr-1"></i> Voir la politique complète
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="modal-footer bg-light">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              <i className="anticon anticon-close mr-1"></i> Fermer
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => setActiveSection('contact')}
            >
              <i className="anticon anticon-customer-service mr-1"></i> Contact rapide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}