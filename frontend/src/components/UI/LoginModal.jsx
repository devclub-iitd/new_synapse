// import React from 'react';
// import { X, User } from 'lucide-react';

// const LoginModal = ({ isOpen, onClose }) => {
//   if (!isOpen) return null;

//   const handleMicrosoftLogin = () => {
//     const CLIENT_ID = import.meta.env.VITE_MS_CLIENT_ID;
//     const REDIRECT_URI = import.meta.env.VITE_MS_REDIRECT_URI;
//     const TENANT_ID = "624d5c4b-45c5-4122-8cd0-44f0f84e945d";

//     const targetUrl =
//       `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize` +
//       `?client_id=${CLIENT_ID}` +
//       `&response_type=code` +
//       `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
//       `&response_mode=query` +
//       `&scope=User.Read`;

//     window.location.href = targetUrl;
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div
//         className="login-glass-container"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button className="close-modal-btn" onClick={onClose}>
//           <X size={24} />
//         </button>

//         {/* LEFT SIDE */}
//         <div className="login-brand-side">
//           <div className="brand-content">
//             <div className="synapse-logo">Synapse</div>
//             <h1>Welcome to Synapse</h1>
//             <p>Your complete event management software solution</p>
//           </div>
//         </div>

//         {/* RIGHT SIDE */}
//         <div className="login-form-side">
//           <div className="form-wrapper">
//             <h2 className="mb-4 fw-bold" style={{ color: 'var(--text-primary)' }}>Login</h2>

//             <div className="input-group-custom">
//               <label>
//                 <User size={16} /> Select Your Role
//               </label>
//               <select className="select-custom">
//                 <option>Student</option>
//               </select>
//             </div>

//             <div className="microsoft-btn-container">
//               <button
//                 className="btn-microsoft-login"
//                 onClick={handleMicrosoftLogin}
//               >
//                 Sign in with Microsoft
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginModal;

import React from 'react';
import { X } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleMicrosoftLogin = () => {
    const CLIENT_ID = import.meta.env.VITE_MS_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_MS_REDIRECT_URI;
    const TENANT_ID = import.meta.env.VITE_MS_TENANT_ID;

    const targetUrl =
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize` +
      `?client_id=${CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_mode=query` +
      `&scope=User.Read`;

    window.location.href = targetUrl;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="login-glass-container" onClick={e => e.stopPropagation()}>

        <button className="close-modal-btn" onClick={onClose}>
          <X size={24} />
        </button>

        {/* LEFT — branding */}
        <div className="login-brand-side">
          <div className="brand-content">
            <div className="synapse-logo">SYNAPSE</div>
            <h1>Welcome to Synapse</h1>
            <p>Your complete event management software solution</p>
          </div>
        </div>

        {/* RIGHT — login */}
        <div className="login-form-side">
          <div className="form-wrapper">
            <h2 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Sign In</h2>
            <p className="mb-5" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Use your IITD Microsoft account to continue
            </p>

            <button className="btn-microsoft-login" onClick={handleMicrosoftLogin}>
              {/* Microsoft logo SVG */}
              <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              Sign in with Microsoft
            </button>

            <p className="mt-4 text-center" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Only IITD accounts (@iitd.ac.in) are supported
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginModal;
