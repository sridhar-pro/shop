"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  Lock,
  Edit,
  UserX,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import { toast } from "react-toastify";

/* ─── Inline styles & keyframes ─────────────────────────── */
const globalStyles = `

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(160,3,0,.18); }
    70%  { box-shadow: 0 0 0 10px rgba(160,3,0,0); }
    100% { box-shadow: 0 0 0 0 rgba(160,3,0,0); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg);  }
    to   { transform: rotate(360deg); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0);   }
    50%      { transform: translateY(-5px); }
  }

  .profile-field {
    animation: fadeUp .5s ease both;
  }
  .profile-field:nth-child(1) { animation-delay: .08s; }
  .profile-field:nth-child(2) { animation-delay: .16s; }
  .profile-field:nth-child(3) { animation-delay: .24s; }
  .profile-field:nth-child(4) { animation-delay: .32s; }

  .shimmer-line {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 6px;
  }

  .stat-card {
    animation: fadeUp .6s ease both;
    transition: transform .3s ease, box-shadow .3s ease;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,.09);
  }

  .btn-primary {
    position: relative;
    overflow: hidden;
    transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
  }
  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,.12);
    opacity: 0;
    transition: opacity .2s;
  }
  .btn-primary:hover::after { opacity: 1; }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,.14);
  }
  .btn-primary:active { transform: translateY(0); }

  .field-input {
    background: transparent;
    border: none;
    border-bottom: 1.5px solid #d4a0a0;
    outline: none;
    font-size: .95rem;
    color: #1a1a1a;
    padding: 2px 0;
    width: 100%;
    transition: border-color .2s;
  }
  .field-input:focus { border-bottom-color: #a00300; }

  .avatar-ring { animation: pulse-ring 2.4s ease-out infinite; }
  .avatar-icon { animation: float 4s ease-in-out infinite; }
  /* ─── Mobile Responsive ─────────────────────────── */

@media (max-width: 768px) {

  .profile-container {
    padding: 2rem 1.2rem !important;
  }

  .profile-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 1rem !important;
  }

  .profile-fields {
    grid-template-columns: 1fr !important;
  }

  .profile-stats {
    grid-template-columns: 1fr !important;
  }

  .profile-buttons {
    width: 100%;
    flex-direction: column;
  }

  .profile-buttons button {
    width: 100%;
    justify-content: center;
  }

}
`;

/* ─── Small helper components ────────────────────────────── */
const Divider = () => (
  <div
    style={{
      height: 1,
      background:
        "linear-gradient(90deg,transparent,#e8d5d5 30%,#e8d5d5 70%,transparent)",
      margin: "0 0 2rem",
    }}
  />
);

const SectionLabel = ({ children }) => (
  <p
    style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "1.35rem",
      fontWeight: 500,
      letterSpacing: ".04em",
      color: "#1a1a1a",
      marginBottom: "1.4rem",
    }}
  >
    {children}
  </p>
);

/* ─── Main Component ─────────────────────────────────────── */
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });

  const { getValidToken } = useAuth();

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await getValidToken();
      const companyId = localStorage.getItem("company_id");

      const res = await fetch("/api/getprofile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: companyId }),
      });

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      const profileResponse = data?.[0];

      if (profileResponse?.status === true) {
        const normalizedProfile = {
          ...profileResponse.data,
          orders_count: Number(profileResponse.data?.orders_count || 0),
          enquiry_count: Number(profileResponse.data?.enquiry_count || 0),
        };
        setProfile(normalizedProfile);
        setFormData({
          first_name: normalizedProfile.first_name || "",
          last_name: normalizedProfile.last_name || "",
          phone: normalizedProfile.phone || "",
          email: normalizedProfile.email || "",
        });
      } else {
        toast.error(profileResponse?.message || "Failed to load profile ❌");
      }
    } catch (err) {
      console.error("❌ Profile fetch error:", err);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await getValidToken();
      const companyId = localStorage.getItem("company_id");

      const res = await fetch("/api/profile_update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          act: "user",
          user_id: companyId,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          email: formData.email,
          group_id: 3,
        }),
      });

      const data = await res.json();
      if (data?.status === true) {
        toast.success("Profile updated successfully 🎉");
        setIsEditing(false);
        fetchProfile();
      } else {
        toast.error(data?.message || "Update failed ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ❌");
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <>
        <style>{globalStyles}</style>
        <div
          style={{
            padding: "2.5rem 3rem",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.2rem",
              marginBottom: "2.5rem",
            }}
          >
            <div
              className="shimmer-line"
              style={{ width: 64, height: 64, borderRadius: "50%" }}
            />
            <div style={{ flex: 1 }}>
              <div
                className="shimmer-line"
                style={{ height: 18, width: "35%", marginBottom: 8 }}
              />
              <div
                className="shimmer-line"
                style={{ height: 13, width: "22%" }}
              />
            </div>
          </div>
          {[1, 2, 3, 4].map((_, i) => (
            <div
              key={i}
              className="shimmer-line"
              style={{ height: 56, marginBottom: 16, borderRadius: 12 }}
            />
          ))}
        </div>
      </>
    );
  }

  /* ── Empty state ── */
  if (!profile) {
    return (
      <>
        <style>{globalStyles}</style>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh", // full viewport height
            width: "100%",
            textAlign: "center",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#fdf0f0,#f5e0e0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.4rem",
              boxShadow: "0 4px 24px rgba(160,3,0,.1)",
            }}
          >
            <UserX style={{ width: 36, height: 36, color: "#a00300" }} />
          </div>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.7rem",
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            No Profile Found
          </p>

          <p style={{ color: "#888", fontSize: ".9rem", maxWidth: 320 }}>
            We couldn't find your profile details right now.
          </p>
        </div>
      </>
    );
  }

  /* ── Full profile ── */
  const initials =
    `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() ||
    "—";

  const fields = [
    { icon: User, label: "First Name", key: "first_name", name: "first_name" },
    { icon: User, label: "Last Name", key: "last_name", name: "last_name" },
    { icon: Mail, label: "Email", key: "email", name: "email" },
    { icon: Phone, label: "Phone", key: "phone", name: "phone" },
  ];

  return (
    <>
      <style>{globalStyles}</style>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          background: "linear-gradient(160deg,#fdfbfb 0%,#f9f5f5 100%)",
          minHeight: "100vh",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          className="profile-container"
          style={{
            maxWidth: 860,
            margin: "0 auto",
            padding: "3rem 2rem 4rem",
            animation: "fadeUp .6s ease both",
          }}
        >
          {/* ── Header ── */}
          <div
            className="profile-header"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              marginBottom: "2.8rem",
            }}
          >
            {/* Avatar */}
            <div
              className="avatar-ring"
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#a00300,#d63b38)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                className="avatar-icon"
                style={{
                  color: "#fff",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                {initials}
              </span>
            </div>

            <div>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "2rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {profile.first_name} {profile.last_name}
              </h1>
              <p
                style={{
                  color: "#999",
                  fontSize: ".82rem",
                  marginTop: 4,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                }}
              >
                Account Profile
              </p>
            </div>
          </div>

          {/* ── Thin rule ── */}
          <Divider />

          {/* ── Fields ── */}
          <SectionLabel>Personal Information</SectionLabel>

          <div
            className="profile-fields"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.2rem",
              marginBottom: "2.4rem",
            }}
          >
            {fields.map(({ icon: Icon, label, key, name }) => (
              <div
                key={key}
                className="profile-field"
                style={{
                  background: "#fff",
                  border: "1px solid #ede8e8",
                  borderRadius: 14,
                  padding: "1.1rem 1.3rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.9rem",
                  boxShadow: "0 2px 12px rgba(0,0,0,.04)",
                  transition: "border-color .25s, box-shadow .25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#d4a0a0";
                  e.currentTarget.style.boxShadow =
                    "0 4px 22px rgba(160,3,0,.07)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#ede8e8";
                  e.currentTarget.style.boxShadow =
                    "0 2px 12px rgba(0,0,0,.04)";
                }}
              >
                {/* Icon bubble */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#fdf0f0,#fce4e4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <Icon style={{ width: 15, height: 15, color: "#a00300" }} />
                </div>

                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: ".72rem",
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </p>
                  {isEditing ? (
                    <input
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className="field-input"
                    />
                  ) : (
                    <p
                      style={{
                        fontSize: ".95rem",
                        fontWeight: 500,
                        color: "#1a1a1a",
                        margin: 0,
                      }}
                    >
                      {profile[key] || "—"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Edit / Save / Cancel ── */}
          <div
            className="profile-buttons"
            style={{ display: "flex", gap: 10, marginBottom: "3rem" }}
          >
            {!isEditing ? (
              <button
                className="btn-primary"
                onClick={() => setIsEditing(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: ".82rem",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: ".04em",
                  fontWeight: 500,
                }}
              >
                <Edit style={{ width: 14, height: 14 }} /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  className="btn-primary"
                  onClick={handleUpdateProfile}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 22px",
                    borderRadius: 999,
                    background: "#1e7e34",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: ".82rem",
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: ".04em",
                    fontWeight: 500,
                  }}
                >
                  <Check style={{ width: 14, height: 14 }} /> Save
                </button>

                <button
                  className="btn-primary"
                  onClick={() => setIsEditing(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 22px",
                    borderRadius: 999,
                    background: "transparent",
                    color: "#555",
                    border: "1.5px solid #ddd",
                    cursor: "pointer",
                    fontSize: ".82rem",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  <X style={{ width: 14, height: 14 }} /> Cancel
                </button>
              </>
            )}
          </div>

          {/* ── Divider ── */}
          <Divider />

          {/* ── Account Activity ── */}
          <SectionLabel>Account Activity</SectionLabel>
          <div
            className="profile-stats"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "1.1rem",
            }}
          >
            {[
              { label: "Last Login", value: profile.last_login, delay: ".08s" },
              {
                label: "Total Orders",
                value: profile.orders_count,
                delay: ".18s",
              },
              {
                label: "Total Enquiries",
                value: profile.enquiry_count,
                delay: ".28s",
              },
            ].map(({ label, value, delay }) => (
              <div
                key={label}
                className="stat-card"
                style={{
                  animationDelay: delay,
                  background: "#fff",
                  border: "1px solid #ede8e8",
                  borderRadius: 14,
                  padding: "1.3rem 1.4rem",
                  boxShadow: "0 2px 12px rgba(0,0,0,.04)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative corner accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 48,
                    height: 48,
                    background:
                      "linear-gradient(225deg,#fdf0f0 0%,transparent 60%)",
                    borderBottomLeftRadius: 24,
                  }}
                />

                <p
                  style={{
                    fontSize: ".72rem",
                    color: "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    marginBottom: 8,
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontFamily:
                      typeof value === "number"
                        ? "'Cormorant Garamond', serif"
                        : "'DM Sans', sans-serif",
                    fontSize: typeof value === "number" ? "2.2rem" : ".92rem",
                    fontWeight: typeof value === "number" ? 600 : 500,
                    color: "#1a1a1a",
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {value ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
