import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DPStyles from './Development.module.css';
import QRCode from 'qrcode';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControl, InputLabel, Select, Tooltip } from '@mui/material';
import { Menu, Item, Separator, useContextMenu, } from "react-contexify";
import 'react-contexify/dist/ReactContexify.css';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { sendDataToHistory } from '../../utils/addHistory';

const ItemTypes = {
    CARD: 'card',
};

/**
 * Компонент для рендеринга перетаскиваемых карт.
 *
 * @param {Object} props - свойства компонента.
 * @param {Object} props.data - Данные для карты.
 * @param {string} props.data.id - id карты.
 * @param {string} props.data.productName - Название продукта.
 * @param {string} props.data.part - количетсво продуктов в заказе
 * @param {string} props.data.partOfOrder - Частью какого заказа является.
 * @param {string} props.className - Имя CSS-класса карты.
 * @return {JSX.Element} Отрисованная карта.
 */
const Card = ({ data, className }) => {
    // Используется хук useDrag, чтобы включить перетаскивание.
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.CARD, // Указываем тип перетаскиваемого элемента.
        item: { type: ItemTypes.CARD, id: data.id, phase: data.phase }, // Добавляет фазу в элемент.
        collect: (monitor) => ({ // Отслеживает состояние перетаскиваемого элемента.
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        //Отображает всплывающую подсказку с заголовком и перетаскиваемым элементом div.
        <Tooltip title="Нажмите правую клавишу, чтобы открыть меню">
            <div
                ref={drag} // Прикрепляет ссылку перетаскивания к div.
                className={`${className} ${DPStyles.draggableItem} ${isDragging ? DPStyles.dragging : ''}`} // Применяет классы CSS в зависимости от состояния перетаскивания.
            >
                {`${data.id} | ${data.productName} | ${data.part} | ${data.partOfOrder}`} {/* Отображает содержимое карты. */}
            </div>
        </Tooltip>
    );
};
let cardIdTest = 0
const Container = ({ dataForCards, phase, onDrop, setDataForContainers, handleDrop, details, userLevel, fetchData }) => {
    const [openDialog, setOpenDialog] = React.useState(false);
    const [addPartDialog, setAddPartDialog] = React.useState(false);
    const [selectedCardId, setSelectedCardId] = React.useState(null);
    const [comment, setComment] = React.useState([]);
    const [cardBack, setCardBack] = React.useState(false);
    const [selectedDetail, setSelectedDetail] = React.useState(null);
    const [selectedDetailQuantity, setSelectedDetailQuantity] = React.useState(1);
    const [reason, setReason] = React.useState('');

    const MENU_ID = "menu-id";
    const { show } = useContextMenu({
        id: MENU_ID
    });

    
    /**
     * Настраивает функцию displayMenu для обработки событий контекстного меню.
     *
     * @param {number} cardId - id отображаемой карты.
     * @returns {function} Функция обработчика событий.
     */
    const displayMenu = (cardId) => (e) => {
        // Отключает поведение контекстного меню по умолчанию
        e.preventDefault();

        // Если уровень пользователя больше 1, завершает функцию
        if (userLevel > 1) {
            return;
        }

        // Отображает контекстное меню
        show({
            event: e,
        });

        // Установливает id карты и выбранный id карты
        cardIdTest = cardId;
        setSelectedCardId(cardId);
    }
    /**
     * Обрабатывает событие клика по элементу в контекстном меню.
     *
     * @param {string} action - Действие, которое необходимо выполнить.
     */
    const handleItemClick = (action,) => {
        // В зависимости от действия выполнить соответствующую операцию
        if (action === 'addComment') {
            //Открывает диалоговое окно при нажатии кнопки «Добавить комментарий».
            setOpenDialog(true);
        }
        else if (action === 'addPart') {
            // Открвает диалоговое окно, чтобы добавить деталь
            setAddPartDialog(true);
        }
        else if (action === 'nextPhase') {
            // Перемещает карту на следующий этап
            handleMoveToNextPhase(cardIdTest);
        }
        else if (action === 'previousPhase') {
            // Вернуть карту на предыдущий этап
            setCardBack(true);
        }
        else if (action === 'generateQR') {
            // Создает QR-код для карточки и сбросавает id выбранной карты.
            handleDrop(cardIdTest, undefined, false);
            setSelectedCardId(null);
        }
        else {
            // Записываеть ошибку для недопустимого действия
            console.error("Invalid action:", action);
        }
    }
   /**
 * Закрывает диалоговое окно и сбрасывает состояние карты.
 *
 * @return {void}
 */
const handleDialogClose = React.useCallback(() => {
    // Закрывает диалоговое окно
    setOpenDialog(false);
    // Сбрасывает состояние карты
    setCardBack(false);
}, []);

/**
 * Закрывает диалоговое окно для добавления детали.
 *
 * @return {void}
 */
const handleAddPartDialogClose = React.useCallback(() => {
    setAddPartDialog(false);
}, []);

    /**
 * Обрабатывает отправку комментария.
 *
 * @return {Promise<void>} - Промис, который разрешается после успешного добавления комментария.
 */
    const handleCommentSubmit = React.useCallback(async () => {
        try {
            // Получаем данные пользователя из локального хранилища
            const userData = localStorage.getItem('user');
            const user = JSON.parse(userData);

            // Проверяем, что данные пользователя существуют и содержат имя
            if (user && user.name) {
                // Формируем новый комментарий
                const newComment = `${user.name}: ${comment[selectedCardId]}`;
                if (comment[selectedCardId] === '' || comment[selectedCardId] === ' ') {
                    toast.error('Комментарий не может быть пустым');
                    return;
                }
                // Отправляем комментарий на сервер
                await axios.put(`http://192.168.0.123:3001/productsInDevelopment/${cardIdTest}/comment`, { comment: newComment });
                await sendDataToHistory(`Добавил комментарий для ${cardIdTest}`);

                // Обновляем массив комментариев, очищая поле комментария для выбранной карточки
                const newCommentArray = [...comment];
                newCommentArray[selectedCardId] = '';
                setComment(newCommentArray);

                // Закрываем диалоговое окно и показываем уведомление об успешном добавлении
                setOpenDialog(false);
                toast.success('Комментарий успешно добавлен!');
                cardIdTest = 0;
            } else {
                console.error('User email not found');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }, [comment, selectedCardId]);
    
    /**
     * Обрабатывает отправку добавления деталей.
     *
     * @return {Promise<void>} - Промис, которое разрешается после успешного добавления детали.
     */
    const handleAddDetailSubmit = async () => {
        //Получает пользовательские данные из локального хранилища
        const userData = localStorage.getItem('user');
        const user = JSON.parse(userData);
        let modifiedReason = ''; // Инициализируем причину добавления

        // Проверяем, выбрана ли деталь
        if (!selectedDetail) {
            toast.error('Выберете деталь');
            return;
        }

        // проверяем количество
        if (parseInt(selectedDetailQuantity) <= 0) {
            toast.error('Количество должно быть больше нуля');
            return;
        }

        // Проверяем, не превышает ли количество доступное количество
        if (parseInt(selectedDetailQuantity) > selectedDetail.quantity) {
            toast.error('Количество не может превышать доступное количество');
            return;
        }

        //Проверяем, указана ли причина
        if (reason === '') {
            toast.error('Укажите причину');
            return;
        } else {
            // Конкатенируем имя пользователя и измененную причину
            modifiedReason = `${user.name}: Причина добавления детали ${selectedDetail.detailName}: ${reason}`;
        }

        // Обновляет количество деталей для выбранной детали на сервере
        await axios.put(`http://192.168.0.123:3001/details/${selectedDetail.detailName}`, { quantity: selectedDetailQuantity });

        // Добавляет детали к продукту, находящемуся в разработке на сервере.
        await axios.put('http://192.168.0.123:3001/productsInDevelopment', { cardId: cardIdTest, detail: selectedDetail.detailName, quantity: selectedDetailQuantity });

        // Добавляет дополнительный комментарий к продукту, находящемуся в разработке на сервере.
        await axios.put('http://192.168.0.123:3001/productsInDevelopment/additionalComments', { cardId: cardIdTest, comment: modifiedReason });
        await sendDataToHistory(`Добавил доп. деталь(и) для изготовления ${cardIdTest}`);

        toast.success('Деталь успешно добавлена');

        // Сбросить переменные состояния
        setSelectedDetail(null);
        setSelectedDetailQuantity(1);
        setReason('');

        // Закрывает диалоговое окно добавления детали
        handleAddPartDialogClose();
    };

    /**
 * Перемещает карточку на следующий этап разработки.
 *
 * @param {number} cardId - Идентификатор карточки, которую нужно переместить.
 * @return {Promise<void>} - Промис, который разрешается после успешного перемещения карточки.
 */
const handleMoveToNextPhase = async (cardId) => {
    try {
        // Находим карточку по её идентификатору
        const card = dataForCards?.find(card => card.id === cardId);
        if (!card) throw new Error('Card not found');
        
        // Вычисляем следующую фазу
        const nextPhase = Math.min(card.phase + 1, 4);
        
        // Отправляем запрос на сервер для обновления фазы карточки
        await axios.put(`http://192.168.0.123:3001/productsInDevelopment/${cardId}/phase`, { phase: nextPhase });
        await sendDataToHistory(`Переместил карточку ${cardId} на следующий этап разработки`);

        // Обновляем свойство manufactured у платы в заказе
        if (nextPhase === 4) {
            const selectedOrder = card.partOfOrder;
            const productName = card.productName;
            await axios.post('http://192.168.0.123:3001/products/update-product-manufactured', { selectedOrder, productName, manufactured: 2 });
        } else {
            const selectedOrder = card.partOfOrder;
            const productName = card.productName;
            await axios.post('http://192.168.0.123:3001/products/update-product-manufactured', { selectedOrder, productName, manufactured: 1 });
        }

        // Обновляем данные для контейнеров, изменяя фазу у соответствующей карточки
        setDataForContainers(prevData => {
            const updatedData = prevData.data.map(card => 
                card.id === cardId ? { ...card, phase: nextPhase } : card
            );
            return { ...prevData, data: updatedData };
        });
    } catch (error) {
        console.error('Error moving card to next phase:', error);
    } finally {
        // В любом случае после операции обновляем данные
        fetchData();
    }
};

    /**
 * Перемещает карточку на предыдущую фазу разработки.
 *
 * @param {number} cardIdTest - id  карточки, которую нужно переместить.
 * @return {Promise<void>} - Промис, который разрешается после успешного перемещения карточки.
 */
const handleMoveToPreviousPhase = React.useCallback(async (cardIdTest) => {
    try {
        // Находим индекс карточки в массиве данных
        const cardIndex = dataForCards?.findIndex(card => card.id === cardIdTest);
        if (cardIndex === -1) {
            console.error('Card not found');
            return;
        }
        
        // Сбрасываем состояние карты назад
        setCardBack(false);

        // Получаем карточку по индексу
        const card = dataForCards?.[cardIndex];
        // Вычисляем предыдущий этап
        const previousPhase = Math.max(1, card.phase - 1);
        // Если текущий этап равен предыдущему, выходим
        if (previousPhase === card.phase) return;

        // Создаем копию массива dataForCards и обновляем этап нужной карточки
        const updatedDataForCards = [...dataForCards];
        updatedDataForCards[cardIndex] = { ...card, phase: previousPhase };

        // Отправляем запрос на сервер для обновления этапа карточки
        await axios.put(`http://192.168.0.123:3001/productsInDevelopment/${cardIdTest}/phase`, { phase: previousPhase });
        await sendDataToHistory(`Переместил карточку ${cardIdTest} на предыдущий этап разработки`);

        // Обновляем свойство manufactured у платы в заказе
        if (previousPhase === 4) {
            const selectedOrder = card.partOfOrder;
            const productName = card.productName;
            await axios.post('http://192.168.0.123:3001/products/update-product-manufactured', { selectedOrder, productName, manufactured: 2 });
        } else {
            const selectedOrder = card.partOfOrder;
            const productName = card.productName;
            await axios.post('http://192.168.0.123:3001/products/update-product-manufactured', { selectedOrder, productName, manufactured: 1 });
        }

        // Обновляем состояние контейнеров с новыми данными
        setDataForContainers(prevData => {
            const updatedData = prevData.data.map(card => 
                card.id === cardIdTest ? { ...card, phase: previousPhase } : card
            );
            return { ...prevData, data: updatedData };
        });

    } catch (error) {
        console.error('Error moving card to previous phase:', error);
    } finally {
        // В любом случае после операции обновляем данные
        fetchData();
    }
}, [dataForCards, setDataForContainers, fetchData]);



/**
 * Callback-функция для обработки события "drop".
 *
 * @param {object} item - Перетаскиваемый элемент.
 * @param {object} monitor - Объект монитора из библиотеки DnD.
 * @return {void}
 */
const onDropCallback = React.useCallback((item, monitor) => {
    // Проверяем уровень пользователя
    if (userLevel > 1) return;
    
    // Получаем этап перетаскиваемой карточки
    const draggedCardPhase = item.phase;
    
    // Проверяем, что перетаскиваемая карточка может быть перемещена на следующую фазу
    if (draggedCardPhase + 1 === phase) {
        // Вызываем функцию обработки "drop"
        onDrop(item.id, phase);
    }
}, [phase, onDrop, userLevel]);

/**
 * Фильтрует карточки по текущей фазе и создает кастомный хук для обработки "drop".
 *
 * @type {array} filteredCards - Отфильтрованный массив карточек по текущему этапу.
 * @type {function} drop - Функция обработки "drop", используемая для перетаскиваемых элементов типа CARD.
 */
const filteredCards = React.useMemo(() => dataForCards?.filter(card => card.phase === phase), [dataForCards, phase]);

const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    drop: onDropCallback,
});

    return (
        <div ref={drop} className={DPStyles.lower_section}>
            {filteredCards?.map((card) => (
                card.deliveryStatus === 0 && (
                    <div onContextMenu={displayMenu(card.id)} key={card.id}>
                        <Card data={card} className={DPStyles.card} />
                        <Menu id={MENU_ID} style={{ zIndex: 999 }}>
                            <Item onClick={() => handleItemClick('addComment')}>Добавить комментарий</Item>
                            <Separator />
                            <Item onClick={() => handleItemClick('addPart')}>Добавить запасную деталь</Item>
                            <Separator />
                            <Item onClick={() => handleItemClick('nextPhase')}>Перевести на следующий этап</Item>
                            <Separator />
                            <Item onClick={() => handleItemClick('previousPhase')}>Перевести на предыдущий этап</Item>
                            <Separator />
                            <Tooltip title="Только для готовых плат">
                                <Item onClick={() => handleItemClick('generateQR')}>Сгенерировать QR</Item>
                            </Tooltip>
                        </Menu>
                    </div>
                )
            ))}
            <Dialog open={openDialog} onClose={handleDialogClose}  sx={{ '& .MuiDialog-container': { '& .MuiPaper-root': { overflowY: 'hidden' } } }}>
                <DialogTitle>Добавить комментарий</DialogTitle>
                <DialogContent>
                    <TextField
                        color="success"
                        autoFocus
                        margin="dense"
                        id="comment"
                        label="Комментарий"
                        type="text"
                        fullWidth
                        value={comment[selectedCardId] || ''}
                        onChange={(e) => {
                            const newCommentArray = [...comment];
                            newCommentArray[selectedCardId] = e.target.value;
                            setComment(newCommentArray);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Отмена</Button>
                    <Button onClick={handleCommentSubmit}>Добавить</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={cardBack} onClose={handleDialogClose}  sx={{ '& .MuiDialog-container': { '& .MuiPaper-root': { overflowY: 'hidden' } } }}>
                <DialogTitle>Подтвердить перевод</DialogTitle>
                <DialogContent>
                    <p>Вы уверены, что хотите перевести карту на предыдущий этап?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Отмена</Button>
                    <Button onClick={() => handleMoveToPreviousPhase(cardIdTest)}>Да</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={addPartDialog} onClose={handleAddPartDialogClose} className={DPStyles.addPartDialog} 
                sx={{ '& .MuiDialog-container': { '& .MuiPaper-root': { overflowY: 'hidden' } } }}
            >
                <DialogTitle>Добавить дополнительную деталь</DialogTitle>
                <DialogContent >
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Выберете деталь</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={selectedDetail}
                            label="Выберете деталь"
                            onChange={(e) => setSelectedDetail(e.target.value)}
                            margin='dense'
                        >
                            { details?.map((detail, index) => <MenuItem value={detail} key={index}>{detail.detailName}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField 
                        color="success"
                        margin="dense" 
                        disabled 
                        value={`Доступно: ${selectedDetail ? details?.find(detail => detail.detailName === selectedDetail?.detailName)?.quantity : " "}`}
                    />
                    <TextField
                        color="success"
                        autoFocus
                        margin="dense"
                        label="Укажите количество"
                        type="number"
                        fullWidth
                        value={selectedDetailQuantity}
                        onChange={(e) => setSelectedDetailQuantity( e.target.value )}
                    />
                    <TextField 
                        color="success"
                        margin="dense"
                        label="Укажите причину добавления детали"
                        type="text"
                        fullWidth
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddPartDialogClose}>Отмена</Button>
                    <Button disabled={!selectedDetail} onClick={handleAddDetailSubmit}>Добавить</Button>
                </DialogActions>
            </Dialog>
        </div >
    );
};


const DevelopmentPage = ({userLevel}) => {
    const [dataForContainers, setDataForContainers] = useState([]);
    const [qrCode, setQrCode] = useState('');
    const [transcript, setTranscript] = useState('');
    const [details, setDetails] = useState([]);

    /**
     * Возвращает соответствующий текст для пришедшего индекса.
     *
     * @param {number} index - Индекс, для которого нужно получить текст.
     * @return {string} Соответствующий текст или «Текст по умолчанию», если индекс не распознается.
     */
    function getTextForIndex(index) {
        // Определяет сопоставление между индексом и текстом.
        const indexToText = {
            1: "Начальный этап",
            2: "Автоматический этап",
            3: "Ручной этап",
            4: "Готовые платы",
        };

        // Возвращает текст, соответствующий индексу, или «Текст по умолчанию», если индекс не распознан.
        return indexToText[index] || "Default text";
    }


    useEffect(() => {
        fetchData();
        fetchDetails()
    }, []);

    /**
     * Получает данные с сервера и обновляет состояние полученными данными.
     *
     * @return {Promise<void>} - Возвращает промис, которое выполняется при получении данных и обновлении состояния.
     */
    const fetchData = async () => {
        try {
            // Получает данные о продуктах в разработке с сервера
            const result = await axios.get('http://192.168.0.123:3001/productsInDevelopment');

            // Обновляет состояние полученными данными
            setDataForContainers(result);
        } catch (error) {
            // Логирует сообщение об ошибке, если при получении данных произошла ошибка.
            console.error('Error fetching data:', error);
        }
    };

    /**
     * Получает данные о деталях с сервера и обновляет состояние полученными данными.
     *
     * @return {Promise<void>} - Промис, которое выполняется при получении данных и обновлении состояния.
     */
    const fetchDetails = async () => {
        try {
            // Получает данные о деталях с сервера
            const result = await axios.get('http://192.168.0.123:3001/details');

            // Обновляет состояние полученными данными
            setDetails(result);
        } catch (error) {
            // Логирует сообщение об ошибке, если произошла ошибка при получении данных.
            console.error('Error fetching data:', error);
        }
    }



    /**
     * Генерирует изображение QR-кода для данного текста и возвращает URL-адрес изображения.
     *
     * @param {string} text - Текст, который будет закодирован в QR-коде.
     * @return {Promise<string>} - Промис, которое преобразуется в URL-адрес сгенерированного изображения QR-кода.
     * @throws {Error} - Если возникает ошибка при создании QR-кода, выдается ошибка.
     */
    const generateQR = async (text) => {
        try {
            // Создайте изображение QR-кода, используя библиотеку QRCode.
            const qrCode = await QRCode.toDataURL(text, { errorCorrectionLevel: 'H' });

            // Вернуть URL-адрес сгенерированного изображения QR-кода.
            return qrCode;
        } catch (error) {
            // Логирует сообщение об ошибке, если возникла ошибка при создании QR-кода.
            console.error('Error generating QR code:', error);
        }
    };

    /**
     * Возвращает текущую дату и время в виде форматированной строки.
     *
     * @return {string} Отформатированная строка даты и времени.
     */
    const getCurrentDateTimeString = () => {
        // Получите текущую дату и время.
        const now = new Date();

        // Форматирует дату.
        const dateString = now.toLocaleDateString('en-GB', {
            day: '2-digit', // День с ведущими нулями (01-31).
            month: '2-digit', // Месяц с ведущими нулями (01–12).
            year: 'numeric' // Четырехзначный год.
        });

        // Форматирует время.
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false, //Используйте 24-часовой формат времени.
            hour: '2-digit', // Час с ведущими нулями (00-23).
            minute: '2-digit', // Минуты с ведущими нулями (00-59).
            second: '2-digit' // Секунды с ведущими нулями (00-59).
        });

        // Объединяет строки даты и времени и возвращает результат.
        return `${dateString} ${timeString}`;
    };

    /**
     * Сохраняет данные производства для указанного id карточки.
     *
     * @param {string} _cardIdTest - id карточки, данные производства для которой нужно сохранить
     * @return {Promise<void>} - промис, который разрешается при успешном сохранении данных производства,
     * или отклоняется с ошибкой, если сохранение не удалось.
     */
    const saveManufacturingData = async (_cardIdTest) => {
        try {
            // Отправляем GET-запрос на сервер, чтобы сохранить данные производства.
            const response = await axios.put(
                `http://192.168.0.123:3001/productsInDevelopment/${_cardIdTest}`,
                {
                    endDateOfManufacturer: getCurrentDateTimeString(), // Сохраняем текущую дату и время в качестве даты окончания производства.
                }
            );
            await sendDataToHistory(`Производство ${_cardIdTest} завершено.`);

            // Проверяем, что сервер ответил с кодом, обозначающим успешное выполнение операции.
            if (!response.status === 200) {
                throw new Error('Failed to save manufacturing data'); // Сообщаем об ошибке сохранения данных производства.
            }

        } catch (error) {
            console.error('Error saving manufacturing data:', error); // Логируем сообщение об ошибке, если возникла ошибка при сохранении данных производства.
        }
    };

    /**
     * Обрабатывает событие дропа карточки.
     *
     * @param {string} _cardIdTest - id дропаемой карты.
     * @param {number} newPhase - Новый этап, в который следует переместить карточку.
     * @param {boolean} isDragNDrop - Флаг, указывающий, была ли карта перетянута.
     * @return {Promise<void>} - Обещание, которое выполняется при успешном дропе карточки.
     */
    const handleDrop = async (_cardIdTest, newPhase, isDragNDrop) => {
        console.log(_cardIdTest, newPhase, isDragNDrop) 
        //Ищет карту с данным id.
        const card = dataForContainers.data.find(c => c.id === _cardIdTest);
        console.log(card)
        if (!card) return;

        let qrData, qrCode;

        // Если карта перемещается на 4й этап или уже находится на нем, сгенерирует QR-код.
        if (newPhase === 4 || card.phase === 4) {
            qrData = `${card.id} | ${card.productName} | ${card.part} | ${card.partOfOrder}`;
            qrCode = await generateQR(qrData);
            setTranscript(_cardIdTest);

            // Если дата окончания производства карточки равна нулю, сохраните данные о производстве.
            if (card.endDateOfManufacturer === null) {
                saveManufacturingData(_cardIdTest);
            }
        }
        console.log('-----------------------------------------',newPhase,card.phase)
        if (newPhase === 4 || card.phase === 4) {
            console.log('УСТАНОВКА manufactured в 2!')
            // Обновляем свойство manufactured у платы в заказе
            try {
                const selectedOrder = card.partOfOrder;
                const productName = card.productName;
                await axios.post('http://192.168.0.123:3001/products/update-product-manufactured', { selectedOrder, productName, manufactured: 2 });
            } catch (error) {
                console.error('Ошибка установки свойства manufactured === 2:', error);
            }
        } else {
            console.log('УСТАНОВКА manufactured в 1!')
            // Обновляем свойство manufactured у платы в заказе
            try {
                const selectedOrder = card.partOfOrder;
                const productName = card.productName;
                await axios.post('http://192.168.0.123:3001/products/update-product-manufactured', { selectedOrder, productName, manufactured: 1 });
            } catch (error) {
                console.error('Ошибка установки свойства manufactured === 1:', error);
            }
        }

        // Если карточку не перетащили, установливает новый этап на текущую этап.
        if (isDragNDrop === false) {
            newPhase = card.phase;
        }

        try {
            if (qrData) {
                setQrCode(qrCode);

                // Если карта не находится на 4м этапе и ее перетащили, отобразится сообщение об ошибке.
                if (newPhase !== 4 && isDragNDrop !== undefined) {
                    toast.error('Плата еще не изготовлена');
                }
            } else if (isDragNDrop === undefined) {
                // Обработка случая, когда карту не перетащили.
            } else {
                // Показывает сообщение об ошибке, если карту не перетащили.
                toast.error('Плата еще не изготовлена');
            }

            // Если указана новая фаза, обновляет этап карточки на сервере.
            if (newPhase !== undefined) {
                let cardId = _cardIdTest

                await axios.put(`http://192.168.0.123:3001/productsInDevelopment/${cardId}/phase`, { phase: newPhase });
                await sendDataToHistory(`Перемещена карточка ${cardId} на ${newPhase} этап.`);
                // await axios.put(`http://192.168.0.123:3001/productsInDevelopment/${cardId}/phase`, { phase: newPhase });
                // await window.api.updatePhase(_cardIdTest, newPhase);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            fetchData();
        }
    };

/**
 * Отображение русских букв на соответствующие английские символы на клавиатуре.
 * Каждая пара ключ-значение представляет собой соответствие русской буквы на английскую клавишу.
 */
    const russianToEnglishMap = {
        'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p', 'х': '[', 'ъ': ']',
        'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k', 'д': 'l', 'ж': ';', 'э': '\'',
        'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm', 'б': ',', 'ю': '.',
        'Й': 'Q', 'Ц': 'W', 'У': 'E', 'К': 'R', 'Е': 'T', 'Н': 'Y', 'Г': 'U', 'Ш': 'I', 'Щ': 'O', 'З': 'P', 'Х': '{', 'Ъ': '}',
        'Ф': 'A', 'Ы': 'S', 'В': 'D', 'А': 'F', 'П': 'G', 'Р': 'H', 'О': 'J', 'Л': 'K', 'Д': 'L', 'Ж': ':', 'Э': '"',
        'Я': 'Z', 'Ч': 'X', 'С': 'C', 'М': 'V', 'И': 'B', 'Т': 'N', 'Ь': 'M', 'Б': '<', 'Ю': '>', '/': '|'
    };

    /**
     * Переводит заданный текст с русского на английский.
     *
     * @param {string} text - Текст, который нужно перевести.
     * @return {string} Переведенный текст.
     */
    const translateToEnglish = (text) => {
        // Разбивает текст на отдельные символы
        // Сопоставляет каждый символ с соответствующим английским символом с карточки.
        // Если символ не найден на карте, возвращает исходный символ
        // Объединяет сопоставленные символы обратно в строку
        return text.split('')
            .map(char => russianToEnglishMap[char] || char)
            .join('');
    };

    /**
     * Обрабатывает событие изменения поля ввода расшифровки.
     * Преобразует входной текст с русского на английский с помощью функции TranslateToEnglish.
     * Обновляет состояние расшифровки переведенным текстом.
     *
     * @param {Event} e - Объект события изменения.
     * @return {void} Эта функция ничего не возвращает.
     */
    const handleTranscriptChange = (e) => {
        // Получает значение поля ввода
        const value = e.target.value;

        // Конвертирует входной текст с русского на английский
        const englishValue = translateToEnglish(value);

        // Обновляет состояние расшифровки переведенным текстом.
        setTranscript(englishValue);
    };

    /**
     * Обрабатывает событие печати QR-кода.
     * Открывает новое окно браузера, записывает в него HTML-код для печати
     * и закрывает окно через 1 секунду после завершения процесса печати.
     *
     * @return {void} Эта функция ничего не возвращает.
     */
    const handlePrint = () => {
        // Открываем новое окно браузера
        const printWindow = window.open('', '_blank');

        // Проверяем, что окно успешно открылось
        if (printWindow) {
            // Записываем HTML-код для печати в новое окно
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print QR Code</title>
                        <style>
                            body { margin: 0; }
                            @media print { 
                                body * { visibility: hidden; }
                                #qrCodeImage, #qrCodeImage * { visibility: visible; }
                                #qrCodeImage { position: absolute; left: 0; top: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <div>
                            <img id="qrCodeImage" src="${qrCode}" alt="QR Code">
                        </div>
                        <script>
                            // Выполняем функцию после загрузки страницы
                            window.onload = () => {
                                // Начинаем процесс печати
                                window.print();
                                // Закрываем окно через 1 секунду после завершения процесса печати
                                setTimeout(() => {
                                    window.close();
                                }, 1000);
                            };
                        </script>
                    </body>
                </html>
            `);

            // Закрываем доступ к документу в новом окне
            printWindow.document.close();
        }
    };


    return (
        <DndProvider backend={HTML5Backend}>
            <div className={DPStyles.main_background}>
                <div className={DPStyles.cardText}>
                    <div className={DPStyles.containersContainer}>
                        {[1, 2, 3, 4]?.map((index) => (
                            <div className={DPStyles.l_card} key={index}>
                                <div className={DPStyles.upper_section}>
                                    <h3>{getTextForIndex(index)}</h3>
                                </div>
                                <div className={DPStyles.lower_section}>
                                    <Container
                                        key={index}
                                        dataForCards={dataForContainers.data}
                                        phase={index}
                                        onDrop={handleDrop}
                                        setDataForContainers={setDataForContainers}
                                        handleDrop={handleDrop}
                                        details={details.data}
                                        userLevel={userLevel}
                                        fetchData={fetchData}
                                    />
                                </div>
                                {/* <img id="qrCodeImage1" src={myImage} style={{top: "90px"}} /> */}

                            </div>
                        ))}
                    </div>
                </div>
                <div className={DPStyles.containersContainer1}>
                    <div className={DPStyles.l_card1}>
                        <TextField
                            color="success"
                            id="standard-basic"
                            type="text"
                            value={qrCode}
                            label="Generated QR Code"
                            variant="standard"
                        />
                        <div className={DPStyles.button}>
                            <TextField
                                color="success"
                                className={DPStyles.marginTop15}
                                id="standard-basic"
                                type="text"
                                value={transcript}
                                onChange={handleTranscriptChange}
                                label="Transcript"
                                variant="standard"
                            />
                        </div>
                    </div>
                    <div className={DPStyles.l_card1}>
                        {/* QR code image display */}
                        {qrCode !== '' && (
                            <div>
                                <h5 className={DPStyles.textCenter}>Нажмите на QR-код, чтобы распечатать</h5>
                                <img id="qrCodeImage" src={qrCode} alt="QR Code" className={DPStyles.QRCodeImage} onClick={handlePrint} />
                            </div>
                        )}
                    </div>
                </div>
                <ToastContainer />
            </div>

        </DndProvider>
    );
};

export default DevelopmentPage;
