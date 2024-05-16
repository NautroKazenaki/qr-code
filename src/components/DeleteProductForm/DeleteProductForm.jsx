import React, { useState, useEffect } from 'react';
import DPFStyles from './DeleteProductForm.module.css';
import { toast } from 'react-toastify';
import { TextField, Button, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, } from '@mui/material';
// import withStyles from '@mui/styles';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import axios from 'axios';

const DeleteProductForm = ({ currentUser, userLevel }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const result = await axios.get('http://localhost:3001/products');
                setProducts(result);
            } catch (error) {
                console.error('Error fetching products:', error);
                toast.error('Не удалось загрузить платы');
            }
        };

        fetchProducts();
    }, []);

    const handleProductChange = (e) => {
        setSelectedProduct(e);
    };

    const handleDelete = async () => {
        if (currentUser.level === 2) {
            toast.error("У вас маловато прав для выполнения этой операции!");
            return;
        }

        if (selectedProduct && selectedProduct.productName) {
            try {
                let id = selectedProduct.productName
                // await window.api.deleteProduct(selectedProduct.productName);
                await axios.delete(`http://localhost:3001/products/${id}`);
                setSelectedProduct(null);
                const updatedProducts = await axios.get('http://localhost:3001/products');
                setProducts(updatedProducts);
                toast.success("Плата успешно удалена");
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error("Возникла ошибка при удалении платы");
            }
        } else {
            toast.error("Вы забыли выбрать удаляемую плату!");
        }
    };

    return (
        <div className={DPFStyles.container}>
            <h2>Удалить плату</h2>
            <div className={DPFStyles.formGroup}>
                <Box width={224}>
                    <Autocomplete
                        disablePortal
                        disabled={userLevel > 0}
                        id="productSelect"
                        options={products.data}
                        getOptionLabel={(product) => product.productName} // Функция для отображения наименования продукта в автокомплекте
                        value={selectedProduct}
                        onChange={(event, newValue) => {
                            handleProductChange(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                color="success"
                                {...params}
                                label="Выберите плату"
                                variant="outlined"
                                style={{ marginBottom: '10px' }}
                                required
                            />
                        )}
                        clearIcon={null}
                    />
                </Box>
                {selectedProduct !== null && (
                    <div className={DPFStyles.includedDetailsContainer}>
                        <p>В состав платы входит:</p>
                        <TableContainer component={Paper} style={{ maxHeight: '300px' }}>
                            <Table>
                                <TableHead sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'white', width: '100%' }}>
                                    <TableRow>
                                        <TableCell  >Деталь</TableCell>
                                        <TableCell>Количество</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody sx={{width: '100%' }}>
                                        {JSON.parse(selectedProduct.includedDetails).map((detail, index) => (
                                            <TableRow>
                                                <TableCell>{detail.detailName}</TableCell>
                                                <TableCell>{detail.quantity} шт</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}
            </div>
            <Button variant="contained" class={DPFStyles.deleteButton} style={{fontSize: '18px'}} type="button" onClick={handleDelete}>Удалить плату</Button>
        </div>
    );
};

export default DeleteProductForm;
