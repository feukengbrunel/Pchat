import React from 'react';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';

export function GoogleButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      type="button"
      className={`
        btn 
        btn-icon 
        btn-danger 
        btn-rounded 
        btn-tone
        ${loading ? "opacity-75" : ""}
      `}
      aria-label="Connexion avec Google"
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
         
        </>
      ) : (
        <FaGoogle className="anticon anticon-google" />
      )}
    </button>
  );
}

export function FacebookButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      type="button"
      className={`
        btn 
        btn-icon 
        btn-primary 
        btn-rounded 
        btn-tone
        ${loading ? "opacity-75" : ""}
      `}
      aria-label="Connexion avec Facebook"
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
        
        </>
      ) : (
        <FaFacebookF className="anticon anticon-facebook" />
      )}
    </button>
  );
}