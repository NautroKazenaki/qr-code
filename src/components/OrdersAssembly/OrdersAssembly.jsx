import React, { useState, useEffect } from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup, FormLabel } from '@mui/material';
import OAStyles from './OrdersAssembly.module.css'
const OrdersAssembly = ({ selectedOrder, onOrderSelect }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const result = await window.api.getAllOrders();
                setOrders(result);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);

    const handleOrderSelect = (orderId) => {
        onOrderSelect(orderId); // Notify parent component about the selected order
    };

    return (
        <div className={OAStyles.container}>
            <h2>Заказы</h2>
            {isLoading ? (
                <p>Загружаю...</p>
            ) : (
                <FormControl component="fieldset">
                    <FormLabel component="legend">Выберите заказ</FormLabel>
                    <RadioGroup aria-label="orders" name="orders" value={selectedOrder} onChange={(e) => handleOrderSelect(e.target.value)}>
                        {orders.length === 0 ? (
                            <p>На данный момент нет заказов</p>
                        ) : (
                            <ul className={OAStyles.ordersList}>
                                {orders.map(order => (
                                    <li key={order.id} className={OAStyles.orderItem}>
                                        <FormControlLabel
                                        className={OAStyles.orderLabel}
                                            value={order.id}
                                            control={<Radio className={OAStyles.orderRadio} />}
                                            label={`Создатель заказа: ${order.userName}, Дата создания заказа: ${order.startDate}, Получатель: ${order.orderTo}`}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </RadioGroup>
                </FormControl>
            )}
        </div>
    );
};

export default OrdersAssembly;
