const RememberPasswordCard = ({ onClose }) => (
  <div className="card mb-4 shadow-sm mx-lg-6 mx-md-4" >
    <div className="card-body ">
      <h5>Verifier votre compte</h5>
      <p>
       verifier votre adresse email pour recevoir les notification directement dans votre boite mail
      </p>
      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-primary" onClick={onClose}>OK</button>
        <button className="btn btn-outline-secondary" onClick={onClose}>Plus tard</button>
      </div>
    </div>
  </div>
);

export default RememberPasswordCard;
