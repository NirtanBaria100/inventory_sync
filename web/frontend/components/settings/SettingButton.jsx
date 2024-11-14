import React from 'react';

const SettingButton = ({ title, onClick }) => {
    // shows the title sent from the parent component(settings page)
    return (
        <button
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                borderRadius: "10px",
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                width: "25%",
                backgroundColor: "white",
                height: "150px",
                border: "none",
                cursor: "pointer",
            }}
            onClick={onClick}
        >
            {title}
        </button>
    );
};

export default SettingButton;
