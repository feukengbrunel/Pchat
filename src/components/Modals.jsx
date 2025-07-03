import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

export function LegalModal({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>Mentions Légales</Modal.Title>
         <button 
              type="button" 
              className="close" 
              onClick={onHide}
            >
              <span aria-hidden="true">×</span>
            </button>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <h5>1. Éditeur du site</h5>
        <p>
          MPCchat est édité par [SUKALI x DTR], société [SA] au capital de [montant] fcfa, 
          immatriculée au RCS de [DOUALA] sous le numéro [620976643], dont le siège social est situé à [logbessou IUC].
        </p>
        
        <h5 className="mt-4">2. Directeur de publication</h5>
        <p>[ BRUNEL FEUKENG]</p>
        
        <h5 className="mt-4">3. Hébergement</h5>
        <p>
          Le site est hébergé par :<br />
          [vercel]<br />
          [vercel.com]<br />
          [693049304]
        </p>
        
        <h5 className="mt-4">4. Propriété intellectuelle</h5>
        <p>
          L'ensemble des éléments constitutifs du site (textes, images, vidéos, logos, etc.) 
          sont la propriété exclusive de MYPchat ou de ses partenaires et sont protégés par les lois 
          relatives à la propriété intellectuelle.
        </p>
        
        <h5 className="mt-4">5. Responsabilité</h5>
        <p>
          MYPchat ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation 
          du service ou de l'impossibilité d'y accéder.
        </p>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function PrivacyModal({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>Politique de Confidentialité</Modal.Title>
         <button 
              type="button" 
              className="close" 
              onClick={onHide}
            >
              <span aria-hidden="true">×</span>
            </button>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <h5>1. Collecte des données</h5>
        <p>
          Nous collectons les informations que vous nous fournissez lors de votre inscription et de votre utilisation 
          du service MPCchat, notamment :
        </p>
        <ul>
          <li>Vos informations de profil (nom, prénom, email)</li>
          <li>Vos données de connexion</li>
          <li>Vos interactions avec le service</li>
        </ul>
        
        <h5 className="mt-4">2. Utilisation des données</h5>
        <p>
          Vos données personnelles sont utilisées pour :
        </p>
        <ul className="list">
          <li className="list-item">Fournir et améliorer nos services</li>
          <li  className="list-item">Personnaliser votre expérience</li>
          <li  className="list-item">Assurer la sécurité du service</li>
          <li  className="list-item">Vous informer des mises à jour</li>
        </ul>
        
        <h5 className="mt-4">3. Protection des données</h5>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données 
          contre tout accès non autorisé, altération ou destruction.
        </p>
        
        <h5 className="mt-4">4. Vos droits</h5>
        <p>
          Conformément au RGPD, vous disposez des droits suivants :
        </p>
        <ul>
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement</li>
          <li>Droit à la portabilité</li>
          <li>Droit d'opposition</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à feukengbrunel555@gmail.com.
        </p>
        
        <h5 className="mt-4">5. Cookies</h5>
        <p>
          MPCchat utilise des cookies pour améliorer votre expérience. Vous pouvez contrôler les cookies 
          via les paramètres de votre navigateur.
        </p>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}