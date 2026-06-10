import { useState } from "react";

function ReceiptUpload() {

  const [preview, setPreview] =
    useState(null);

  const handleUpload = (e) => {

    const file =
      e.target.files[0];

    if (file) {
      setPreview(
        URL.createObjectURL(file)
      );
    }
  };

  return (
    <div className="receipt-card">

      <h2>
        Upload Receipt
      </h2>

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={handleUpload}
      />

      {preview && (
        <img
          src={preview}
          alt="Receipt Preview"
          style={{
            width: "250px",
            marginTop: "15px",
            borderRadius: "10px",
          }}
        />
      )}

    </div>
  );
}

export default ReceiptUpload;