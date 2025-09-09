import React, { useState, useEffect } from "react";
import api from "../api";
import AddContactModal from "./AddContactModal";

const EmergencyContacts = () => {
  const [allContacts, setAllContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getContacts = async () => {
      try {
        const res = await api.get("/user/get-contacts");
        if (res.data) setAllContacts(res.data.contacts);
      } catch (err) {
        console.error(err);
      }
    };
    getContacts();
  }, []);

  const handleContactAdded = (contact) => {
    setAllContacts([...allContacts, contact]);
  };

  return (
    <div style={{
      maxWidth: "600px",
      margin: "50px auto",
      fontFamily: "Arial, sans-serif",
      color: "#eee",
      backgroundColor: "#1e1e2f",
      borderRadius: "12px",
      padding: "30px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
    }}>
      <h2 style={{ textAlign: "center", color: "#fff", marginBottom: "30px" }}>
        Emergency Contacts
      </h2>

      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
            transition: "0.3s",
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#45a049"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#4CAF50"}
        >
          Add New Contact
        </button>
      </div>

      <div>
        {allContacts.length === 0 ? (
          <p style={{ color: "#bbb", textAlign: "center" }}>No contacts added yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {allContacts.map((c, idx) => (
              <li
                key={idx}
                style={{
                  padding: "15px 20px",
                  marginBottom: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#2a2a3d",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  transition: "0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#33334a"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2a2a3d"}
              >
                <span><strong>Name:</strong> {c.name}</span>
                <span><strong>Number:</strong> {c.number}</span>
                <span><strong>Email:</strong> {c.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContactAdded={handleContactAdded}
      />
    </div>
  );
};

export default EmergencyContacts;
