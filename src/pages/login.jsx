import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { GoogleButton, FacebookButton } from "../components/AuthButton";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import logo from "../assets/images/logo/logo.png";
import loginImage from "../assets/images/others/login-2.png";
import { handleAuthError } from "../utils/AuthError";
import { getAuthErrorMessage } from "../services/getAuthErrorMessage";
import Footer from "../components/footer";
import { ForgotPasswordModal } from "../components/ResetPassword";
export function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const {
    login,
    loginWithGoogle,
    loginWithFacebook,
    loading: authLoading,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [googleError, setGoogleError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const from = location.state?.from?.pathname || "/users";
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setActionLoading(true);
    try {
      await login(credentials.email, credentials.password);
      toast.success("Login successful!");
      setTimeout(() => navigate(from, { replace: true }), 800);
    } catch (err) {
      setError(getAuthErrorMessage(err));
toast.error(getAuthErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setActionLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Google login successful!");
      setTimeout(() => navigate(from, { replace: true }), 800);
    } catch (err) {
setError(getAuthErrorMessage(err));
toast.error(getAuthErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setActionLoading(true);
    try {
      await loginWithFacebook();
      toast.success("Facebook login successful!");
      navigate(from, { replace: true });
    } catch (err) {
setError(getAuthErrorMessage(err));
toast.error(getAuthErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Header */}
     <header className="py-3 px-4 bg-white border-none">
  <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100px" }}>
    <img src={logo} alt="Logo" style={{ height: "150px", maxWidth: "100%", objectFit: "contain" }} />
  </div>
</header>

      {/* Main Content */}
      <main className="flex-grow-1 bg-white d-flex align-items-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-md-10">
              <div className="card shadow-sm border-0">
                <div className="row g-0">
                  {/* Left Side - Image (hidden on mobile) */}
                  <div className="col-md-6 d-none d-md-flex align-items-center bg-light">
                    <img
                      className="img-fluid p-4"
                      src={loginImage}
                      alt="Login illustration"

                    />
                  </div>

                  {/* Right Side - Form */}
                  <div className="col-md-6">
                    <div className="card-body p-4 p-lg-5">
                     
                      <h5 className="text-center mb-4">Sign In</h5>
                      <p className="text-center text-muted mb-4">Enter your credential to get access</p>

                      {/* Error Message */}
                      {(error || googleError) && (
                        <div className="alert alert-danger" role="alert">
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>
                          {error || googleError}
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                        {/* Email Field */}
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            required
                            autoComplete="none"
                          />
                        </div>

                        {/* Password Field */}
                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center">
                            <label htmlFor="password" className="form-label">Password</label>
                            <Link
                              to="#"
                              className="text-decoration-none small"
                              onClick={(e) => {
                                e.preventDefault();
                                setShowForgotPassword(true);
                              }}
                            >
                              Forgot password?
                            </Link>
                          </div>
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                            autoComplete="none"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="d-grid d-flex justify-content-end mb-3">
                          <button
                            className="btn btn-primary btn-lg"
                            type="submit"
                            disabled={authLoading || actionLoading}
                          >
                            {authLoading || actionLoading ? (
                              <ClipLoader size={20} color="#ffffff" />
                            ) : (
                              "Sign In"
                            )}
                          </button>
                        </div>



                        {/* Social Login Buttons */}
                        <div className="d-grid gap-3 d-flex justify-content-start mb-3">
                          <GoogleButton
                            onClick={handleGoogleLogin}
                            loading={authLoading || actionLoading}
                          />
                          <FacebookButton
                            onClick={handleFacebookLogin}
                            loading={authLoading || actionLoading}
                          />
                        </div>

                        {/* Sign Up Link */}
                        <div className="text-center mt-4">
                          <p className="mb-0">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-decoration-none fw-bold">
                              Sign up
                            </Link>
                          </p>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  <ForgotPasswordModal 
        show={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
      {/* Footer */}
      <Footer />
    </div>
  );
}


