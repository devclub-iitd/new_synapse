// import { useState } from "react";
// import { FiUpload, FiEdit2 } from "react-icons/fi";
// import api from "../../api/axios";
// import toast from "react-hot-toast";

// export default function OrgBanner({ orgId, orgName, bannerUrl }) {

//   const [preview, setPreview] = useState(bannerUrl || null);
//   const [loading, setLoading] = useState(false);

//   const handleUpload = async (file) => {
//     const formData = new FormData();
//     formData.append("banner", file);

//     setLoading(true);

//     try {
//       const res = await api.post(`/org/${orgId}/banner`, formData);

//       const newUrl = res.data.banner_url;

//       setPreview(`${newUrl}?t=${Date.now()}`); // bust cache
//       toast.success("Banner updated");

//     } catch (err) {
//       toast.error("Upload failed");
//     }

//     setLoading(false);
//   };

//   const onFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     handleUpload(file);
//   };

//   return (
//     <div style={{ textAlign: "center", position: "relative" }}>
//       <label style={{ cursor: "pointer", position: "relative" }}>
//         <div
//           style={{
//             width: "130px",
//             height: "130px",
//             borderRadius: "50%",
//             overflow: "hidden",
//             border: "3px solid var(--border-primary)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background: "var(--bg-tertiary)",
//             position: "relative"
//           }}
//         >
//           {loading ? (
//             <div
//               style={{
//                 width: "30px",
//                 height: "30px",
//                 border: "4px solid #ccc",
//                 borderTop: "4px solid #333",
//                 borderRadius: "50%",
//                 animation: "spin 1s linear infinite"
//               }}
//             />
//           ) : preview ? (
//             <img
//               src={preview}
//               alt="banner"
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit: "cover"
//               }}
//             />
//           ) : (
//             <FiUpload size={32} color="#666" />
//           )}
//         </div>

//         {/* edit icon */}
//         {preview && !loading && (
//           <div
//             style={{
//               position: "absolute",
//               bottom: "5px",
//               right: "5px",
//               background: "#fff",
//               borderRadius: "50%",
//               padding: "6px",
//               boxShadow: "0 0 4px rgba(0,0,0,0.2)"
//             }}
//           >
//             <FiEdit2 size={14} />
//           </div>
//         )}

//         <input
//           type="file"
//           accept="image/png,image/jpeg,image/jpg"
//           style={{ display: "none" }}
//           onChange={onFileChange}
//         />
//       </label>

//       <style>
//         {`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//         `}
//       </style>
//     </div>
//   );
// }

import { useState } from "react";
import { FiUpload, FiEdit2, FiX } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function OrgBanner({ orgId, orgName, bannerUrl }) {

  const [preview, setPreview] = useState(bannerUrl || null);
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("banner", file);
    setLoading(true);
    setImgError(false); // reset error state on new upload

    try {
      const res = await api.post(`/org/${orgId}/banner`, formData);
      const newUrl = res.data.banner_url;
      setPreview(`${newUrl}?t=${Date.now()}`);
      toast.success("Banner updated");
    } catch (err) {
      toast.error("Upload failed");
    }

    setLoading(false);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately so user sees something right away
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setImgError(false);

    handleUpload(file);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    setImgError(false);
  };

  // Show image only if preview exists and no load error
  const showImage = preview && !imgError;

  // Fallback: initials avatar if no image
  const initials = orgName ? orgName.charAt(0).toUpperCase() : "?";

  return (
    <div style={{ textAlign: "center", position: "relative", display: "inline-block" }}>
      <label style={{ cursor: "pointer", position: "relative", display: "inline-block" }}>
        <div
          style={{
            width: "130px",
            height: "130px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid var(--border-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: showImage ? "transparent" : "var(--bg-tertiary)",
            position: "relative"
          }}
        >
          {loading ? (
            <div
              style={{
                width: "30px",
                height: "30px",
                border: "4px solid #ccc",
                borderTop: "4px solid #7c3aed",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}
            />
          ) : showImage ? (
            <img
              src={preview}
              alt="banner"
              onError={() => setImgError(true)}  // fallback on broken image
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          ) : (
            // Initials fallback instead of blank white circle
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              color: "#666"
            }}>
              <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                {initials}
              </span>
              <FiUpload size={16} color="#666" />
            </div>
          )}
        </div>

        {/* Edit icon — shows when image is displayed */}
        {showImage && !loading && (
          <div
            style={{
              position: "absolute",
              bottom: "5px",
              right: "5px",
              background: "#7c3aed",
              borderRadius: "50%",
              padding: "6px",
              boxShadow: "0 0 6px rgba(0,0,0,0.3)"
            }}
          >
            <FiEdit2 size={14} color="#fff" />
          </div>
        )}

        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          style={{ display: "none" }}
          onChange={onFileChange}
        />
      </label>

      {/* Remove button — outside the label so it doesn't trigger file picker */}
      {showImage && !loading && (
        <button
          onClick={handleRemove}
          title="Remove photo"
          style={{
            position: "absolute",
            top: "0px",
            right: "0px",
            background: "#ef4444",
            border: "none",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 0 4px rgba(0,0,0,0.3)",
            zIndex: 10
          }}
        >
          <FiX size={13} color="#fff" />
        </button>
      )}

      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        `}
      </style>
    </div>
  );
}