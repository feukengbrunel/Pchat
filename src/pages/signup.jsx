import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { GoogleButton } from "../components/AuthButton";
import { toast } from "react-toastify";
import logo from "../assets/images/logo/logo.png";
import signupImage from "../assets/images/others/sign-up-2.png";
import Footer from "../components/footer";
import { getAuthErrorMessage } from "../utils/AuthError";

export function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { signUpWithEmail, loginWithGoogle, handleGoogleSignup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must accept the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signUpWithEmail(formData.email, formData.password, formData.username);
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSign = async () => {
    try {
      setLoading(true);
      await handleGoogleSignup();
      toast.success("Google signup successful!");
      navigate("/users");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Header */}
      <header className="py-3 px-4 bg-white border-bottom">
        <div className="container">
          <img src={logo} alt="Logo" style={{ height: "40px" }} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1 d-flex align-items-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-md-12">
              <div className="card shadow-sm border-0">
                <div className="row g-0">
                  {/* Left Side - Image (hidden on mobile) */}
                  <div className="col-md-6 d-none d-md-flex align-items-center bg-light">
                    <img 
                      className="img-fluid p-4" 
                      src={signupImage} 
                      alt="Signup illustration" 
                      
                    />
                  </div>
                  
                  {/* Right Side - Form */}
                  <div className="col-md-6">
                    <div className="card-body p-4 p-lg-5">
                     
                      <h5 className="text-center  mb-4">Sign In</h5>
                      <p className="text-center text-muted mb-4">Enter your credential to get access</p>
                      
                      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                        {/* Username Field */}
                        <div className="mb-3">
                          <label htmlFor="username" className="form-label">Username</label>
                          <input
                            type="text"
                            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            required
                          />
                          {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                        </div>

                        {/* Email Field */}
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">Email</label>
                          <input
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            required
                          />
                          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>

                        {/* Password Field */}
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">Password</label>
                          <input
                            type="password"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                          />
                          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="mb-3">
                          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                          <input
                            type="password"
                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            required
                          />
                          {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="mb-4 form-check">
                          <input
                            className={`form-check-input ${errors.agreeTerms ? 'is-invalid' : ''}`}
                            type="checkbox"
                            id="agreeTerms"
                            name="agreeTerms"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="agreeTerms">
                            I have read the agreement
                          </label>
                          {errors.agreeTerms && <div className="invalid-feedback d-block">{errors.agreeTerms}</div>}
                        </div>

                        {/* Submit Button */}
                        <div className="d-grid d-flex mb-3 justify-content-end">
                          <button
                            className="btn btn-primary btn-lg"
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? 'Signing Up...' : 'Sign In'}
                          </button>
                        </div>


                        {/* Google Signup Button */}
                        <div className="d-grid mb-3">
                          <GoogleButton 
                            onClick={handleGoogleSign} 
                            loading={loading}
                            text="Continue with Google"
                          />
                        </div>

                        {/* Login Link */}
                        <div className="text-center">
                          <p className="mb-0">
                            Already have an account?{' '}
                            <Link to="/login" className="text-decoration-none">Login</Link>
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

      {/* Footer */}
      <Footer />

      {/* Toast Container */}
    </div>
  );
}

//code by sukali