import React, { useState } from 'react';
import { OutlinedInput, Tooltip, } from '@mui/material';
import ArchivePS from '../../Pages/ArchivePage/ArchivePage.module.css';

function ImageUploader({searchID, setSearchID, userLevel}) {
    const [qrResult, setQrResult] = React.useState(null);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const imageData = reader.result;
            window.api.processImage(imageData).then(result => {
                
                console.log(result);
                setSearchID(result);
            }).catch(error => {
                console.error('Error processing image:', error);
            });
        };

        reader.readAsDataURL(file);
    };

    return (
        <Tooltip title="Загрузите фотографию с QR-кодом для поиска">
            <div className={ArchivePS.inputContainer}>
                <OutlinedInput disabled={userLevel > 1} type="file" variant="outlined" accept="image/*" onChange={handleImageUpload} className={ArchivePS.input} />
                {qrResult && (
                    <div className={ArchivePS.qrContainer}>
                        <p className={ArchivePS.qrText}>Decoded QR Code:</p>
                        <pre className={ArchivePS.qrResult}>{JSON.stringify(qrResult, null, 2)}</pre>
                    </div>
                )}
            </div>
        </Tooltip>
    );
}

export default ImageUploader;