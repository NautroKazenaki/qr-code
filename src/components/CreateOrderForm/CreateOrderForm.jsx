import React, { useEffect, useState } from 'react';
import COFStyles from './CreateOrderForm.module.css';
import { toast } from 'react-toastify';
import { Button, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

const CreateOrderForm = ({ currentUser }) => {
    let userFormLocalStorage = JSON.parse(localStorage.getItem("user"));
    let userName = userFormLocalStorage ? userFormLocalStorage.email : '';
    
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
            const result = await window.api.getProducts();
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
            const orders = await window.api.getAllOrders(); // Ожидаем разрешения обещания
    
            if (!Array.isArray(orders)) {
                console.error('Orders is not an array:', orders);
                toast.error("Ошибка при получении данных о заказах");
                return;
            }
    
            if (currentUser.level === 2) {
                toast.error("У вас маловато прав для выполнения этой оперции!");
                return;
            }
    
            if (selectedProduct === null || quantity === '' || quantity === '0' || orderTo === '') {
                toast.error("Вы забыли заполнить все поля!");
                return;
            } else {
                // Перебираем заказы и проверяем совпадение имен
                const existingOrder = orders.some(order => order.orderTo === orderTo);
                if (existingOrder) {
                    toast.error("Для данного имени уже создан заказ!");
                    return;
                }
    
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
            const orders = await window.api.getAllOrders(); // Получаем все заказы перед обработкой формы
            if (!Array.isArray(orders)) {
                console.error('Orders is not an array:', orders);
                toast.error("Ошибка при получении данных о заказах");
                return;
            }
    
            if (currentUser.level === 2) {
                toast.error("У вас маловато прав для выполнения этой оперции!");
                return;
            }
    
            // Проверка, что заказ для данного имени уже существует
            const existingOrder = orders.some(order => order.orderTo === orderTo);
            if (existingOrder) {
                toast.error("Для данного имени уже создан заказ!");
                return;
            }
    
            if (selectedProducts.length > 0) {
                try {                
                    await window.api.addOrder(startDate, orderTo, selectedProducts, userName);
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
    

    return (
        <div className={COFStyles.mainContainer}>
            <div className={COFStyles.formContainer}>
                <h2>Создать заказ</h2>
                <form onSubmit={handleSubmit}>
                    <div className={COFStyles.formGroup}>
                        <TextField
                            id="startDate"
                            label="Дата начала"
                            value={startDate}
                            InputProps={{ readOnly: true }}
                            required
                        />
                    </div>
                    <div className={COFStyles.formGroup}>
                        <TextField
                            id="userName"
                            label="Составитель заказа"
                            value={userName}
                            InputProps={{ readOnly: true }}
                            required
                        />
                    </div>
                    <div >
                        <TextField
                            id="orderTo"
                            label="Заказ для"
                            value={orderTo}
                            onChange={handleOrderToChange}
                            required
                            style={{ width: 283, marginBottom: '15px'}}
                        />
                    </div>
                    <div>
                        <Autocomplete
                            id="productSelect"
                            options={products.map((product) => product.productName)}
                            value={selectedProduct}
                            onChange={handleProductChange}
                            renderInput={(params) => <TextField {...params} label="Выберите продукт" />}
                            required
                            style={{ width: 283, marginBottom: '15px'}}
                        />
                    </div>
                    <div >
                        <TextField
                            id="quantityOfProducts"
                            label="Укажите количество"
                            type="number"
                            value={quantity}
                            onChange={handeltQuantityChange}
                            required
                            InputProps={{ inputProps: { min: 1 } }}
                            style={{ width: 283, marginBottom: '15px'}}
                        />
                    </div>
                    <Button type="button" className={`${COFStyles.button} ${COFStyles.blueBackground}`} variant="contained" onClick={handleAddProduct}>Добавить продукт</Button>
                </form>
            </div>
            <div className={COFStyles.selectedProducts1}>
                <div className={COFStyles.selectedProducts}>
                    <h3>Выбранные продукты:</h3>
                    <ul>
                        {selectedProducts.map((product, index) => (
                            <li key={index}>{product.productName} - {product.quantity}шт</li>
                        ))}
                    </ul>

                </div>
                <Button type="button" variant="contained" className={`${COFStyles.button} ${COFStyles.blueBackground}`} onClick={handleSubmit}>Завершить создание заказа</Button>

            </div>

        </div>
        
    );
};

export default CreateOrderForm;
