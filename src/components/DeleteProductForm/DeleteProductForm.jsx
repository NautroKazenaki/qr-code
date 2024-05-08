import React, { useState, useEffect } from 'react';
import DPFStyles from './DeleteProductForm.module.css';
import { toast } from 'react-toastify';
import { TextField, IconButton , Button, InputAdornment } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Clear from '@mui/icons-material/Clear';

const DeleteProductForm = ({currentUser}) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const result = await window.api.getProducts();
                setProducts(result);
            } catch (error) {
                console.error('Error fetching products:', error);
                toast.error('Неудалось загрузить платы');
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
                await window.api.deleteProduct(selectedProduct.id);
                setSelectedProduct(null);
                const updatedProducts = await window.api.getProducts();
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
                    id="productSelect"
                    options={products}
                    getOptionLabel={(product) => product.productName} // Функция для отображения наименования продукта в автокомплекте
                    value={selectedProduct}  
                    onChange={(event, newValue) => {
                        handleProductChange(newValue);
                    }}
                    renderInput={(params) => (
                        <TextField
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
            </div>
            <Button variant="contained" className={DPFStyles.deleteButton} style={{ width: '224px'}} type="button" onClick={handleDelete}>Удалить плату</Button>
        </div>
    );
};

export default DeleteProductForm;