import { useState } from "react";
import { FiUpload, FiEdit2 } from "react-icons/fi";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function OrgBanner({ orgId, orgName, bannerUrl }) {

  const [preview, setPreview] = useState(bannerUrl || null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("banner", file);

    setLoading(true);

    try {
      const res = await api.post(`/org/${orgId}/banner`, formData);

      const newUrl = res.data.banner_url;

      setPreview(`${newUrl}?t=${Date.now()}`); // bust cache
      toast.success("Banner updated");

    } catch (err) {
      toast.error("Upload failed");
    }

    setLoading(false);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleUpload(file);
  };

  return (
    <div style={{ textAlign: "center", position: "relative" }}>
      <label style={{ cursor: "pointer", position: "relative" }}>
        <div
          style={{
            width: "130px",
            height: "130px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid #ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f4f4f4",
            position: "relative"
          }}
        >
          {loading ? (
            <div
              style={{
                width: "30px",
                height: "30px",
                border: "4px solid #ccc",
                borderTop: "4px solid #333",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}
            />
          ) : preview ? (
            <img
              src={preview}
              alt="banner"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          ) : (
            <FiUpload size={32} color="#666" />
          )}
        </div>

        {/* edit icon */}
        {preview && !loading && (
          <div
            style={{
              position: "absolute",
              bottom: "5px",
              right: "5px",
              background: "#fff",
              borderRadius: "50%",
              padding: "6px",
              boxShadow: "0 0 4px rgba(0,0,0,0.2)"
            }}
          >
            <FiEdit2 size={14} />
          </div>
        )}

        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          style={{ display: "none" }}
          onChange={onFileChange}
        />
      </label>

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