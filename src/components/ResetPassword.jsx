import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { handleAuthError } from "../utils/AuthError";

export function ForgotPasswordModal({ show, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
      onClose();
    } catch (err) {
     if (err.code === "auth/user-not-found") {
    setError("Aucun compte n'est associé à cet email.");
    toast.error("Aucun compte n'est associé à cet email.");
  } else {
    setError(handleAuthError(err));
    toast.error(handleAuthError(err));
  }
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Reset Password</h5>
            <button 
              type="button" 
              className="close" 
              onClick={onClose}
              disabled={loading}
            >
              <span>×</span>
            </button>
          </div>
          <div className="modal-body">
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="alert alert-danger mt-3">
                {error}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-default" 
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ClipLoader size={20} color="#ffffff" />
              ) : (
                "Send Reset Link"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}