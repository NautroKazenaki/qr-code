import React, { useEffect, useRef, useState } from 'react';
import PPStyles from './PurchasePage.module.css';
import { AppBar, Toolbar, Button, Box, Typography, Grid, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, InputAdornment, IconButton, Badge, Checkbox, Autocomplete } from '@mui/material';
import { useDrag, useDrop } from 'react-dnd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import axios from 'axios';
import { sendDataToHistory } from '../../utils/addHistory';
import { saveAs } from 'file-saver';
import SendIcon from '@mui/icons-material/Send';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ClearIcon from '@mui/icons-material/Clear';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import * as XLSX from 'xlsx';


const columnTitles = {
    russianOrders: ["К выполнению", "Поиск деталей", "На согласование", "Инвойс", "Подпись директора", "Доставка", "Готово"],
    chineseOrders: ["К выполнению", "Поиск деталей", "На согласование", "Инвойс", "Подпись директора", "Доставка", "Готово"],
    completedOrders: ["Готовые заказы(Рус)", "Готовые заказы (Кит)"]
};

const Stages = {
    1: "К выполнению",
    2: "Поиск деталей",
    3: "На согласование",
    4: "Инвойс",
    5: "Подпись директора",
    6: "Доставка",
    7: "Готово"
};

const ItemType = 'CARD';

/**
 * Перетаскиваемый компонент карточки для страницы PurchasePage.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.id - id карты.
 * @param {string} props.text - текст карты.
 * @param {number} props.index - индекс карты.
 * @param {function} props.moveCardWithinColumn - Функция перемещения карты внутри столбца.
 * @param {string} props.currentColumn - Текущий столбец.
 * @param {function} props.onClick - Обработчик события щелчка мыши.
 * @param {string} props.history - История карты.
 * @returns {JSX.Element} -Отрисованный компонент DraggableCard.
 */
const DraggableCard = ({ id, text, index, moveCardWithinColumn, currentColumn, onClick, history, comments}) => {
    // Хуки React DnD для работы с функцией перетаскивания
    const [{ isDragging }, drag,] = useDrag(() => ({
        type: 'CARD',
        item: { id, index, currentColumn },
        /**
         * Собирает данные о состоянии операции перетаскивания.
         * 
         * @param {Object} monitor - Монитор для операции перетаскивания.
         * @returns {Object} Объект, содержащий состояние операции перетаскивания.
         */
        collect: (monitor) => ({ // Собирает данные о состоянии операции перетаскивания.
            /**
             * Указывает, перетаскивается ли элемент.
             * @type {boolean}
             */
            isDragging: !!monitor.isDragging(), // Указывает, перетаскивается ли элемент.
        }),
    }), [index, currentColumn]);

    const [, drop] = useDrop(() => ({
        accept: 'CARD',
        /**
         * Обработчик события перетаскивания.
         * Перемещает карточку внутри столбца.
         * @param {Object} item - Объект, содержащий информацию о перемещаемой карточке.
         * @param {string} item.id - id карточки.
         * @param {number} item.index - индекс карточки.
         * @param {string} item.currentColumn - Текущий столбец.
         */
        hover: (item) => {
            // Если карточка не перемещается в новый столбец, то пропускаем
            if (item.index !== index || item.currentColumn !== currentColumn) {
                return;
            }

            // Перемещаем карточку внутри столбца
            moveCardWithinColumn(item.index, index, currentColumn);
            item.index = index;
        },
    }), [index, currentColumn]);

    // Разбераем строку истории в массив и получаем последнее действие
    const parsedHistory = JSON.parse(history);
    const lastAction = parsedHistory.length > 0 ? parsedHistory[parsedHistory.length - 1] : null;

    const currentUser = JSON.parse(localStorage.getItem("user")).name;
    const parsedComments = JSON.parse(comments);
    const badgeColor = parsedComments.length > 0 && parsedComments[parsedComments.length - 1].user === currentUser ? 'success' : 'error';

    // Если последнее действие существует, разделяем его на ключ и номер этапа
    let stageKey = '';
    let stageNumber = '';
    try {
        const regex = /user:(.*?), phase:(.*?), date:(.*)/;
        if (lastAction) {
            const matches = lastAction.match(regex);

            const user = matches[1].trim();
            const phase = matches[2].trim();
            // const date = matches[3].trim();

            [stageKey, stageNumber] = lastAction.split(':');
            stageKey = user;
            stageNumber = phase;
        }
    } catch (error) {
        console.error(error)
    }

    // Формат последнего действия
    const lastActionText = stageNumber !== '1' && currentColumn !== Stages[1]
        ? `Последние действия: ${stageKey} - ${Stages[parseInt(stageNumber)]} `
        : '';

    return (
        <>
            {isDragging ? (
                // Перерисовка карты с эффектом движения при перетаскивании

                <motion.div
                    ref={(node) => drag(drop(node))}
                    initial={false}
                    animate={{
                        scale: 1.1,
                        boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.2)",
                        rotate: 5,
                        backgroundColor: 'lightgreen'
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                    }}
                    style={{
                        padding: 16,
                        margin: 8,
                        border: '1px solid gray',
                        borderRadius: 8,
                        cursor: 'move',
                        opacity: 0.7,
                        fontSize: '12px'
                    }}
                >
                    <p>{text}</p>
                    {lastActionText && <p>{lastActionText}</p>}
                </motion.div>

            ) : (
                <>
                 {/* // Отображение карты без эффектов движения при отсутствии перетаскивания */}
                    <Badge color={badgeColor} badgeContent={JSON.parse(comments).length}>
                    <Box
                        ref={drag}
                        onClick={onClick}
                        sx={{
                            padding: 2,
                            margin: 1,
                            backgroundColor: 'white',
                            border: '1px solid gray',
                            borderRadius: 2,
                            cursor: 'move',
                            opacity: isDragging ? 0 : 1,
                            fontSize: '12px'
                        }}
                    >
                        <p>{text}</p>
                        {lastActionText && <p>{lastActionText}</p>}
                    </Box>
                </Badge>
        </>

    )
}
        </>
    );
};

const DroppableColumn = React.memo(({ id, title, cards, moveCard, moveCardWithinColumn, isCompletedOrders, openCardDialog }) => {
    const dropRef = useRef(null);
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemType,
        /**
         * Обработчик события перетаскивания для столбца.
         * Перемещает карточку из одного столбца в другой, если это возможно.
         * @param {Object} item - Объект, содержащий информацию о перемещаемой карточке.
         * @param {string} item.currentColumn - Текущий столбец карточки.
         * @param {string} item.id - id карточки.
         */
        drop: (item) => {
            // Если карточка уже находится в текущем столбце, ничего не делаем
            if (item.currentColumn === title    ) {
                return;
            }

            // В противном случае перемещаем карточку в выбранный столбец
            moveCard(item.id, title);
        },
        /**
         * Собирает информацию о состоянии операции сброса.
         * @param {Object} monitor - Монитор для операции сброса.
         * @returns {Object} Объект, содержащий информацию о состоянии операции сброса.
         */
        collect: (monitor) => ({
            /**
             * Указывает, находится ли предмет в данный момент над целью падения.
             * @type {boolean}
             */
            isOver: !!monitor.isOver(),
        }),
    }), [moveCard, title]);

    useEffect(() => {
        drop(dropRef);
    }, [drop, dropRef]);

    return (
        <Box ref={dropRef} sx={{ width: isCompletedOrders ? '100%' : '220px', height: '91vh', margin: 1, backgroundColor: isOver ? 'lightyellow' : 'transparent' }}>
            <Typography variant="h6" align="center">{title}</Typography>
            <Grid container spacing={1}>
                {cards.map((card, index) => (
                    <Grid item xs={isCompletedOrders ? 4 : 12} key={card.id}>
                        <DraggableCard
                            key={card.id}
                            id={card.id}
                            text={card.text}
                            index={index}
                            moveCardWithinColumn={moveCardWithinColumn}
                            currentColumn={title}
                            onClick={() => openCardDialog(card)}
                            history={card.history}
                            comments={card.comments}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
});

const PurchasePage = () => {
    const [currentCategory, setCurrentCategory] = useState('russianOrders');
    const [purchase, setPurchase] = useState([]);
    const [comment, setComment] = useState("");
    const [checkedDetails, setCheckedDetails] = useState({});
    const [detailsData, setDetailsData] = useState([]);
    const [newDetailName, setDetailName] = useState('');
    const [newQuantity, setQuantity] = useState('');
    const [cards, setCards] = useState({
        russianOrders: [],
        chineseOrders: [],
        completedOrders: []
    });

    /**
     * Обрабатываем изменение количества к заказу для детали карты.
     * Обновляет количество к заказу в карточке.
     *
     * @param {Object} card - карточка.
     * @param {Object} detail - деталь.
     * @param {Event} e - событие.
     */
    const handleOrderQuantityChange = async (card, detail, e) => {
        // Собираем недостающее кол-во деталей для заказа
        let insufficientDetails = JSON.parse(card.insufficientDetails);

        // Находит деталь с тем же именем, что и заданная деталь, и обновляет ее количество в заказе.
        insufficientDetails.forEach(d => {
            if (d.detailName === detail.detailName) {
                d.orderQuantity = Number(e.target.value);
                card.insufficientDetails = JSON.stringify(insufficientDetails);
            }
        });
    };

    /**
     * Обрабатывает изменения в поле ввода количества деталей.
     * Если введенное значение является допустимым числом или пустой строкой, устанавливает состояние на входное значение.
     * Если введенное значение не является допустимым номером, отображает сообщение об ошибке.
     * Если длина ввода составляет 5 символов, отображает сообщение об ошибке.
     * @param {Event} e - Объект события для изменения ввода.
     */
    const handleQuantityChange = (e) => {
        // Получает введенное значение
        const inputValue = e.target.value;

        // Проверяет является ли введенное значение допустимым числом или пустой строкой
        if (/^\d*$/.test(inputValue) || inputValue === '') {
            // Если удовлятворяет условие, обновляет состояние
            setQuantity(inputValue);
        } else {
            // Если не удовлетворяет, отображает сообщение об ошибке
            toast.error('Пожалуйста, введите только цифры.');
        }

        // Проверяет, является ли длина введенного значения 5 символов
        if (inputValue.length === 5) {
            // Если да, отображает сообщение об ошибке
            toast.error('Достигнута максимальная длина имени (5 символов).');
        }
    };

    const customScrollbar = {
        '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgb(0,0,0);',
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
    }

    /**
     * Сохраняет новое количество заказа для выбранной карты.
     *
     * Эта функция выполняет PATCH-запрос к серверу, чтобы обновить количество заказов для выбранной карты.
     * Прежде чем сделать запрос, он проверяет, не является ли количество заказанных деталей меньше требуемого.
     * Если проверка не удалась, он выводит сообщение об ошибке и не выполняет запрос.
     * 
     *
     * 
     * Если запрос успешен, он отправляет сообщение в историю с информацией об обновленной карте и обновляет данные.
     */
    const saveNewOrderQuantity = async () => {
        try {
            // Проверяет, не меньше ли количество заказа для каждой детали, чем требуемое количество
            let insufficientDetails = JSON.parse(selectedCard.insufficientDetails);
            for (let detail of insufficientDetails) {
                if (detail.orderQuantity < detail.quantity) {
                    // Если проверка не удалась, выводит сообщение об ошибке и не выполняет запрос
                    toast.error(`Нельзя заказать ${detail.detailName} в количестве: ${detail.orderQuantity}, это меньше чем требуется: ${detail.quantity}!`);
                    return;
                }
            }
            const card = selectedCard;
            // Выполняет запрос на сервер
            const response = await axios.patch('http://192.168.0.123:3001/purchase/addOrderQuantity', { card });

            // Если запрос успешен, отправляет сообщение в историю и обновляет данные.
            if (response.status === 200) {
                sendDataToHistory(`Обновил количество деталей в: ${selectedCard.text}`)
                fetchData()
                closeCardDialog()
                toast.success('Количество деталей для заказа изменено.');
            }
        } catch (error) {
            // Если произошла ошибка, выводит сообщение об ошибке
            console.error('Ошибка сохранения orderQuantity:', error);
            toast.error('Ошибка сохранения.');
        }
    }

    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    /**
 * Получаем данные с сервера о закупках, обрабатываем их по категориям заказов
 * и обновляет состояние с этими списками.
 *
 * @async
 * @function fetchData
 * @returns {Promise<void>} Возвращает промис, который резолвится, когда данные получены и состояние обновлено.
 */
    const fetchData = async () => {
        try {
            // Добыть уникальные имена деталей(для фильтрации повторов) с сервера и обновить состояние компонента
            const responseDetails = await axios.get('http://192.168.0.123:3001/details')
            const uniqueDetails = Array.from(new Set(responseDetails.data.map(item => item.detailName)));
            setDetailsData(uniqueDetails);

            // Получаем данные с сервера
            const response = await axios.get('http://192.168.0.123:3001/purchase');
            const data = response.data;

            // Обновляем состояние полученными данными
            setPurchase(data);
            console.log('Данные получены:', data);

            // Инициализируем массивы для различных категорий заказов
            const russianOrders = [];
            const chineseOrders = [];
            const completedOrders = [];

            // Обрабатываем каждый заказ и распределяем его по категориям
            for (const order of data) {
                const card = {
                    id: `${order.orderTo}:${order.productName}`,
                    text: `Заказ для: ${order.orderTo}, Плата: ${order.productName}`,
                    phase: order.phase,
                    column: Stages[order.phase],
                    comments: order.comments,
                    files: order.files,
                    history: order.history,
                    insufficientDetails: order.insufficientDetails,
                    country: order.orderCountry,
                    archiveFlag: order.archiveFlag,
                    orderId: order.id
                };

                console.log(JSON.parse(card.insufficientDetails))

                // Сортируем заказы на основе их атрибутов
                if (order.archiveFlag === 1) {
                    completedOrders.push(card);
                } else if (order.orderCountry === 'russia') {
                    russianOrders.push(card);
                } else if (order.orderCountry === 'china') {
                    chineseOrders.push(card);
                }
            }

            // Обновляем состояние с распределенными заказами
            setCards({
                russianOrders,
                chineseOrders,
                completedOrders
            });

            console.log('Карты установлены:', {
                russianOrders,
                chineseOrders,
                completedOrders
            });

        } catch (error) {
            console.error('Ошибка при получении заказов:', error);
        }
    };

    /**
     * Перенос деталей в другую страну.
     */
    const transferDetailsToOtherCountry = async () => {
        try {
            // Берем выбранные детали
            const checkedItems = Object.values(checkedDetails)
                .filter(detail => detail.checked)
                .map(({ detailName, quantity }) => ({ detailName, quantity }));

            // Проверка на наличие выбранных деталей
            if (checkedItems.length === 0) {
                toast.error(`Выберете детали для переноса в ${selectedCard.country === 'russia' ? 'Китай' : 'Россию'}!`);
                return;
            }

            // Создаем новую карточку для другой страны из выбранной
            const newCard = JSON.parse(JSON.stringify(selectedCard));

            // Удаляем перенесённые детали из оригинальной карточки
            const updatedCard = selectedCard;
            const DetailsToFilter = JSON.parse(updatedCard.insufficientDetails);
            const updatedDetails = DetailsToFilter.filter(insufficientDetail =>
                !checkedItems.some(checkedItem =>
                    checkedItem.detailName === insufficientDetail.detailName &&
                    checkedItem.quantity === insufficientDetail.quantity
                )
            );
            updatedCard.insufficientDetails = JSON.stringify(updatedDetails);

            // Обновление списка деталей в оригинальной карточке
            const card = updatedCard;
            const response2 = await axios.patch('http://192.168.0.123:3001/purchase/addOrderQuantity', { card });

            // Если перенесли все детали в другую страну, копируем данные старой карточки в новую
            if (updatedDetails.length === 0) {
                newCard.phase = 1;
                newCard.column = "К выполнению";
                newCard.country = selectedCard.country === 'russia' ? 'china' : 'russia';
                setDialogOpen(false);
            } else {
                // Если перенесли не все, формируем новые данные
                newCard.archiveFlag = 0;
                newCard.phase = 1;
                newCard.column = "К выполнению";
                newCard.comments = JSON.stringify([]);
                newCard.history = JSON.stringify([]);
                newCard.files = JSON.stringify([]);
                newCard.country = selectedCard.country === 'russia' ? 'china' : 'russia';
            }

            // Добавляем в новую карточку только выбранные детали
            const DetailsForNewCard = JSON.parse(newCard.insufficientDetails);
            const updatedDetailsForNewCard = DetailsForNewCard.filter(insufficientDetail =>
                checkedItems.some(checkedItem =>
                    checkedItem.detailName === insufficientDetail.detailName &&
                    checkedItem.quantity === insufficientDetail.quantity
                )
            );
            newCard.insufficientDetails = JSON.stringify(updatedDetailsForNewCard);

            // Добавляем новоую карточку в базу данных
            const response1 = await axios.put('http://192.168.0.123:3001/purchase/addNewCard', { newCard });

            if (response1.status === 200 && response2.status === 200)
            {
                toast.success(`Выбранные детали отправлены в ${newCard.country === 'russia' ? 'Российские' : 'Китайские'} заказы.`)
                fetchData();
            }
        } catch (error) {
            console.error('Error transferDetailsToOtherCountry', error)
        }
    }

    // const exportExcel = async () => {
    //     console.log('exportExcel')
    // }

    const handleDeleteDetail = async () => {
        try {
            const checkedItems = Object.values(checkedDetails)
                .filter(detail => detail.checked)
                .map(({ detailName, quantity }) => ({ detailName, quantity }));

            let insufficientDetails = JSON.parse(selectedCard.insufficientDetails);
            
            if (checkedItems.length === 0)
            {
                toast.error('Выберете детали для удаления!');
                return;
            }
            
            const updatedInsufficientDetails = insufficientDetails.filter(insufficientDetail =>
                !checkedItems.some(checkedItem =>
                    checkedItem.detailName === insufficientDetail.detailName &&
                    checkedItem.quantity === insufficientDetail.quantity
                )
            );

            const updatedCard = selectedCard;
            updatedCard.insufficientDetails = JSON.stringify(updatedInsufficientDetails);

            const card = updatedCard;
            const response = await axios.patch('http://192.168.0.123:3001/purchase/addOrderQuantity', { card });

            const detailNames = checkedItems.map(item => item.detailName);
            const detailsNamesString = detailNames.join(', ');
            const [orderTo, productName] = card.id.split(':');
            
            if (response.status === 200) {
                setCheckedDetails({})
                sendDataToHistory(`Удалил детали: ${detailsNamesString} из заказа для: ${orderTo}, плата ${productName}`)
                fetchData()
                toast.success('Выбранные детали успешно удалены.');
            } else {
                toast.error('Ошибка удаления деталей.');
            }
        } catch (error) {
            console.error(error)
        }
    }

    // const handleAddDetail = async () => {
    //     console.log('handleAddDetail')
    // }

    /**
     * Перемещает карту в другую колонку в текущей категории.
     *
     * @param {string} cardId - id карты, которую нужно переместить.
     * @param {string} targetColumnTitle - Название столбца, в который нужно переместить карточку.
     * @returns {Promise<void>} - Промис, которое разрешается, когда карта была перемещена.
     */
    const moveCard = async (cardId, targetColumnTitle) => {
        if (currentCategory === 'completedOrders') {
            return;
        }
        // // Ищем карту, которую нужно переместить
        // const thatCard = cards[currentCategory].find(card => card.id === cardId);
        // if (thatCard.archiveFlag === 1) {
        //     return;
        // }
        // Берем информацию о пользователе из локального хранилища
        const user = JSON.parse(localStorage.getItem('user'));
        const username = user?.name || 'Unknown'; // По умолчанию 'Unknown', если имя пользователя недоступно.

        // Разделяем id карты, чтобы извлечь orderTo и productName
        const [orderTo, productName] = cardId.split(':');

        // Ищем карту, которую нужно переместить
        const sourceColumn = cards[currentCategory].find(card => card.id === cardId);

        // Проверяем, является ли текущая категория завершенными заказами
        if (currentCategory === 'completedOrders') {
            // Выводим сообщение об ошибке и досрочный возврат, если карту невозможно переместить
            toast.error("Нельзя перемещать карточки в готовых заказах.");
            return;
        }

        // Находим индексы исходного и целевого столбцов
        const sourceColumnIndex = columnTitles[currentCategory].indexOf(sourceColumn.column);
        const targetColumnIndex = columnTitles[currentCategory].indexOf(targetColumnTitle);
        const orderCountry = sourceColumn.country;
        debugger
        if (targetColumnIndex === sourceColumnIndex + 1) {
            // Отправляем запрос на исправление, чтобы обновить фазу карты и добавить запись в историю
            await axios.patch('http://192.168.0.123:3001/purchase', { cardId, username, orderCountry, direction: 'forward' });
            sendDataToHistory(`Перенес заказ для ${orderTo}, плата ${productName} на стадию ${Stages[targetColumnIndex + 1]}`);
        } else if (targetColumnIndex === sourceColumnIndex - 1) {
            // Отправляем другой запрос на сервер при перемещении на один столбец назад
            await axios.patch('http://192.168.0.123:3001/purchase', { cardId, username, orderCountry, direction: 'backward' });    
            sendDataToHistory(`Вернул заказ для ${orderTo}, плата ${productName} на стадию ${Stages[targetColumnIndex + 1]}`);
        }  else if (targetColumnIndex > sourceColumnIndex + 1) {
            // Отображаем сообщения об ошибке, если карточку нельзя переместить в столбец больше чем на 1 вперед
            toast.error("Нельзя перемещать карточку больше чем на один столбец вперед или назад");
        }

        // Обновляем состояние с новыми картами
        setCards(prevCards => {
            const newCards = { ...prevCards };
            const cardIndex = newCards[currentCategory].indexOf(sourceColumn);
            newCards[currentCategory].splice(cardIndex, 1);
            const newCard = { ...sourceColumn, column: targetColumnTitle };
            newCards[currentCategory].splice(targetColumnIndex, 0, newCard);
            return newCards;
        });

        // Получение обновленных данных
        await fetchData();
    };

    /**
     * Перемещение карты в пределах столбца в текущей категории.
     *
     * @param {number} sourceIndex - Индекс перемещаемой карты.
     * @param {number} targetIndex - Целевой индекс перемещаемой карты.
     * @param {string} columnId - Идентификатор столбца, к которому принадлежит карта.
     */
    const moveCardWithinColumn = (sourceIndex, targetIndex, columnId) => {
        if (columnId === 'Готовые заказы(Рус)' || columnId === 'Готовые заказы (Кит)') {
            return;
        }
        console.log(columnId)
        // Обновляем состояние карточек, перемещая их в пределах столбца
        setCards(prev => {
            const newCards = { ...prev }; // Создаем копию состояния карты
            const currentCategoryCards = newCards[currentCategory] // Получаем карты текущей категории
                .filter(card => card.column === columnId); // Фильтруем карты, принадлежащие целевому столбцу

            // Перемещаем карточку из исходного индекса в целевой индекс
            const [movedCard] = currentCategoryCards.splice(sourceIndex, 1);
            currentCategoryCards.splice(targetIndex, 0, movedCard);

            // Обновите состояние карт, добавив перемещенную карту и оставшиеся карты
            newCards[currentCategory] = [
                ...newCards[currentCategory].filter(card => card.column !== columnId), // Убераем карту из целевого столбца
                ...currentCategoryCards // Добавляем перемещенную карту и оставшиеся карты обратно в состояние
            ];

            return newCards; // Возвращаем обновленное состояние карты
        });
    };

    /**
     * Открывает диалоговое окно для указанной карточки.
     *
     * @param {Object} card - Карточка, для которой открывается диалоговое окно.
     */
    const openCardDialog = (card) => {
        // Устанавливаем выбранную карточку
        setSelectedCard(card);
        setCheckedDetails({})
        // Открываем диалоговое окно
        setDialogOpen(true);
    };

    /**
     * Открывает диалоговое окно для добавления деталей.
     */
    const openDetailsDialog = () => {
        // Открываем диалоговое окно
        setDetailsDialogOpen(true);
    };

    /**
     * Добавляет выбранную деталь в карточку.
     */
    const addNewDetailToCard = async () => {
        try {
            // Проверка на выбранную детали
            if (newDetailName === '') {
                toast.error('Введите название детали!');
                return;
            }

            // Проверка на введённое количество
            if (newQuantity === '') {
                toast.error('Введите количество!');
                return;
            }

            // Формируем деталь из выбранных параметров
            const newDetail = {
                detailName: newDetailName,
                quantity: Number(newQuantity),
                orderQuantity: Number(newQuantity)
            }

            // Добавляем деталь в выбранную карточку
            let insufficientDetails = JSON.parse(selectedCard.insufficientDetails);
            const updatedInsufficientDetails = insufficientDetails.concat(newDetail)
            selectedCard.insufficientDetails = JSON.stringify(updatedInsufficientDetails)

            // Обновляем список деталей у выбранной карточки на сервере
            const card = selectedCard;
            const response = await axios.patch('http://192.168.0.123:3001/purchase/addOrderQuantity', { card });

            // Если запрос на север успешный
            if (response.status === 200) {
                // Делаем пустыми поля с выбором детали и количества
                setDetailName('');
                setQuantity('');

                // Запись в историю о добавленных деталей
                const [orderTo, productName] = card.id.split(':');
                sendDataToHistory(`Добавил деталь: ${newDetailName} в количестве: ${Number(newQuantity)}. В заказ для: ${orderTo}, плата ${productName}`)
                
                // Уведомление об успешном добавлении детали
                toast.success(`Добавлена деталь: ${newDetailName} в количестве: ${Number(newQuantity)}`);
                // Обновляем данные
                fetchData();
            } else {
                // Уведомление об успешном добавлении детали
                toast.error('Ошибка добавления детали!');
            }
        } catch (error) {
            toast.error('Ошибка добавления детали!');
            console.error('Error in addNewDetailToCard:', error);
        }
    }

    /**
     * Закрывает диалоговое окно для выбранной карточки.
     */
    const closeCardDialog = () => {
        // Закрываем диалоговое окно
        setDialogOpen(false);

        // Устанавливаем null в выбранную карточку
        setSelectedCard(null);
    };

    /**
     * Закрывает диалоговое окно для добавления деталей.
     */
    const closeDetailsDialog = () => {
        // Закрываем диалоговое окно
        setDetailsDialogOpen(false);
    };

    /**
     * Создает отчет Excel на основе заданных данных.
     *
     * @param {Array} props - Данные, которые необходимо преобразовать в рабочий лист.
     * @param {string} listName - Имя рабочего листа.
     * @param {string} fileName - Имя выходного файла.
    */
    const createReportExcel = (props, listName, fileName) => {
        try {
            const details = JSON.parse(props);

            // Преобразование данных в формат для Excel
            const data = details.map((detail) => ({
                "Название детали": detail.detailName,
                "Требуемое количество для сборки": detail.quantity,
                "Необходимо заказать": detail.orderQuantity,
            }));

            // Преобразование данных в рабочий лист
            const worksheet = XLSX.utils.json_to_sheet(data);

            // Устанавливает ширину столбцов
            const columnWidths = [
                { wch: 60 }, // Название детали
                { wch: 30 }, // Заказанное количество
                { wch: 20 }, // Количество
            ];

            worksheet['!cols'] = columnWidths;

            // Создает новую таблицу
            const workbook = XLSX.utils.book_new();

            // Добавить лист в файл
            XLSX.utils.book_append_sheet(workbook, worksheet, listName);

            // Записать таблицу в файл
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            toast.error('Не удалось сохранить файл')
            console.error('Error createReportExcel:', error);
        }
    };

    /**
         * Выполняет смену текущей вкладки.
         * Эта функция обновляет текущее состояние индекса вкладки новым значением.
         *
         * @param {Object} event - событие
         * @param {number} newValue - Индекс новой вкладки, который необходимо установить.
         */
    const handleTabChange = (event, newValue) => {
        // Обновляем состояние индекса вкладок новым значением
        setTabIndex(newValue);
    };

    // const handleDetailChange = (event) => {
    //     const { name, value } = event.target;
    //     setSelectedCard((prevCard) => ({
    //         ...prevCard,
    //         insufficientDetails: {
    //             ...prevCard.insufficientDetails,
    //             [name]: value
    //         }
    //     }));
    // };

    /**
     * Отправляет заказ в архив.
     * Эта функция выполняет запрос к серверу для обновления статуса заказа в архиве.
     *
     * @return {Promise<void>} Промис, который возвращается, когда функция завершается.
     */
    const sendToArchive = async () => {
        try {
            const country = selectedCard.country;
            const response = await axios.patch(`http://192.168.0.123:3001/purchase/${selectedCard.id}/archive`, { country });

            if (response.status === 200) {
                sendDataToHistory(`Добавил ${selectedCard.text} в архив`)
                fetchData()
                closeCardDialog()
                toast.success('Заказ отправлен в архив.');
            }
            else {
                toast.error('Заказ не отправлен в архив.');
            }
        } catch (error) {
            // Записываем ошибку в консоль
            console.error('Error sending card to archive:', error);
            // Отображаем сообщение об ошибке отправки заказа в архив
            toast.error('Ошибка отправки заказа в архив.');
        }
    };

    /**
     * Загружает выбранный файл на сервер.
     * Эта функция отправляет запрос на сервер для загрузки выбранного файла.
     *
     * @param {Object} event - событие
     * @return {Promise<void>} Обещание, которое выполняется после завершения функции.
     */
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            /**
             * Отправляет запрос на сервер для загрузки файла.
             * Запрос представляет собой PATCH-запрос к серверу с прикрепленным файлом.
             * Сервер вернет код состояния 200, если загрузка прошла успешно.
             */
            const response = await axios.patch(`http://192.168.0.123:3001/purchase/${selectedCard.id}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to upload file.');
            }

            // Показывает пользователю сообщение об успехе
            toast.success(`Файл ${file.name} загружен.`);
        } catch (error) {
            // Показывает пользователю сообщение об ошибке, если при загрузке файла произошла ошибка
            console.error('Error uploading file:', error);
            toast.error('Ошибка загрузки файла.');
        }
    };
    /**
     * Загружает с сервера файл с заданным именем.
     * Эта функция отправляет запрос на сервер для загрузки файла.
     *
     * @param {string} fileName - Имя файла для загрузки.
     * @return {Promise<void>} Промис, которое разрешается после завершения функции.
     */
    const handleFileDownload = async (fileName) => {
        try {
            // Отправляет GET-запрос на сервер, чтобы загрузить файл
            const response = await axios.get(`http://192.168.0.123:3001/purchase/download/${fileName}`, {
                responseType: 'blob',
            });

            // Создает объект Blob из данных ответа
            const blob = new Blob([response.data]);

            // Сохраняет Blob в файл с заданным именем
            saveAs(blob, fileName);

            // Показывает пользователю сообщение об успехе
            toast.success(`File ${fileName} downloaded.`);
        } catch (error) {
            // Показывает пользователю сообщение об ошибке, если при загрузке файла произошла ошибка
            console.error('Error downloading file:', error);
            toast.error('Error downloading file.');
        }
    };

    /**
  * Обрабатывает отправку комментария, отправляет новый комментарий на сервер,
  * обновляет историю действий, обновляет данные и закрывает диалог карточки.
  *
  * @async
  * @function handleCommentSubmit
  * @returns {Promise<void>} Возвращает промис, который резолвится при успешной отправке комментария и обновлении данных.
  */
    const handleCommentSubmit = async () => {
        try {
            // Проверка на пустой комментарий
            if (comment.length === 0) {
                toast.error('Введите комментарий!');
                return;
            }

            // Получаем данные пользователя из localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            const username = user?.name || 'Unknown';

            // Получаем текущие дату и время
            const now = new Date();

            // Формат дня
            const day = String(now.getDate()).padStart(2, '0');

            // Формат месяца (январь равен 0)
            const month = String(now.getMonth() + 1).padStart(2, '0');

            // Формат года
            const year = now.getFullYear();

            // Формат часов
            const hours = String(now.getHours()).padStart(2, '0');

            // Формат минут
            const minutes = String(now.getMinutes()).padStart(2, '0');

            // Формат секунд
            const seconds = String(now.getSeconds()).padStart(2, '0');

            const date = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;

            // Создаем объект нового комментария
            const newComment = {
                user: username,
                text: comment,
                date: date,
            };
            
            // Создаем переменную содержащую страну карточки
            const country = selectedCard.country;

            // Отправляем новый комментарий на сервер
            const response = await axios.patch(`http://192.168.0.123:3001/purchase/${selectedCard.id}/comment`, { newComment, country });

            // Проверяем успешность ответа сервера
            if (response.status === 200) {
                // Отправляем данные в историю действий
                sendDataToHistory(`Добавил в: ${selectedCard.text} комментарий: ${newComment.text}`);
                axios.post('http://192.168.0.123:3001/notification', {message: `${username} Добавил в: ${selectedCard.text} комментарий: ${newComment.text}`});

                // Обновляем данные
                fetchData();

                // Сбрасываем комментарий
                setComment("");

                // Вставляем введённый комментарий в таблицу
                let currentComments = [];
                currentComments = JSON.parse(selectedCard.comments);
                currentComments.push(newComment);
                selectedCard.comments = JSON.stringify(currentComments);
            }
        } catch (error) {
            // Обрабатываем ошибку при отправке комментария
            console.error('Ошибка при отправке комментария:', error);
            toast.error('Ошибка добавления комментария.');
        }
    };

    const handleCheckboxChange = (detail) => (event) => {
        const { detailName, quantity } = detail;
    
        const newCheckedDetails = {
            ...checkedDetails,
            [detailName]: {
                detailName,
                quantity,
                checked: event.target.checked,
            }
        };
    
        setCheckedDetails(newCheckedDetails);
    };
    

    return (
        <Box sx={{ display: 'flex', height: '93vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Button
                        color="inherit"
                        onClick={() => setCurrentCategory('russianOrders')}
                        className={currentCategory === 'russianOrders' ? PPStyles.activeButton : ''}>
                        Русские заказы
                    </Button>
                    <Button
                        color="inherit"
                        onClick={() => setCurrentCategory('chineseOrders')}
                        className={currentCategory === 'chineseOrders' ? PPStyles.activeButton : ''}>
                        Китайские заказы
                    </Button>
                    <Button
                        color="inherit"
                        onClick={() => setCurrentCategory('completedOrders')}
                        className={currentCategory === 'completedOrders' ? PPStyles.activeButton : ''}>
                        Готовые заказы
                    </Button>
                </Toolbar>
            </AppBar>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '93vh' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '93vh' }}>
                    <Grid container sx={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
                        {columnTitles[currentCategory].map((title, index) => {
                            let cardsToDisplay = [];

                            if (currentCategory === 'completedOrders') {
                                if (title === "Готовые заказы(Рус)") {
                                    cardsToDisplay = cards.completedOrders.filter(card => card !== undefined && card.country === 'russia');
                                } else if (title === "Готовые заказы (Кит)") {
                                    cardsToDisplay = cards.completedOrders.filter(card => card !== undefined && card.country === 'china');
                                }
                            } else {
                                cardsToDisplay = cards[currentCategory].filter(card => card.column === title);
                            }

                            return (
                                <DroppableColumn
                                    key={index}
                                    title={title}
                                    cards={cardsToDisplay}
                                    moveCard={moveCard}
                                    moveCardWithinColumn={moveCardWithinColumn}
                                    isCompletedOrders={currentCategory === 'completedOrders'}
                                    openCardDialog={openCardDialog}
                                />
                            );
                        })}
                    </Grid>
                </Box>
            </Box>
            <Dialog open={dialogOpen} onClose={closeCardDialog} PaperProps={{ style: { overflow: 'hidden', minWidth: '100vh', minHeight: '85vh', maxHeight: '85vh' } }}>
                <DialogTitle sx={{ maxWidth: '90%'}}>{selectedCard?.text}</DialogTitle>
                <DialogContent sx={{ overflow: 'hidden' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} className={PPStyles.tabsContainer}
                        sx={{
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'rgb(0, 108, 42)', // Change to your desired color
                            },
                        }}
                    >
                        <Tab label="Детали" />
                        <Tab label="Файлы" />
                        <Tab label="Комментарии" />
                        <Tab label="История" />
                    </Tabs>
                    {tabIndex === 0 && selectedCard && (
                        <Box>
                            <TableContainer component={Paper}>
                            <Box sx={{ maxHeight: '66.6vh', overflow: 'auto',...customScrollbar }}>
                                <Table className={PPStyles.tableContainer}>
                                    <TableHead
                                        sx={{
                                            position: 'sticky',
                                            top: 0,
                                            backgroundColor: 'white',
                                            zIndex: 1,
                                        }}>
                                        <TableRow>
                                            <TableCell sx={{ width: '70%' }}>Название</TableCell>
                                            {(selectedCard.phase === 1 || selectedCard.phase === 2) && (<TableCell>Требуется</TableCell>)}
                                            {selectedCard.phase !== 1 && (<TableCell>Заказать</TableCell>)}
                                            {selectedCard.phase !== 0 && <TableCell></TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {JSON.parse(selectedCard?.insufficientDetails).map((detail, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {detail.detailName}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography>{(selectedCard.phase === 1 || selectedCard.phase === 2) ? detail.quantity : detail.orderQuantity}</Typography>
                                                </TableCell>
                                                {selectedCard.phase === 2 && (
                                                    <TableCell>
                                                        <TextField
                                                            type="number"
                                                            defaultValue={detail.orderQuantity}
                                                            onChange={(e) => handleOrderQuantityChange(selectedCard, detail, e)}
                                                            inputProps={{ min: detail.quantity }}
                                                        />
                                                    </TableCell>
                                                )}
                                                {selectedCard.phase !== 0 && <TableCell>
                                                    <Checkbox checked={!!checkedDetails[detail.detailName]?.checked} onChange={handleCheckboxChange(detail)}></Checkbox>
                                                </TableCell>}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                </Box>
                            </TableContainer>
                            {selectedCard.archiveFlag === 0 && <Box sx={{
                                bottom: '2.5vh',
                                position: 'absolute',
                                minWidth: '95.5%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Button variant="contained" component="label" className={PPStyles.button} onClick={openDetailsDialog}>
                                    <AddIcon />
                                    <SettingsApplicationsIcon />
                                </Button>
                                <Button variant="contained" component="label" className={PPStyles.button} onClick={handleDeleteDetail}>
                                    <DeleteForeverIcon />
                                    <SettingsApplicationsIcon />
                                </Button>
                                <Button variant="contained" component="label" className={PPStyles.button} onClick={() => createReportExcel(selectedCard.insufficientDetails, 'Отчёт', `Детали.xlsx`)}>
                                    Экспорт в EXCEL
                                </Button>
                                {selectedCard.country === 'russia' 
                                    ? (<Button variant="contained" component="label" onClick={transferDetailsToOtherCountry} className={PPStyles.button}>Перенести в Китай</Button>) 
                                    : (<Button variant="contained" component="label" onClick={transferDetailsToOtherCountry} className={PPStyles.button}>Перенести в РФ</Button>)}
                                {selectedCard.phase === 2 && (<Button variant="contained" component="label" onClick={saveNewOrderQuantity} className={PPStyles.button}>
                                    Сохранить
                                </Button>)}
                                {selectedCard?.phase === 7 && <Button variant="contained" component="label" onClick={sendToArchive} className={PPStyles.button}>Отправить в готовые заказы</Button>}
                            </Box>}
                        </Box>
                    )}
                    {tabIndex === 1 && selectedCard && (
                        <Box>
                            {selectedCard.phase !== 0 && (<Button variant="contained" component="label" className={PPStyles.button} sx={{
                                    bottom: '2.5vh',
                                    position: 'absolute',
                                    minWidth: '95.5%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                Загрузить файл
                                <input type="file" hidden onChange={handleFileUpload} />
                            </Button>)}
                            {selectedCard?.files && JSON.parse(selectedCard.files).length > 0 ? (
                                JSON.parse(selectedCard.files).map((file, index) => (
                                    <Box key={index}>
                                        <Button variant="outlined" onClick={() => handleFileDownload(file)}>
                                            Скачать {file}
                                        </Button>
                                    </Box>
                                ))
                            ) : (
                                <Box
                                    sx={{
                                        alignSelf: 'center',
                                        marginTop: '5vh',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: '100%',
                                        height: '100%',
                                        boxShadow: 'none'
                                    }}>
                                    Файлов нет
                                </Box>
                            )}
                        </Box>
                    )}
                    {tabIndex === 2 && selectedCard && (
                        <Box display="flex" flexDirection="column" height="100%">
                            <Box sx={{ overflow: 'auto', maxHeight: '66.6vh'}} >
                                {JSON.parse(selectedCard?.comments).length > 0 ? (
                                    <TableContainer component={Paper}>
                                        <Box sx={{ maxHeight: '66.6vh', overflow: 'auto',...customScrollbar }}>
                                            <Table className={PPStyles.tableContainer} sx={{ minWidth: 650 }}>
                                                <TableHead sx={{
                                                    position: 'sticky',
                                                    top: 0,
                                                    backgroundColor: 'white',
                                                    zIndex: 1,
                                                }}>
                                                    <TableRow>
                                                        <TableCell>Автор</TableCell>
                                                        <TableCell>Комментарий</TableCell>
                                                        <TableCell>Дата</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody sx={{ maxHeight: '61.2vh', overflowY: 'auto' }}>
                                                    {JSON.parse(selectedCard.comments).map((comment, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{comment.user}</TableCell>
                                                            <TableCell>{comment.text}</TableCell>
                                                            <TableCell>{comment.date}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Box>
                                    </TableContainer>
                                ) : (
                                    <Box
                                        sx={{
                                            alignSelf: 'center',
                                            marginTop: '5vh',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: '100%',
                                            height: '100%',
                                            boxShadow: 'none'
                                        }}>
                                        Комментариев нет
                                    </Box>
                                )}
                            </Box>
                            <Box
                                component="form"
                                sx={{
                                    bottom: '2.2vh',
                                    position: 'absolute',
                                    minWidth: '95.5%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                {selectedCard.phase !== 0 && (
                                    <TextField
                                        className={PPStyles.textField}
                                        name="comment"
                                        onChange={(e) => setComment(e.target.value)}
                                        value={comment}
                                        label="Добавить комментарий"
                                        fullWidth
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment>
                                                    <IconButton type="button" color="primary" onClick={handleCommentSubmit} sx={{ top: '0vh', right: '0vh' }}>
                                                        <SendIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ flexGrow: 1 }}
                                    />
                                )}
                            </Box>
                        </Box>
                    )}
                    {tabIndex === 3 && selectedCard?.history && (
                        <Box sx={{ overflow: 'auto', maxHeight: '72vh', mt: '0' }}>
                            {JSON.parse(selectedCard?.history).length > 0 ? (
                                <TableContainer component={Paper}>
                                    <Table className={PPStyles.tableContainer}>
                                        <TableHead sx={{
                                            position: 'sticky',
                                            top: 0,
                                            backgroundColor: 'white',
                                            zIndex: 1
                                        }}>
                                            <TableRow>
                                                <TableCell>Пользователь</TableCell>
                                                <TableCell>Действие</TableCell>
                                                <TableCell>Когда</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {JSON.parse(selectedCard.history).map((history, index) => {
                                                const [userPart, phasePart, datePart] = history.split(', ');

                                                // Извлекаем значения из каждой части
                                                const user = userPart.split(':')[1].trim();
                                                const phase = phasePart.split(':')[1].trim();
                                                const date = datePart.substring(5).trim();

                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell>{user}</TableCell>
                                                        <TableCell>Перевёл на этап: {phase}</TableCell>
                                                        <TableCell>{date}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : <Box
                                sx={{
                                    alignSelf: 'center',
                                    marginTop: '5vh',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '100%',
                                    height: '100%',
                                    boxShadow: 'none'
                                }}>
                                Истории нет
                            </Box>}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeCardDialog} color="primary" sx={{ top: 0, right: 0, position: 'absolute', margin: 0 }}>
                        <CloseRoundedIcon />
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={detailsDialogOpen} onClose={closeDetailsDialog} PaperProps={{ style: { overflow: 'hidden', minWidth: '95vh', minHeight: '10vh', maxHeight: '10vh' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: '2vh', mb: '2vh', ml: '1vh', mr: '1vh' }}>
                    <Autocomplete
                        freeSolo
                        sx={{ width: '70vh' }}
                        options={detailsData}
                        value={newDetailName}
                        filterOptions={(options, state) => {
                            return options.filter(option => option.toLowerCase().includes(state.inputValue.toLowerCase().trim()));
                        }}
                        onChange={(event, newValue) => {
                            if (newValue && !detailsData.includes(newValue.trim())) {
                                setDetailName(newValue.trim());
                            } else {
                                setDetailName(newValue || '');
                            }
                        }}
                        onInputChange={(event, newInputValue) => {
                            setDetailName(newInputValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                color="success"
                                id="standard-basic"
                                label="Название детали"
                                variant="filled"
                                inputProps={{ ...params.inputProps, maxLength: 150 }}
                                onChange={(e) => {
                                    setDetailName(e.target.value);
                                    if (e.target.value.length === 150) {
                                        toast.error("Достигнута максимальная длина имени (150 символов).");
                                    }
                                }}
                                sx={{
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-underline:after': {
                                        borderBottomColor: 'rgb(0, 108, 42)',
                                    },
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: 'white',
                                        '&:hover': {
                                            backgroundColor: 'white',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'white',
                                            '& fieldset': {
                                                borderColor: 'rgb(0, 108, 42) !important',
                                            },
                                        },
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'rgb(0, 108, 42)',
                                    },
                                }}
                            />
                        )}
                    />
                    <TextField
                        color="success"
                        label="Количество"
                        value={newQuantity}
                        onChange={handleQuantityChange}
                        variant="filled"
                        sx={{
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: 'rgb(0, 108, 42)',
                            },
                            '& .MuiFilledInput-underline:after': {
                                borderBottomColor: 'rgb(0, 108, 42)',
                            },
                            '& .MuiFilledInput-root': {
                                backgroundColor: 'white',
                                '&:hover': {
                                    backgroundColor: 'white',
                                },
                                '&.Mui-focused': {
                                    backgroundColor: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgb(0, 108, 42) !important',
                                    },
                                },
                            },
                            '& .MuiSelect-icon': {
                                color: 'rgb(0, 108, 42)',
                            },
                            width: '15vh'
                        }}
                        inputProps={{ maxLength: 5 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {newQuantity && (
                                        <IconButton
                                            onClick={() => setQuantity('')} size="small" sx={{ marginTop: '0vh', }}>
                                            <ClearIcon sx={{ fontSize: '16px' }} />
                                        </IconButton>
                                    )}
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box sx={{ width: '8vh' }}>
                        <Button sx={{height: '100%'}}variant="contained" component="label" className={PPStyles.button} onClick={addNewDetailToCard}>
                            <AddIcon />
                            <SettingsApplicationsIcon />
                        </Button>
                    </Box>
                </Box>
            </Dialog>
            <ToastContainer />
        </Box>
    );
};

export default PurchasePage;
