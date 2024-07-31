import React, { useState, useEffect, useRef } from 'react';
import { FormControl, FormControlLabel, Radio, RadioGroup, Select, MenuItem } from '@mui/material';
import OAStyles from './OrdersAssembly.module.css';
import axios from 'axios';
import OrderIcon from '../../images/orderIcon.svg';

/**
 * Order Assembly компонент
 * Отображает список заказов на основе выбранного состояния и значения поиска.
 * Позволяет пользователю выбрать заказ и отобразить его детали.
 *
 * @param {object} props - Свойства компонента
 * @param {string} props.statusCard - Выбранное состояние заказов
 * @param {string} props.searchValue - Значение поиска
 * @param {string} props.selectedOrder - ID выбранного заказа
 * @param {function} props.onOrderSelect - Функция обратного вызова для обработки выбора заказа
 * @returns {JSX.Element} - Отрисованный компонент OrdersAssembly
 */
const OrdersAssembly = ({ statusCard, searchValue, selectedOrder, onOrderSelect }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const containerRef = useRef(null);
    const firstOrderRef = useRef(null);
    const lastOrderRef = useRef(null);  

    /**
     * Получает заказы с сервера и обновляет состояние компонента.
     */
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const result = await axios.get('http://192.168.0.123:3001/orders');
                setOrders(result.data); // Предполагая, что result.data представляет собой массив заказов.
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);

    /**
     * Обрабатывает событие выбора заказа
     * @param {string} orderId - ID выбранного заказа
     */
    const handleOrderSelect = (orderId) => {
        onOrderSelect(orderId);
    };

    /**
     * Вычисляет цвет фона заказа на основе предполагаемой даты окончания.
     * @param {string | null} awaitEndDate -Предполагаемая дата окончания заказа
     * @returns {string} - Цвет фона заказа
     */
    const getOrderBackgroundColor = (order) => {
        if (order.isDone === 1) {
            return 'rgb(46,170,89)';
        }
        else {
            if (!order.awaitEndDate) return '#FFCC00'; // FFCC00

            const endDate = new Date(order.awaitEndDate);
            const dayDiff = (endDate - Date.now()) / (1000 * 3600 * 24);

            if (dayDiff < 0) {
                return '#575D59';  // 575D59
            } else if (dayDiff <= 3) {
                return '#FF3B30';  // FF3B30
            } else {
                return '#FFCC00';  // FFCC00
            }
        }
    };

    /**
     * Фильтрует заказы на основе поискового значения и выбранного состояния.
     * @returns {Array} - Отфильтрованные заказы
     */
    const filteredOrders = orders.filter(order =>
        order.orderTo.toLowerCase().includes(searchValue.toLowerCase())
    );

    /**
     * Сортирует заказы по предполагаемой дате окончания.
     * @returns {Array} - Отсортированные заказы
     */
    const sortedOrders = filteredOrders.sort((a, b) => {
        const aDate = new Date(a.awaitEndDate);
        const bDate = new Date(b.awaitEndDate);
        const currentDate = new Date();

        const aDiff = aDate.getTime() - currentDate.getTime();
        const bDiff = bDate.getTime() - currentDate.getTime();

        return aDiff - bDiff;
    });

    /**
     * Фильтрует заказы на основе выбранного состояния
     * @returns {Array} - Отфильтрованные заказы
     */
    const filteredByStatusOrders = sortedOrders.filter(order => {
        const backgroundColor = getOrderBackgroundColor(order);
        if (statusCard === "1" && backgroundColor === '#575D59') return true;
        if (statusCard === "2" && backgroundColor === '#FF3B30') return true;
        if (statusCard === "3" && backgroundColor === '#FFCC00') return true;
        if (statusCard === "4" && backgroundColor === 'rgb(46,170,89)') return true;
        if (statusCard === "Выберете состояние") return true;
        return false;
    });

    return (
        <div className={OAStyles.cardsDiv}>
            
            <div className={OAStyles.fieldDiv}>
                {isLoading ? (
                    <p>Загружаю...</p>
                ) : (
                    <FormControl component="fieldset" className={OAStyles.container}>
                        <RadioGroup aria-label="orders" name="orders" value={selectedOrder} onChange={(e) => handleOrderSelect(e.target.value)}>
                            {filteredByStatusOrders.length === 0 ? (
                                <div className={OAStyles.gridContainer}>
                                    <p>На данный момент таких заказов нет</p>
                                </div>
                            ) : (
                                <div className={OAStyles.gridContainer}>
                                    {filteredByStatusOrders.map((order, index) => (
                                        <div
                                            key={order.id}
                                            className={`${OAStyles.orderCard} ${selectedOrder === order.id ? OAStyles.selected : ''}`}
                                            // style={{ backgroundColor: getOrderBackgroundColor(order.awaitEndDate) }}
                                            ref={index === 0 ? firstOrderRef : index === filteredByStatusOrders.length - 1 ? lastOrderRef : null}
                                            onClick={() => handleOrderSelect(order.id)}
                                        >
                                            <div className={OAStyles.orderIconContainer}> 
                                                <img src={OrderIcon} /> 
                                            </div>
                                            <div className={OAStyles.orderInfoContainer}> 
                                                <span>{order.userName}</span>
                                                <span>{order.startDate}</span>
                                                <span>{order.orderTo}</span>
                                                <span>{order.awaitEndDate}</span>
                                            </div>
                                            <div className={OAStyles.orderStatusContainer} style={{ backgroundColor: getOrderBackgroundColor(order) }}> 
                                                <div> </div>    
                                            </div>
                                            {/* <FormControlLabel
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
                                                            <tr>
                                                                <td>Ожидаемая дата завершения:</td>
                                                                <td>{order.awaitEndDate}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                }
                                            /> */}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </RadioGroup>
                    </FormControl>
                )}
            </div>
            
        </div>
    );
};

export default OrdersAssembly;
