import React, { useEffect, useState } from 'react';
import CPFStyles from './CreateProductForm.module.css';
import ArchivePS from '../../Pages/ArchivePage/ArchivePage.module.css';
import { toast } from 'react-toastify';
import { Autocomplete, Box, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, OutlinedInput, Select, MenuItem, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import * as XLSX from 'xlsx/xlsx.mjs'




const CreateProductForm = ({ currentUser }) => {
    const [name, setName] = useState(localStorage.getItem('productName') || '');
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [productDetails, setProductDetails] = useState([]);
    const [detailsToSelect, setDetailsToSelect] = useState([]);
    const [isEditMode, setIsEditMode] = useState(localStorage.getItem('isEditMode') === 'true');
    const [isNameDuplicate, setIsNameDuplicate] = useState(false);
    let fileData
    const [updatedProducts, setUpdatedProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [flagReduct, setFlagReduct] = useState(false);
    const [selectedName, setSelectedProductName] = useState([]);
    const fetchDetailsData = async () => {
        // debugger
        try {
            const result = await window.api.getDetails();
            setDetailsToSelect(result);
            const result1 = await window.api.getProducts();
            setUpdatedProducts(result1);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        
        if (localStorage.getItem('isEditMode') === 'true') {
            localStorage.removeItem('selectedDetails');
            setFlagReduct(false);
        }
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

        fetchDetailsData();
    }, []);

    const handleProductChange = (event) => {
        // debugger
        const selectedProductName = event.target.value;
        setSelectedProductName(selectedProductName);
        // Find the selected product from the products list
        const selectedProduct = updatedProducts.find(product => product.productName === selectedProductName);
        if (selectedProduct) {
            localStorage.setItem('isEditMode', 'true');
            setFlagReduct(true);
            // Set the selected product and its details
            setSelectedProduct(selectedProduct);
            const productNameParts = selectedProduct.productName.split('_');
            const name = productNameParts[0];  
            setName(name);  
            // setName(selectedProduct.productName);
            setProductDetails(JSON.parse(selectedProduct.includedDetails));
            localStorage.setItem('selectedDetails', selectedProduct.includedDetails);
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        fileData = (sheetData);
        console.log(fileData);
        toast.success("Файл успешно загружен и плата уже добавлена в базу!");
        fetchDetailsData();
    };

    const handleUpload = async () => {
        if (fileData) {
            await window.api.sendDataFromExcel(fileData);
            fileData = null
        } else {
            console.error("No file selected");
        }
    };

    const formatDate = () => {
        const d = new Date();
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };


    const handleNameChange = (e,) => {
        setName(e.target.value);
        console.log(e.target.value);
        // debugger;
        setIsNameDuplicate(false); // Reset the flag when the name changes
    };


    const handleDetailChange = (e) => {
        setSelectedDetail(e);
    };

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };

    const handleAddDetail = async () => {
        // debugger;

        const isDuplicate = updatedProducts.some(product => product.productName === name);
        
        if (isDuplicate && !flagReduct) {
            setIsNameDuplicate(true);
            toast.error("Плата с таким названием уже существует!");
            return;
        }
        setIsEditMode(false);

        if (currentUser.level === 2) {
            toast.error("У вас маловато прав для выполнения этой операции!");
            return;
        }

        if (selectedDetail === null || quantity <= 0 || isNaN(parseInt(quantity)) || name === '') {
            toast.error("Заполните все поля!");
            return;
        }

        const existingDetailsString = localStorage.getItem('selectedDetails');
        const existingDetails = existingDetailsString ? JSON.parse(existingDetailsString) : [];

        // Проверяем, есть ли уже такая деталь в списке выбранных
        const isDetailDuplicate = existingDetails.some(detail => detail.detailName === selectedDetail.detailName && detail.provider === selectedDetail.provider);

        if (isDetailDuplicate) {
            toast.error("Деталь с таким названием и поставщиком уже добавлена!");
            return;
        }

        if (selectedDetail && quantity) {
            // Instead of overwriting productDetails, merge the new details with the existing ones
            const updatedDetails = [...existingDetails, { detailName: selectedDetail.detailName, provider: selectedDetail.provider, quantity: parseInt(quantity) }];

            localStorage.setItem('selectedDetails', JSON.stringify(updatedDetails));
            setProductDetails(updatedDetails);
            setSelectedDetail(null);
            setQuantity('');
        }
    };



    const handleSubmit = async (e) => {
        // debugger
        e.preventDefault();
        // const updatedProducts = await window.api.getProducts();
        // const isDuplicate = updatedProducts.some(product => product.productName === name);
        // if (isDuplicate) {
        //     toast.error("Product with this name already exists!");
        //     return;
        // }
        if (currentUser.level === 2) {
            toast.error("У вас недостаточно прав для выполнения этой операции");
            return;
        }

        try {
            const savedDetails = JSON.parse(localStorage.getItem('selectedDetails'));
            let nameToSend = name + "_" + formatDate();

            if (!savedDetails || savedDetails.length === 0) {
                toast.error('Вы не добавили ни одной детали');
                return;
            }
            
            if (flagReduct === true) {
                setFlagReduct(false);
                await window.api.updateNewProduct(selectedName, nameToSend, savedDetails); // Я думаю что менять лучше время на текушее у более новой версии или лучше добавлять ред

                toast.success('Плата успешно обновлена в базе данных');
                localStorage.removeItem('selectedDetails');
                localStorage.removeItem('isEditMode');
                setName('');
                setProductDetails([]);
                setIsEditMode(true);
                setFlagReduct(false);
                fetchDetailsData(); 
                return;
            }
            await window.api.addProduct(nameToSend, savedDetails);
            localStorage.removeItem('selectedDetails');
            localStorage.removeItem('isEditMode');
            setName('');
            setProductDetails([]);
            setIsEditMode(true);
            toast.success('Плата успешно добавлена в базу данных');
            fetchDetailsData();
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

    const handleClearAll = () => {
        setProductDetails([]);  
        localStorage.removeItem('selectedDetails');
    };

    const handleResetChange = () => {
        setFlagReduct(false);
        localStorage.removeItem('selectedDetails');
        localStorage.removeItem('isEditMode');
        setName('');
        setProductDetails([]);
        setIsEditMode(true);
        fetchDetailsData();
        setSelectedProductName('');
        setSelectedProduct({});
    }

    return (
        <div className={CPFStyles.mainContainer}>
            <div className={CPFStyles.formContainer}>
                <h1 style={{ marginTop: "5vh" }} >Создание платы:</h1>
                <form onSubmit={handleSubmit} style={{ width: '200px' }}>
                    <div className={CPFStyles.opacity}>
                        <Tooltip title="При редактировании платы - не забудьте стереть прошлую дату">
                            <TextField
                                color="success"
                                style={{ marginBottom: '10px', width: '200px' }}
                                id="productName"
                                label="Название платы:"
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                required
                                disabled={!isEditMode}
                                error={isNameDuplicate} // Отображаем ошибку, если имя дублируется

                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton
                                                style={{ marginBottom: '15px' }}
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
                        </Tooltip>
                    </div>
                    <Box width={280}>
                        <Autocomplete
                            className={CPFStyles.opacity}
                            style={{ marginBottom: '10px', width: '200px' }}
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
                                    color="success"
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
                            color="success"
                            style={{ marginBottom: '10px', width: '200px' }}
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
                    <Button variant="contained" className={`${CPFStyles.opacity} ${CPFStyles.blackButton}`} type="button" onClick={handleAddDetail}>Добавить деталь</Button>

                </form>
                <div style={{ marginTop: '10%' }}>
                    <p><b>Добавить спецификацию платы(excel):</b></p>
                    <OutlinedInput type="file" variant="outlined" accept="image/*"
                        onChange={async (e) => { await handleFileChange(e); handleUpload(); }}
                        className={ArchivePS.input}
                        placeholder="Выберите изображение" />
                </div>
                <div style={{ marginTop: '10%' }}>
                    <p><b>Редактировать плату:</b></p>
                    <Select
                        value={selectedProduct.productName || 'Выберите плату'}
                        onChange={handleProductChange}
                    >
                        <MenuItem key='defaultValue' selected value="Выберите плату">Выберите плату</MenuItem>
                        {updatedProducts && updatedProducts?.map((product) => (
                            <MenuItem key={product.id} value={product.productName}> {product.productName} </MenuItem>
                        ))}
                    </Select>
                </div>
                <Button
                    disabled={flagReduct ? false : true}
                    variant="contained"
                    className={flagReduct ? CPFStyles.blackButton : 'blackButton disabled'}
                    style={{ padding: '5px', width: '200px', marginRight: '10px', marginBottom: '10px', fontSize: '14px' }}
                    onClick={() => {
                        handleResetChange();
                    }}
                >
                    Отменить редактирование
                </Button>
            </div>
            <div className={CPFStyles.detailsAndButtonContainer}>
                <h3 style={{ marginTop: "6vh" }} >Список выбранных деталей:</h3>
                <div className={CPFStyles.detailsList}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9' }}>Название</TableCell>
                                <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9' }}>Количество</TableCell>
                                <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9' }}>          </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {productDetails.map((product, index) => (
                                <TableRow key={index} style={{ paddingRight: '5vh' }}>
                                    <TableCell style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', wordWrap: 'break-word' }}>{product.detailName}</TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell> <ClearIcon style={{ marginTop: '2vh', marginLeft: '-1vh', cursor: 'pointer' }} onClick={() => handleDeleteDetail(index)} /> </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div>
                    <Button class={`${CPFStyles.opacity} ${CPFStyles.blackButton}`} style={{ fontSize: '18px', width: '222px', marginRight: '20px', marginBottom: '10px' }} type="submit" variant="contained" onClick={handleSubmit}>{flagReduct ? 'Применить изменения' : 'Добавить плату в базу'}</Button>
                </div>
                <div>

                    <Button className={`${CPFStyles.opacity} ${CPFStyles.blackButton}`} style={{ width: '222px', marginRight: '10px'  }} variant="contained" onClick={handleClearAll }>Очистить все</Button>
                </div>

            </div>

        </div>
    );
};

export default CreateProductForm;

