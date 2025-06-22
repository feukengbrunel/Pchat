import logo from "../assets/images/logo/logo.png";
import loginImage from "../assets/images/others/login-2.png";
import Footer from "../components/footer";

export default function AuthLayout({ children, title, subtitle}) {
  return (
    <div className="app">
      <div className="container-fluid">
        <div className="d-flex full-height p-v-15 flex-column justify-content-between">
          {/* Header */}
          <div className="d-none d-md-flex p-h-40">
            <img src={logo} alt="Logo" style={{ height: "40px" }} />
          </div>

          {/* Main Content */}
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-5">
                <div className="card">
                  <div className="card-body">
                    <h2 className="m-t-20">{title}</h2>
                    <p className="m-b-30">{subtitle}</p>
                    {children}
                  </div>
                </div>
              </div>

              {/* Illustration */}
              <div className="offset-md-1 col-md-6 d-none d-md-block">
                <img
                  className="img-fluid"
                  src={loginImage}
                  alt="Illustration connexion"
                />
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}

