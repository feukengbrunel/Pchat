const RememberPasswordCard = ({ onClose }) => (
  <div className="card mb-4 shadow-sm mx-lg-6 mx-md-4" >
    <div className="card-body ">
      <h5>Se souvenir du mot de passe</h5>
      <p>
        Lors de votre prochaine connexion sur ce navigateur, il vous suffira de cliquer
        sur votre photo de profil au lieu de taper un mot de passe.
      </p>
      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-primary" onClick={onClose}>OK</button>
        <button className="btn btn-outline-secondary" onClick={onClose}>Plus tard</button>
      </div>
    </div>
  </div>
);

export default RememberPasswordCard;
