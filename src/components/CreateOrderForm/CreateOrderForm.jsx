import React, { useEffect, useState } from 'react';
import COFStyles from './CreateOrderForm.module.css';
import { toast } from 'react-toastify';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import { Autocomplete, TextField, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import axios from 'axios';

const CreateOrderForm = ({ currentUser }) => {
    let userFormLocalStorage = JSON.parse(localStorage.getItem("user"));
    let userName = userFormLocalStorage ? userFormLocalStorage.name : '';

    const getCurrentDateTimeString = () => {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        return `${dateString} ${timeString}`;
    };

    const [startDate, setStartDate] = useState(getCurrentDateTimeString());
    const [orderTo, setOrderTo] = useState(localStorage.getItem("orderTo") || '');
    const [quantity, setQuantity] = useState(localStorage.getItem("quantity") || '');
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState(JSON.parse(localStorage.getItem("selectedProducts")) || []);

    useEffect(() => {
        const fetchData = async () => {
            // const result = await axios.get('https://localhost:3001/products')
            const result = await axios.get('https://192.168.0.100:3001/products')
            setProducts(result);
        };
        fetchData();
    }, []);

    const handeltQuantityChange = (e) => {
        setQuantity(e.target.value);
        localStorage.setItem("quantity", e.target.value);
    };

    const handleOrderToChange = (e) => {
        setOrderTo(e.target.value);
        localStorage.setItem("orderTo", e.target.value);
    };

    const handleProductChange = (e, value) => {
        setSelectedProduct(value);
    };

    const handleAddProduct = async () => {
        try {
            // const orders = await window.api.getAllOrders(); // Ожидаем разрешения обещания
            // const orders = await axios.get('https://localhost:3001/orders')
            const orders = await axios.get('https://192.168.0.100:3001/orders')

            if (!Array.isArray(orders.data)) {
                console.error('Orders is not an array:', orders.data);
                toast.error("Ошибка при получении данных о заказах");
                return;
            }

            if (currentUser.level === 2) {
                toast.error("У вас маловато прав для выполнения этой оперции!");
                return;
            }
    
            if (selectedProduct === null || quantity === '' || quantity <= 0 || orderTo === '') {
                toast.error("Вы забыли заполнить все поля!");
                return;
            } else {
              

                const index = selectedProducts.findIndex(product => product.productName === selectedProduct);
                if (index !== -1) {
                    const updatedSelectedProducts = [...selectedProducts];
                    updatedSelectedProducts[index].quantity += parseInt(quantity);
                    setSelectedProducts(updatedSelectedProducts);
                    localStorage.setItem("selectedProducts", JSON.stringify(updatedSelectedProducts)); // Сохраняем обновленный список выбранных продуктов
                } else {
                    const newProduct = { productName: selectedProduct, quantity: parseInt(quantity), manufactured: false };
                    const newSelectedProducts = [...selectedProducts, newProduct];
                    setSelectedProducts(newSelectedProducts);
                    localStorage.setItem("selectedProducts", JSON.stringify(newSelectedProducts)); // Сохраняем новый список выбранных продуктов
                }
                setSelectedProduct(null);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error("Ошибка при получении данных о заказах");
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // const orders = await window.api.getAllOrders(); // Получаем все заказы перед обработкой формы
            // const orders = await axios.get('https://localhost:3001/orders') 
            const orders = await axios.get('https://192.168.0.100:3001/orders') 
            if (!Array.isArray(orders.data)) {
                console.error('Orders is not an array:', orders.data);
                toast.error("Ошибка при получении данных о заказах");
                return;
            }

            if (currentUser.level === 2) {
                toast.error("У вас маловато прав для выполнения этой оперции!");
                return;
            }

            // Проверка, что заказ для данного имени уже существует
           

            if (selectedProducts.length > 0) {
                try {
                    let username = userFormLocalStorage ? userFormLocalStorage.name : '';
                    // await window.api.addOrder(startDate, orderTo, selectedProducts, userName);
                    // await axios.post('https://localhost:3001/orders', {
                    //     startDate,
                    //     orderTo,
                    //     selectedProducts,
                    //     username 
                    // })
                    await axios.post('https://192.168.0.100:3001/orders', {
                        startDate,
                        orderTo,
                        selectedProducts,
                        username 
                    })
                    setStartDate(getCurrentDateTimeString());
                    setOrderTo('');
                    setQuantity('');
                    setSelectedProduct(null);
                    setSelectedProducts([]);
                    toast.success("Заказ успешно создан");
                    localStorage.removeItem("orderTo");
                    localStorage.removeItem("quantity");
                    localStorage.removeItem("selectedProducts");
                } catch (error) {
                    console.error('Error submitting order:', error);
                    toast.error("Ошибка при создании заказа");
                }
            } else {
                toast.error("Вы не добавили ни одного продукта!");
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error("Ошибка при получении данных о заказах");
        }
    };

    const handleDeleteProduct = (index) => {
        const updatedSelectedProducts = [...selectedProducts];
        updatedSelectedProducts.splice(index, 1);  
        setSelectedProducts(updatedSelectedProducts);  
        localStorage.setItem("selectedProducts", JSON.stringify(updatedSelectedProducts)); 
    };
    

    return (
        <div className={COFStyles.mainContainer}>
            <div className={COFStyles.formContainer}>
                <h2>Создать заказ</h2>
                <form onSubmit={handleSubmit}>
                    <div className={COFStyles.formGroup}>
                        <TextField
                            color="success"
                            id="startDate"
                            label="Дата начала"
                            value={startDate}
                            InputProps={{ readOnly: true }}
                            required
                        />
                    </div>
                    <div className={COFStyles.formGroup}>
                        <TextField
                            color="success"
                            id="userName"
                            label="Составитель заказа"
                            value={userName}
                            InputProps={{ readOnly: true }}
                            required
                        />
                    </div>
                    <div >
                        <TextField
                            color="success"
                            id="orderTo"
                            label="Заказ для"
                            value={orderTo}
                            onChange={handleOrderToChange}
                            required
                            style={{ width: 283, marginBottom: '15px' }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {orderTo && (
                                            <IconButton onClick={() => setOrderTo('')}>
                                                <ClearIcon style={{marginTop: "-15px"}}/>
                                            </IconButton>
                                        )}
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>
                    <div>
                        <Autocomplete
                            id="productSelect"
                            options={products.data?.map((product) => product.productName)}
                            value={selectedProduct}
                            onChange={handleProductChange}
                            renderInput={(params) => <TextField color="success" {...params} label="Выберите продукт" />}
                            required
                            style={{ width: 283, marginBottom: '15px' }}
                            
                        />
                    </div>
                    <div >
                        <TextField
                            color="success"
                            id="quantityOfProducts"
                            label="Укажите количество"
                            type="number"
                            value={quantity}
                            onChange={handeltQuantityChange}
                            required
                            InputProps={{ inputProps: { min: 1 } }}
                            style={{ width: 283}}
                        />
                    </div>
                    <Button type="button" className={COFStyles.blackButton} variant="contained" onClick={handleAddProduct}>Добавить продукт</Button>
                </form>
            </div>  


            <div className={COFStyles.detailsAndButtonContainer}>
                <div className={COFStyles.detailsAndButtonContainer}>
                    <h3 >Список выбранных продуктов:</h3>
                    <div className={COFStyles.detailsList}>
                        <TableContainer >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9' }}>Название</TableCell>
                                        <TableCell style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9' }}>Количество</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedProducts.map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{product.productName}</TableCell>
                                            <TableCell>{product.quantity}шт</TableCell>
                                            <IconButton onClick={() => handleDeleteProduct(index)}><ClearIcon /></IconButton>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>

                <Button class={COFStyles.blackButton} style={{fontSize: '18px'}} type="submit" variant="contained" onClick={handleSubmit}>
                    Внести плату в базу
                </Button>

            </div>
        </div>
    );
};

export default CreateOrderForm;
