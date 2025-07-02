const BioAndSpecialty = ({ bio, specialties, stats }) => {
  return (
    <div className="row">
      <div className="col-md-8">
        <div className="card">
          <div className="card-body">
            <h5>Bio</h5>
            <p>{bio ? bio : <span className="text-muted">Aucune bio renseignée.</span>}</p>
            <hr />
            <h5>Spécialités</h5>
            <div className="m-t-20">
              {Array.isArray(specialties) && specialties.length > 0 ? (
                specialties.map((specialty, index) => (
                  <span
                    key={specialty+'-'+index}
                    className="badge badge-pill badge-default font-weight-normal m-r-10 m-b-10"
                  >
                    {specialty}
                  </span>
                ))
              ) : (
                <span className="text-muted">Aucune spécialité renseignée.</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card">
          <div className="card-body d-flex flex-column justify-content-center align-items-center h-100">
            <h6 className="mb-4 font-weight-bold">Statistiques</h6>
            <div className="row w-100">
              <div className="col-6 stat-item text-center mb-4">

                <span className="d-block font-weight-bold" style={{ fontSize: 22 }}>{stats?.Amis ?? 0}<span className="anticon anticon-smile text-primary ml-1" style={{ fontSize: 22 }}></span></span>
                <small className="text-muted">Nombre d'amis</small>
              </div>
              <div className="col-6 stat-item text-center mb-4">

                <span className="d-block font-weight-bold" style={{ fontSize: 22 }}>{stats?.likes ?? 0}<span className="anticon anticon-heart text-danger ml-1" style={{ fontSize: 22 }}></span> </span>
                <small className="text-muted"> Likes</small>
              </div>
              <div className="col-6 stat-item text-center">

                <span className="d-block font-weight-bold" style={{ fontSize: 22 }}>{stats?.bookmarks ?? 0} <span className="anticon anticon-star text-warning ml-1" style={{ fontSize: 22 }}></span></span>
                <small className="text-muted">Mises en favoris</small>
              </div>
              <div className="col-6 stat-item text-center">

                <span className="d-block font-weight-bold" style={{ fontSize: 22 }}>{stats?.shares ?? 0} <span className="anticon anticon-share-alt text-info ml-1" style={{ fontSize: 22 }}></span></span>
                <small className="text-muted">Partages</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioAndSpecialty;