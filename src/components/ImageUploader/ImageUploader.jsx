import React, { useState } from 'react';
import { OutlinedInput, Tooltip, } from '@mui/material';
import ArchivePS from '../../Pages/ArchivePage/ArchivePage.module.css';
import axios from 'axios';

function ImageUploader({searchID, setSearchID, userLevel}) {
    const [qrResult, setQrResult] = React.useState(null);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
            const imageData = reader.result;
            // window.api.processImage(imageData).then(result => {
                
            //     console.log(result);
            //     setSearchID(result);
            // }).catch(error => {
            //     console.error('Error processing image:', error);
            // });
            // const response = await axios.post('http://localhost:3001/archieve/image', { image: imageData});
            const response = await axios.post('http://192.168.0.100:3001/archieve/image', { image: imageData});
            const result = response.data.result;
            setSearchID(result);
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