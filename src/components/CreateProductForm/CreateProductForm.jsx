import React, { useEffect, useState } from 'react';
import CPFStyles from './CreateProductForm.module.css';
import { toast } from 'react-toastify';
import { Button, TextField, Box } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import EditIcon from '@mui/icons-material/Edit';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

const CreateProductForm = ({ currentUser }) => {
    const [name, setName] = useState(localStorage.getItem('productName') || '');
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [productDetails, setProductDetails] = useState([]);
    const [detailsToSelect, setDetailsToSelect] = useState([]);
    const [isNameEditable, setIsNameEditable] = useState(true); // Состояние для управления доступностью поля ввода названия детали
    const [isEditMode, setIsEditMode] = useState(localStorage.getItem('isEditMode') === 'true');

    useEffect(() => {
        const savedDetails = JSON.parse(localStorage.getItem('selectedDetails')) || [];
        setProductDetails(savedDetails);
    }, []);

    useEffect(() => {
        localStorage.setItem('isEditMode', isEditMode);
    }, [isEditMode]);

    useEffect(() => {
        localStorage.setItem('productName', name);
    }, [name]);

    useEffect(() => {
        const fetchDetailsData = async () => {
            try {
                const result = await window.api.getDetails();
                setDetailsToSelect(result);
            } catch (error) {
                console.log(error);
            }
        };
        fetchDetailsData();
    }, []);

    const handleNameChange = (e) => {
        setName(e.target.value);
    };


    const handleDetailChange = (e) => {
        setSelectedDetail(e);
    };

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };

    const handleAddDetail = () => {
        // Делаем название детали неактивным после добавления детали
        setIsNameEditable(false);
        setIsEditMode(false);


        if (currentUser.level === 2) {
            toast.error("У вас маловато прав для выполнения этой операции!");
            return;
        }

        if (selectedDetail === null || quantity === '' || name === '') {
            toast.error("Заполните все поля!");
            return;
        }

        if (selectedDetail && quantity) {
            const existingDetailsString = localStorage.getItem('selectedDetails');
            const existingDetails = existingDetailsString ? JSON.parse(existingDetailsString) : [];

            const newDetail = { detailName: selectedDetail.detailName, quantity: parseInt(quantity) };
            const updatedDetails = [...existingDetails, newDetail];

            localStorage.setItem('selectedDetails', JSON.stringify(updatedDetails));

            setProductDetails(updatedDetails);
            setSelectedDetail(null);
            setQuantity('');
            
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentUser.level === 2) {
            toast.error("У вас маловато прав для выполнения этой операции!");
            return;
        }
        try {
            const savedDetails = JSON.parse(localStorage.getItem('selectedDetails'));

            if (!savedDetails || savedDetails.length === 0) {
                toast.error('Вы не добавили ни одной детали!');
                return;
            }
            const result = await window.api.addProduct(name, savedDetails);
            localStorage.removeItem('selectedDetails');
            localStorage.removeItem('isEditMode');
            setName('');
            setProductDetails([]);
            setIsEditMode(true);

            toast.success('Платы успешно добавлены в базу данных');
        } catch (error) {
            console.log(error);
        }
    };

    const handleEditName = () => {
        setIsEditMode(!isEditMode);
    };

    const handleDeleteDetail = (index) => {
        const updatedDetails = [...productDetails];
        updatedDetails.splice(index, 1);
        setProductDetails(updatedDetails);
        localStorage.setItem('selectedDetails', JSON.stringify(updatedDetails));

    };

    return (
        <div className={CPFStyles.mainContainer}>
            <div className={CPFStyles.formContainer}>
                <h1 className={CPFStyles.opacity} >Создание платы:</h1>
                <form onSubmit={handleSubmit}>
                    <div className={CPFStyles.opacity}>
                        <TextField
                            style={{ marginBottom: '10px', width: '280px' }}
                            id="productName"
                            label="Название платы:"
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            required
                            disabled={!isEditMode}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton
                                            style={{ marginBottom: '15px'}}
                                            aria-label="toggle edit mode"
                                            onClick={handleEditName}
                                            edge="start"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>
                    <Box width={280}>
                        <Autocomplete
                            className={CPFStyles.opacity}
                            style={{ marginBottom: '10px', width: '280px' }}
                            disablePortal
                            id="detailName"
                            options={detailsToSelect || []}
                            value={selectedDetail}
                            onChange={(event, newValue) => {
                                handleDetailChange(newValue);
                            }}
                            getOptionLabel={(detail) => `${detail.detailName} - ${detail.provider}`}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Название детали"
                                    variant="outlined"
                                    required
                                />
                            )}
                        />
                    </Box>
                    <div className={CPFStyles.opacity}>
                        <TextField
                            style={{ marginBottom: '10px', width: '280px' }}
                            id="quantity"
                            label="Требуемое кол-во:"
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            InputProps={{
                                inputProps: { min: 1 }
                            }}
                            required
                        />

                    </div>

                    <Button variant="contained" className={CPFStyles.opacity} style={{ width: '280px', marginTop: '30px' }} type="button" onClick={handleAddDetail}>Добавить деталь</Button>
                </form>
            </div>
            <div className={CPFStyles.detailsAndButtonContainer}>
                <div className={CPFStyles.detailsList}>
                    <h3>Список выбранных деталей:</h3>
                    <ul style={{ marginLeft: '-30px' }}>
                        {productDetails?.map((detail, index) => (
                            <li key={index} className={CPFStyles.detailItem}>
                                <span>{detail.detailName} - Количество: {detail.quantity}</span>
                                <div className={CPFStyles.deleteContainer}>
                                    <IconButton
                                        className={`${CPFStyles.deleteButton} ${CPFStyles.opacity}`}
                                        aria-label="delete"
                                        style={{ marginBottom: '30px' }}
                                        onClick={() => handleDeleteDetail(index)}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <Button style={{ width: '222px' }} type="submit" variant="contained" onClick={handleSubmit}>Внести плату в базу</Button>

            </div>
        </div>
    );
};

export default CreateProductForm;

