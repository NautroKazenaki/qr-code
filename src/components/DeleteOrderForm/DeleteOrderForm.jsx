import React, { useState, useEffect } from 'react';
import DPFStyles from './DeleteOrderForm.module.css';
import { toast } from 'react-toastify';
import { Autocomplete, TextField, Button } from '@mui/material';

const DeleteOrderForm = ({ currentUser }) => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedProductDetails, setSelectedProductDetails] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const result = await window.api.getAllOrders();
                setOrders(result);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);

    const handleOrderChange = async (event, value) => {
        if (value) {
            const productDetails = [];
            for (const product of value.includedProducts) {
                const productName = product.productName;
    
                try {
                    const details = await window.api.getProducts();
                    const foundProduct = details.find(product => product.productName === productName);
    
                    if (foundProduct) {
                         const includedDetails = JSON.parse(foundProduct.includedDetails);
                        productDetails.push({ productName, includedDetails });
                    } else {
                        console.log('Продукт не найден');
                    }
                } catch (error) {
                    console.error('Error fetching products:', error);
                }
            }
            setSelectedOrder(value);
            setSelectedProductDetails(productDetails);
        } else {
            setSelectedOrder(null);
            setSelectedProductDetails(null);
        }
    };
    
    
    
    

    const handleDeleteOrder = async () => {
        if (currentUser.level === 2) {
            toast.error("У вас маловато прав для выполнения этой оперции!");
            return;
        }
        if (selectedOrder) {
            try {
                await window.api.deleteOrder(selectedOrder.id);
                // Remove the deleted order from the state
                setOrders(orders.filter(order => order.id !== selectedOrder.id));
                setSelectedOrder(null);
                setSelectedProductDetails(null);
                console.log('Order deleted successfully!');
                toast.success("Заказ успешно удалён");
            } catch (error) {
                console.error('Error deleting order:', error);
            }
        }
    };

    return (
        <div className={DPFStyles.pageContainer}>
            <div className={DPFStyles.container}>
                <h2>Удалить заказ</h2>
                <div className={DPFStyles.formGroup}>
                    <Autocomplete
                        style={{width: '600px'}}
                        id="orderSelect"
                        options={orders}
                        getOptionLabel={(order) => `Id заказа: ${order.id}, Время начала: ${order.startDate}, Заказ для: ${order.orderTo}`}
                        value={selectedOrder}
                        onChange={handleOrderChange}
                        renderInput={(params) => <TextField {...params} label="Выберите заказ" />}
                    />
                </div>
                {selectedProductDetails && (
                    <div className={DPFStyles.selectedOrderInfo}>
                        {selectedProductDetails.map((product, index) => (
                            <React.Fragment key={index}>
                                <h3>{product.productName}</h3>
                                <ul>
                                    {product.includedDetails.map((detail, detailIndex) => (
                                        <li key={detailIndex}>
                                            {detail.detailName} - Количество: {detail.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </React.Fragment>
                        ))}
                    </div>
                )}
                {selectedOrder && (
                    <Button className={DPFStyles.deleteButton} onClick={handleDeleteOrder}>Удалить заказ</Button>
                )}
            </div>
        </div>
    );
};

export default DeleteOrderForm;
