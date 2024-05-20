import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import React, { useState, useEffect, useRef } from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import OAStyles from './OrdersAssembly.module.css';
import axios from 'axios';

const OrdersAssembly = ({ selectedOrder, onOrderSelect }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstOrderVisible, setIsFirstOrderVisible] = useState(false);
    const [isLastOrderVisible, setIsLastOrderVisible] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);

    const containerRef = useRef(null);
    const firstOrderRef = useRef(null);
    const lastOrderRef = useRef(null);  

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // const result = await window.api.getAllOrders();
                const result = await axios.get('http://localhost:3001/orders');
                setOrders(result);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);


    useEffect(() => {
        // Функция обработки события прокрутки
        const handleScroll = () => {
            // Получаем ссылку на контейнер
            const container = containerRef.current;
            if (container) {
                // Проверяем видимость первого элемента
                if (firstOrderRef.current) {
                    // Получаем прямоугольник (bounding rect) первого элемента и контейнера
                    const firstOrderRect = firstOrderRef.current.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    // Устанавливаем состояние isFirstOrderVisible в зависимости от видимости первого элемента в контейнере
                    setIsFirstOrderVisible(
                        !(firstOrderRect.top >= containerRect.top && firstOrderRect.bottom <= containerRect.bottom)
                    );
                }
                // Проверяем видимость последнего элемента
                if (lastOrderRef.current) {
                    // Получаем прямоугольник (bounding rect) последнего элемента и контейнера
                    const lastOrderRect = lastOrderRef.current.getBoundingClientRect();

                    const containerRect = container.getBoundingClientRect();
                    // Устанавливаем состояние isLastOrderVisible в зависимости от видимости последнего элемента в контейнере
                    setIsLastOrderVisible(
                        !(lastOrderRect.top >= containerRect.top && lastOrderRect.bottom <= containerRect.bottom)
                    );
                }
            }
        };
        // Получаем ссылку на контейнер
        const container = containerRef.current;
        if (container) {
            // Добавляем слушатель события прокрутки к контейнеру
            container.addEventListener('scroll', handleScroll);
            // Возвращаем функцию очистки слушателя события при размонтировании компонента или обновлении зависимостей
            return () => {
                container.removeEventListener('scroll', handleScroll);
            };
        }
    }, [orders]); // Зависимость от изменения переменной orders
    

    const handleOrderSelect = (orderId) => {
        onOrderSelect(orderId);
    };

    const scrollToTop = () => {
        containerRef.current.scrollTo({ top: scrollPosition - 100, behavior: 'smooth' });
    }

    const scrollToBottom = () => {
        const container = containerRef.current;
        const containerHeight = container.clientHeight;
        container.scrollTo({ top: container.scrollHeight - containerHeight, behavior: 'smooth' });
    }
    
    return (
        <div>
            {isFirstOrderVisible &&
                <div className={OAStyles.arrowTop} onClick={scrollToTop}>
                <ArrowUpward  />
                </div>
            }
            <div className={OAStyles.container} ref={containerRef}>
                {isLoading ? (
                    <p>Загружаю...</p>
                ) : (
                    <FormControl component="fieldset">
                        <RadioGroup aria-label="orders" name="orders" value={selectedOrder} onChange={(e) => handleOrderSelect(e.target.value)}>
                            {orders.data.length === 0 ? (
                                <p>На данный момент нет заказов</p>
                            ) : (
                                <div className={OAStyles.scrollableContainer}>
                                    {orders.data.map((order, index) => (
                                        <div
                                            key={order.id}
                                            className={`${OAStyles.orderCard} ${selectedOrder === order.id ? OAStyles.selected : ''}`}
                                            ref={index === 0 ? firstOrderRef : index === orders.data.length - 1 ? lastOrderRef : null}
                                            onClick={() => handleOrderSelect(order.id)}
                                        >
                                            <FormControlLabel
                                                control={<Radio />}
                                                value={order.id}
                                                label={
                                                    <table>
                                                        <tbody>
                                                            <tr>
                                                                <td>Создатель заказа:</td>
                                                                <td>{order.userName}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Дата создания заказа:</td>
                                                                <td>{order.startDate}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Получатель:</td>
                                                                <td>{order.orderTo}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </RadioGroup>
                    </FormControl>
                )}
            </div>
            {isLastOrderVisible &&
                <div className={OAStyles.arrowBottom} onClick={scrollToBottom}>
                    <ArrowDownward  />
                </div>
            }
        </div>
    );
};

export default OrdersAssembly;
