import React, { useCallback, useEffect, useState } from 'react';
import SPStyles from './StoragePage.module.css';
import { Button, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField } from '@mui/material';
import axios from 'axios';
import ArchivePS from '../../Pages/ArchivePage/ArchivePage.module.css';
import { Menu, Item, useContextMenu, Submenu } from 'react-contexify';
import pdfMake from 'pdfmake/build/pdfmake';
import * as XLSX from 'xlsx';
import PPStyles from '../ProvidersPage/ProvidersPage.module.css';
import { sendDataToHistory } from '../../utils/addHistory';
// import { EnhancedTableHeadArchive } from './EnhancedTableHeadArchive';

const detailsHeadCells = [
    { id: 'detailName', numeric: false, disablePadding: true, label: 'Название' },
    { id: 'quantity', numeric: true, disablePadding: false, label: 'Количество (шт)' },
    { id: 'provider', numeric: false, disablePadding: false, label: 'Поставщик' },
    { id: 'type', numeric: false, disablePadding: false, label: 'Тип' },
    { id: 'slot', numeric: false, disablePadding: false, label: 'Ячейка' },
    { id: 'price', numeric: false, disablePadding: false, label: 'Цена' }
];

const productsHeadCells = [
    { id: 'productName', numeric: false, disablePadding: true, label: 'Название(id)' },
    { id: 'endDateOfManufacturer', numeric: false, disablePadding: false, label: 'Статус' },
    { id: 'partOfOrder', numeric: false, disablePadding: false, label: 'В составе заказа #' },
    { id: 'type', numeric: false, disablePadding: false, label: 'Тип' },
];

const MENU_ID = "menu-id";

/**
 * Отображает заголовок таблицы для страницы «Архив».
 * 
 * @param {Object} props - Свойства компонента
 * @param {string} props.secondSelectValue - Значение для второго раскрывающегося списка выбора.
 * @param {string} props.order - Текущий порядок сортировки.
 * @param {string} props.orderBy - Свойство для сортировки.
 * @param {function} props.onRequestSort - Функция для обработки сортировки.
 * @returns {JSX.Element} Заголовок таблицы с сортируемыми столбцами.
 */
export function EnhancedTableHeadArchive({ secondSelectValue, order, orderBy, onRequestSort }) {
    // Определяет заголовки ячеек таблицы на основе второго значения выбора
    const headCells =
        secondSelectValue === 'детали' ? detailsHeadCells : productsHeadCells;

    /**
     * Создает функцию-обработчик сортировки для определенного свойства.
     * 
     * @param {string} property - Свойство для сортировки.
     * @returns {function} Функция обработчика сортировки.
     */
    const createSortHandler = (property) => (event) => {
        // Вызовите функцию onRequestSort с событием и свойством.
        onRequestSort(event, property);
    };

    return (
        // Отображение заголовка таблицы с использованием пользовательских стилей
        <TableHead className={ArchivePS.customTableHead}>
            <TableRow>
                {/*Рендеринг каждой ячейки заголовка таблицы */}
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id} // Установка ключа на основе id
                        align={headCell.numeric ? 'center' : 'center'} //Установка  выравнивания на основе числового свойства
                        sortDirection={orderBy === headCell.id ? order : false} // Установка направления сортировки на основе свойства orderBy.
                        style={{ color: "white", fontWeight: "bold", cursor: 'pointer' }} // Установка стиля ячейки
                    >
                        {/* Отображение метки сортировки таблицы */}
                        <TableSortLabel
                            active={orderBy === headCell.id} // Установка активного состояния на основе свойства orderBy.
                            direction={orderBy === headCell.id ? order : 'asc'} // Установка направления на основе свойства orderBy.
                            onClick={createSortHandler(headCell.id)} // Установка обработчика кликов для метки сортировки
                        >
                            {/* Отображение метки ячейки */}
                            {headCell.label}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

const StoragePage = ({ userLevel }) => {
    const [firstSelectValue, setFirstSelectValue] = useState('Выберете склад');
    const [secondSelectValue, setSecondSelectValue] = useState('Выберете опцию');
    const [thirdSelectValue, setThirdSelectValue] = useState('Выберете состояние');
    const [detailsToDisplay, setDetailsToDisplay] = useState([]);
    const [productsToDisplay, setProductsToDisplay] = useState([]);
    const [dataToDisplay, setDataToDisplay] = useState([]);
    const [currentDataItem, setCurrentDataItem] = useState(null);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('type');
    const [searchValue, setSearchValue] = useState('');

    /**
     * Осуществляет сортировку данных на основе предоставленного свойства.
     *
     * @param {Event} event - Событие, которое вызвало сортировку.
     * @param {string} property - Свойство для сортировки данных.
     * @return {void}
     */
    const handleRequestSort = (event, property) => {
        // Проверяет, совпадает ли текущее свойство с сортируемым и имеет ли порядок возрастание.
        const isAsc = orderBy === property && order === 'asc';

        // Установливает новый порядок на основе текущего порядка и сортируемого свойства.
        setOrder(isAsc ? 'desc' : 'asc');

        // Установливает новое свойство для сортировки данных.
        setOrderBy(property);
    };

    /**
     * Создает новый массив с данными, отсортированными на основе указанного свойства.
     *
     * @return {Array} - Отсортированный массив данных.
     */
    const sortedData = () => {
        /**
         * Сравнивает два элемента на основе указанного свойства.
         *
         * @param {Object} a - Первый объект для сравнения.
         * @param {Object} b - Второй объект для сравнения.
         * @return {number} - Возвращает отрицательное значение, если а следует отсортировать до b,
         *  положительное значение, если a следует отсортировать после b,
         *  или 0, если они равны.
         */
        return [...dataToDisplay].sort((a, b) => {
            if (orderBy) {
                // Получает значение текущего свойства для обоих элементов.
                const aValue = a[orderBy] ?? '';
                const bValue = b[orderBy] ?? '';

                // Сравнивает значения и возвращает соответствующий порядок сортировки.
                if (aValue < bValue) {
                    return order === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return order === 'asc' ? 1 : -1;
                }
            }
            return 0;
        });
    };

    useEffect(() => {
        setDataToDisplay(sortedData());
    }, [order, orderBy]);

    const { show } = useContextMenu({ id: MENU_ID });

    /**
     * Обработчик клика по элементу списка. Обновляет хранилище элемента и перезагружает данные.
     *
     * @param {Object} eventData - Данные события клика
     * @param {Object} eventData.event - Объект события клика
     * @param {Object} eventData.props - Пропсы элемента списка
     * @param {string} eventData.props.itemId - id элемента списка
     * @param {string} eventData.props.type - Тип элемента списка ('details' или 'products')
     * @return {Promise} - Промис, который разрешается после обновления данных
     */
    const handleItemClick = async ({ event, props }) => {
        let action
        // Извлекаем необходимые данные из пропсов
        const { itemId, type } = props;

        // Формируем url запроса для обновления хранилища
        const url = type === 'details'
            ? `http://192.168.0.123:3001/details/${itemId}/storage`
            : `http://192.168.0.123:3001/productsInDevelopment/${itemId}/storage`;

        // Получаем новое значение хранилища из текста элемента списка
        const newStorage = event.currentTarget.innerText;

        try {
            // Обновляем хранилище элемента
            await axios.patch(url, { storage: newStorage });
            await sendDataToHistory(action = `перевел ${type === 'details' ? 'деталь' : 'продукт'} ${type === 'details' ? detailsToDisplay.find((el) => el.id === itemId).detailName : productsToDisplay.find((el) => el.id === itemId).productName} в хранилище ${newStorage}`);

            // Обновляем данные списка
            const dataToUpdate = type === 'details' ? detailsToDisplay : productsToDisplay;
            const updatedData = dataToUpdate.map(item =>
                item.id === itemId ? { ...item, storage: newStorage } : item
            );

            setDataToDisplay(updatedData);
            fetchDetailsData(firstSelectValue);
            fetchProductsData(firstSelectValue);
            setCurrentDataItem(null);
        } catch (error) {
            console.error('Ошибка обновления хранилища:', error);
        }
    };

    /**
     * Обработчик клика по кнопке "Поиск в магазине".
     * Открывает новую вкладку с поиском товара на Alibaba.
     *
     * @param {Object} eventData - Данные события клика
     * @param {Object} eventData.props - Пропсы элемента списка
     * @param {string} eventData.props.detailName - Название детали
     */
    const handleFindInStoreClick = ({ props }) => {
        // Извлекаем название детали из пропсов
        const { detailName } = props;

        // Удаляем запятые из названия детали
        const cleanedDetailName = detailName.replace(/,/g, '');

        // Формируем url поиска товара на Alibaba
        const searchUrl = `https://russian.alibaba.com/trade/search?spm=a2700.galleryofferlist.the-new-header_fy23_pc_search_bar.keydown__Enter&tab=all&SearchText=${encodeURIComponent(cleanedDetailName)}`;

        // Открываем новую вкладку с поиском товара
        window.open(searchUrl, '_blank');
    };

    /**
     * Обработчик клика по кнопке удаления детали.
     * Удаляет деталь из хранилища.
     *
     * @param {Object} eventData - Данные события клика
     * @param {Object} eventData.event - Объект события клика
     * @param {Object} eventData.props - Пропсы элемента списка
     * @param {string} eventData.props.type - Тип элемента списка ('details' или 'products')
     * @return {Promise} - Промис, который разрешается после обновления данных
     */
    const handleDeleteClick = async ({ event, props}) => {
        let action
        // Извлекаем тип элемента списка из пропсов
        const {  type } = props;

        // Формируем url запроса для удаления детали
        const url = type === 'details' ? `http://192.168.0.123:3001/details` : `http://192.168.0.123:3001/productsInDevelopment`;

        try {
            // Формируем данные для удаления детали
            const data = type === 'details' 
                ? { storage: currentDataItem.storage, provider: currentDataItem.provider, detailName: currentDataItem.detailName }
                : { id: currentDataItem.id };

            // Отправляем запрос на удаление детали
            await axios.delete(url, { data });
            await sendDataToHistory(action = `удалил ${type === 'details' ? 'деталь' : 'продукт'} ${type === 'details' ? currentDataItem.detailName : currentDataItem.productName}`);

            // Обновляем данные списка, удаляя удаленную деталь
            const dataToUpdate = type === 'details' ? detailsToDisplay : productsToDisplay;
            const updatedData = dataToUpdate.filter(item => !(item.storage === currentDataItem.storage && item.provider === currentDataItem.provider && item.detailName === currentDataItem.detailName));
            setDataToDisplay(updatedData);
            setCurrentDataItem(null);
        } catch (error) {
            // Выводим сообщение об ошибке при удалении детали
            console.error('Ошибка удаления детали в хранилище:', error);
        }
    }

    /**
     * Возвращает массив доступных складов, исключая текущий.
     * @param {string} currentStorage - Текущий склад.
     * @return {string[]} Массив доступных складов.
     */
    const getAvailableStorages = (currentStorage) => {
        // Определение доступные варианты складов
        const storages = ['Разбегаево', 'Склад 1', 'Склад 2'];

        // Отфильтровываем, исключая текущий вариант
        return storages.filter(storage => storage !== currentStorage);
    };


    /**
     * Загружает данные деталей по указанному складу.
     * @param {string} storage - Название склада.
     * @return {Promise<void>} - Промис, который разрешается после успешного получения данных.
     */
    const fetchDetailsData = async (storage) => {
        try {
            // Отправляем GET-запрос на сервер, чтобы получить данные деталей по указанному складу
            const response = await axios.get(`http://192.168.0.123:3001/details?storage=${storage}`);

            // Обновляем состояние с полученными данными
            setDetailsToDisplay(response.data);
        } catch (error) {
            // Логируем сообщение об ошибке, если произошла ошибка при загрузке данных
            console.error('Error fetching data:', error);
        }
    };

    /**
     * Получает данные о продуктах с сервера на основе указанного склада.
     *
     * @param {string} storage - Название склада.
     * @return {Promise<void>} - Промис, который разрешается после успешного получения данных.
     */
    const fetchProductsData = async (storage) => {
        try {
            // Отправляет GET-запрос на сервер для получения данных о продуктах для указанного хранилища.
            const response = await axios.get(`http://192.168.0.123:3001/productsInDevelopment?storage=${storage}`);

            // Обновление состояния с помощью полученных данных
            setProductsToDisplay(response.data);
        } catch (error) {
            // Логируем сообщение об ошибке, если произошла ошибка при загрузке данных
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (secondSelectValue === 'детали' && firstSelectValue !== 'Выберете склад') {
            fetchDetailsData(firstSelectValue);
        } else if (secondSelectValue === 'платы' && firstSelectValue !== 'Выберете склад') {
            fetchProductsData(firstSelectValue);
        } else {
            setDataToDisplay([]);
        }
    }, [secondSelectValue, firstSelectValue]);

    useEffect(() => {
        if (secondSelectValue === 'детали') {
            setDataToDisplay(detailsToDisplay);
        } else if (secondSelectValue === 'платы') {
            setDataToDisplay(productsToDisplay);
        }
    }, [detailsToDisplay, productsToDisplay, secondSelectValue]);

/**
 * Отображает контекстное меню для указанного элемента данных.
 *
 * @param {Object} event - Событие, вызвавшее отображение меню.
 * @param {Object} dataItem - Элемент данных, для которого нужно отобразить меню.
 * @return {void}
 */
const displayMenu = useCallback((event, dataItem) => {
    // Проверяем уровень пользователя
    if (userLevel > 1) return;

    // Устанавливаем текущий элемент данных
    setCurrentDataItem(dataItem);

    // Отображаем контекстное меню с переданными свойствами
    show({
        event,
        props: {
            storage: dataItem.storage,
            itemId: dataItem.id,
            type: secondSelectValue === 'детали' ? 'details' : 'products',
            detailName: dataItem.detailName
        }
    });
}, [userLevel, secondSelectValue, show]);

    /**
     * Обрабатывает событие поиска, устанавливая в качестве входного значения значение поиска в нижнем регистре.
     *
     * @param {Object} e - Объект события, содержащий целевое входное значение.
     * @return {void}
     */
    const handleSearch = (e) => {
        // Получает входное значение и преобразуйте его в нижний регистр.
        const inputValue = e.target.value.toLowerCase();
        
        // Установливает значение поиска в виде входного значения в нижнем регистре.
        setSearchValue(inputValue);
    };

    /**
     * Экспортирует данные в файл PDF.
     *
     * @return {void}
     */
    const exportToPDF = () => {
        // Организация данных по типу
        const dataByType = {};
        
        //Пробегаем каждый элемент массива dataToDisplay и добавляем его в объект dataByType.
        dataToDisplay.forEach(item => {
            if (!dataByType[item.type]) {
                dataByType[item.type] = [];
            }
            dataByType[item.type].push(item);
        });
        
        // Получаем текущую дату
        const currentDate = new Date().toLocaleDateString();
        
        // Создаем документ
        const documentDefinition = {
            // Устанавливаем ориентацию страницы на альбомную   
            pageOrientation: 'landscape',
            pageSize: 'A4', // Устанавливаем размер страницы
            pageMargins: [10, 10, 10, 10], // Устанавливаем минимальные поля
            defaultStyle: {
                fontSize: 10, // Устанавливаем размер шрифта для уменьшения размера таблицы
            },
            // Добавляем заголовок
            header: {
                text: `Текущая дата: ${currentDate}`, // Отображение текущей даты в заголовке
                alignment: 'right', //Выровниваем текст по правому краю
                margin: [0, 10, 10, 0], // Установливаем поля для заголовка
            },
            // Добавляем контент
            content: [
                {
                    table: {
                        headerRows: 1, // Установливаем количество строк заголовка
                        widths: secondSelectValue === 'детали'
                            ? [300, 90, 100, 90, 90, 90] // Устанавливаем точную ширину столбцов для "детали"
                            : [100, 100, 100, 100], // Устанавливаем точную ширину столбцов для другого варианта
                        body: [
                            // Добавляем строки заголовка таблицы
                            secondSelectValue === 'детали'
                                ? ['Название', 'Количество (шт)', 'Поставщик', 'Тип', 'Ячейка', 'Цена']
                                : ['Название(id)', 'Статус', 'В состав заказа #', 'Тип'],
                            // Добавляем строки тела таблицы
                            ...Object.keys(dataByType).reduce((acc, type) => {
                                const typeData = dataByType[type];
                                const rows = typeData.map(item => {
                                    if (secondSelectValue === 'детали') {
                                        return [item.detailName, item.quantity || 0, item.provider, item.type, item.slot, item.price ? item.price : '-'];
                                    } else {
                                        return [item.productName, item.endDateOfManufacturer ? 'Изготовлено' : 'В разработке', item.partOfOrder, item.type];
                                    }
                                });
    
                                const totalQuantity = typeData.reduce((total, item) => total + (item.quantity || item.part || 0), 0);
    
                                return [
                                    ...acc,
                                    ...rows,
                                    // Добавляем строку общего количества
                                    secondSelectValue === 'детали'
                                        ? [{ text: `Все ${type}: ${totalQuantity}`, colSpan: 6, alignment: 'right', bold: true }]
                                        : [{ text: `Все ${type}: ${totalQuantity}`, colSpan: 4, alignment: 'right', bold: true }],
                                ];
                            }, []),
                        ],
                    },
                },
            ],
        };
        
        // Создаем PDF-файл, на основе documentDefinition, и загружаем его.
        pdfMake.createPdf(documentDefinition).download(`${firstSelectValue}-${secondSelectValue}.pdf`);
    };

    /**
     * Экспортируем данные в файл Excel.
     *
     * @return {void}
     */
    const exportToExcel = () => {
        // Организация данных по типу
        const dataByType = {};
    
        // Добавляем каждый элемент в объект dataByType.
        dataToDisplay.forEach(item => {
            if (!dataByType[item.type]) {
                dataByType[item.type] = [];
            }
            dataByType[item.type].push(item);
        });
    
        // Создаем данные рабочего листа
        const worksheetData = [];
        
        // Добавляет заголовки на основе второго выбранного значения
        secondSelectValue === 'детали' 
            ? worksheetData.push(['Название', 'Количество (шт)', 'Поставщик', 'Тип', 'Ячейка', 'Цена']) 
            : worksheetData.push(['Название(id)', 'Статус', 'В состав заказа #', 'Тип'])
    
        // Добавляет строки данных в рабочий лист
        Object.keys(dataByType).forEach(type => {
            const typeData = dataByType[type];
            typeData.forEach(item => {
                secondSelectValue === 'детали' 
                    ? worksheetData.push([item.detailName, item.quantity, item.provider, item.type, item.slot, item.price ? item.price : '-']) 
                    : worksheetData.push([item.productName, item.endDateOfManufacturer ? 'Изготовлено' : 'В разработке', item.partOfOrder, item.type]);
            });
    
            // Добавляет строку общего количества
            const totalQuantity = typeData.reduce((total, item) => total + (item.quantity || item.part || 0), 0);
            worksheetData.push(['', `Все ${type}:`, totalQuantity, '']);
        });
    
        // Создает рабочий лист и рабочую книгу
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Устанавливает ширину столбцов
        const columnWidths = [
            { wch: 50 }, // Название / Название(id)
            { wch: 20 }, // Количество (шт) / Статус
            { wch: 20 }, // Поставщик / В состав заказа #
            { wch: 15 }, // Тип
            { wch: 10 }, // Ячейка
            { wch: 10 }  // Цена
        ];

        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        
        // Сохраняет книгу как файл Excel
        XLSX.writeFile(workbook, `${firstSelectValue}-${secondSelectValue}.xlsx`);
    };

    // const calculateTotalsByType = (data) => {
    //     const totals = Object.create(null);
    //     for (const item of data) {
    //         const type = item.type || 'Unknown';
    //         totals[type] = (totals[type] || 0) + (item.quantity || 0);
    //     }
    //     return totals;
    // };
    

    // const totalsByType = calculateTotalsByType(dataToDisplay);

    // const getDataWithTotals = (data) => {
    //     // const totals = calculateTotalsByType(data);
    //     const dataWithTotals = [];
    //     let currentType = null;
    //     let totalCount = 0;

    //     for (const item of data) {
    //         if (item.type !== currentType) {
    //             if (currentType !== null) {
    //                 dataWithTotals.push({ isTotalRow: true, type: currentType, quantity: totalCount });
    //             }
    //             currentType = item.type;
    //             totalCount = 0;
    //         }
    //         totalCount += item.quantity || item.part || 0;
    //         dataWithTotals.push({ ...item, isTotalRow: false });
    //     }

    //     if (currentType !== null) {
    //         dataWithTotals.push({ isTotalRow: true, type: currentType, quantity: totalCount });
    //     }

    //     return dataWithTotals;
    // };

    // const dataWithTotals = getDataWithTotals(dataToDisplay);

    /**
     * Вычисляет общее количество элементов в заданном массиве данных.
     *
     * @param {Array} data - Массив элементов, для которых необходимо рассчитать общее количество.
     * @return {number} Общее количество элементов в данном массиве данных.
     */
    const calculateTotalQuantity = (data) => {
        // Инициализирум общее количество равным 0.
        let total = 0;
        
        // Отфильтруем массив данных, чтобы включить только элементы со значением deliveryStatus, равным 0.
        let filteredData = data.filter(item => item.deliveryStatus === 0);
        
        // Перебираем отфильтрованный массив данных (или исходный массив данных, если параметр SecondSelectValue имеет значение «платы»).
        for (const item of (secondSelectValue === 'платы' ? filteredData : data)) {
            // Добавляем количество или 0, если значение не определено к общему количеству.
            total += item.quantity || item.part || 0;
        }
        
        // Возвращаем общее количество.
        return total;
    };

     // Отфильтрованные данные на основе поиска
    const filteredData = dataToDisplay.filter((dataItem) =>
        secondSelectValue === 'детали' ? dataItem.detailName?.toLowerCase().includes(searchValue) || dataItem.type.toLowerCase().includes(searchValue) 
            : dataItem.productName?.toLowerCase().includes(searchValue) || dataItem.type.toLowerCase().includes(searchValue)
    );


    return (
        <div className={SPStyles.mainContainer}>
            <div className={SPStyles.selectContainer}>
                <Select
                    labelId="warehouse-select-label"
                    id="warehouse-select"
                    label="Выберете склад"
                    value={firstSelectValue}
                    onChange={(event) => setFirstSelectValue(event.target.value)}
                >
                    <MenuItem value="Выберете склад">Выберете склад</MenuItem>
                    <MenuItem value="Разбегаево">Разбегаево</MenuItem>
                    <MenuItem value="Склад 1">Склад 1</MenuItem>
                    <MenuItem value="Склад 2">Склад 2</MenuItem>
                </Select>

                <Select
                    labelId="option-select-label"
                    id="option-select"
                    value={secondSelectValue}
                    onChange={(event) => setSecondSelectValue(event.target.value)}
                    label="Выберете опцию"
                >
                    <MenuItem value="Выберете опцию">Выберете опцию</MenuItem>
                    <MenuItem value="детали">Детали</MenuItem>
                    <MenuItem value="платы">Платы</MenuItem>
                </Select>

                {secondSelectValue === 'платы' && (
                    <Select
                        labelId="status-select-label"
                        id="status-select"
                        label="Выберете состояние"
                        value={thirdSelectValue}
                        onChange={(event) => setThirdSelectValue(event.target.value)}
                    >
                        <MenuItem value="Выберете состояние">Выберете состояние</MenuItem>
                        <MenuItem value="Все">Все</MenuItem>
                        <MenuItem value="1">Начальный этап</MenuItem>
                        <MenuItem value="2">Автоматический этап</MenuItem>
                        <MenuItem value="3">Ручной этап</MenuItem>
                        <MenuItem value="4">Готовые платы</MenuItem>
                    </Select>
                )}
                <div className={SPStyles.buttonContainer}>
                    <Button variant="contained" color="primary" onClick={exportToPDF}  className={ArchivePS.blackButton}>
                        Экспорт в PDF
                    </Button>
                    <Button variant="contained" color="primary" onClick={exportToExcel}  className={ArchivePS.blackButton}>
                        Экспорт в Excel
                    </Button>
                    <TextField
                        color="success"
                        type='search'
                        label="Поиск"
                        variant="standard"
                        value={searchValue}
                        onChange={handleSearch}
                        inputProps={{
                            maxLength: 21,
                        }}
                        className={PPStyles.searchField}
                    />
                </div>
            </div>
            <div className={SPStyles.tableDiv}>
                <TableContainer sx={{
                    '&::-webkit-scrollbar': {
                        width: '12px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'rgb(218, 218, 218)',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgb(128, 128, 128)',
                        border: '3px solid rgb(128, 128, 128)',
                        borderRadius: '6px',
                    },
                }}>
                    {secondSelectValue !== 'Выберете опцию' && (
                        <Table>
                            <EnhancedTableHeadArchive
                                secondSelectValue={secondSelectValue}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                            />
                            <TableBody>
                                {filteredData.length > 0 ? (
                                    (() => {
                                        const dataByType = {};
                                        filteredData.forEach(dataItem => {
                                            if (!dataByType[dataItem.type]) {
                                                dataByType[dataItem.type] = [];
                                            }
                                            dataByType[dataItem.type].push(dataItem);
                                        });

                                        const hasDataForPhase = Object.keys(dataByType).some(type => {
                                            const typeData = dataByType[type];
                                            return typeData.some(dataItem => {
                                                if (secondSelectValue === 'платы') {
                                                    return thirdSelectValue === 'Все' || Number(thirdSelectValue) === dataItem.phase;
                                                }
                                                return true;
                                            });
                                        });

                                        if (!hasDataForPhase) {
                                            return (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center">Нет данных</TableCell>
                                                </TableRow>
                                            );
                                        }

                                        return Object.keys(dataByType).map(type => {
                                            const typeData = dataByType[type];
                                            const filteredTypeData = typeData.filter(dataItem => {
                                                if (secondSelectValue === 'платы') {
                                                    return thirdSelectValue === 'Все' || thirdSelectValue === dataItem.phase.toString();
                                                }
                                                return true;
                                            });

                                            if (filteredTypeData.length === 0) {
                                                return null;
                                            }

                                            return (
                                                <React.Fragment key={type}>
                                                    {filteredTypeData.map((dataItem, index) => (
                                                        (secondSelectValue === 'детали' || (secondSelectValue === 'платы' && dataItem.deliveryStatus === 0)) && (
                                                            <TableRow
                                                                key={dataItem.id}
                                                                onContextMenu={(event) => displayMenu(event, dataItem)}
                                                                style={{ cursor: 'pointer', backgroundColor: 'white' }}
                                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6e6e6'}
                                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                            >
                                                                <TableCell align="center">{secondSelectValue === 'детали' ? dataItem.detailName : dataItem.productName}</TableCell>
                                                                <TableCell align="center">{secondSelectValue === 'детали' ? dataItem.quantity : dataItem.endDateOfManufacturer ? 'Изготовлено' : 'В разработке'}</TableCell>
                                                                <TableCell align="center">{secondSelectValue === 'детали' ? dataItem.provider : dataItem.partOfOrder}</TableCell>
                                                                <TableCell align="center">{dataItem.type}</TableCell>
                                                                {secondSelectValue === 'детали' && (<TableCell align="center">{dataItem.slot}</TableCell>)}
                                                                {secondSelectValue === 'детали' && (<TableCell align="center">{dataItem.price ? dataItem.price : '-'}</TableCell>)}
                                                            </TableRow>
                                                        )
                                                    ))}
                                                    {/* Total row */}
                                                    <TableRow key={`total-${type}`}>
                                                        <TableCell colSpan={secondSelectValue === 'детали' ? 4 : 2} align="right" style={{ fontWeight: 'bold', backgroundColor: 'gray' }}>
                                                            Все {type}:
                                                        </TableCell>
                                                        <TableCell colSpan={2} align="left" style={{ fontWeight: 'bold', backgroundColor: 'gray' }}>
                                                            {calculateTotalQuantity(filteredTypeData)}
                                                        </TableCell>
                                                    </TableRow>
                                                </React.Fragment>
                                            );
                                        });
                                    })()
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">Нет данных</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>

                        </Table>
                    )}
                </TableContainer>
            </div>
            <Menu id={MENU_ID}>
                <Submenu label="Переместить на склад в:">
                    {currentDataItem && getAvailableStorages(currentDataItem.storage).map(storage => (
                        <Item key={storage} onClick={handleItemClick} data={{ storage, itemId: currentDataItem.id, type: secondSelectValue === 'детали' ? 'details' : 'products' }}>
                            {storage}
                        </Item>
                    ))}
                </Submenu>
                { ((secondSelectValue === 'детали' && currentDataItem?.quantity === 0) || secondSelectValue !== 'детали') && (
                    <Item onClick={handleDeleteClick} data={{ itemId: currentDataItem?.id, type: secondSelectValue === 'детали' ? 'details' : 'products', provide: currentDataItem?.provider, detail: currentDataItem?.detailName }}>
                        Удалить
                    </Item>
                )}
                <Item onClick={handleFindInStoreClick}>
                    Найти в магазине
                </Item>
            </Menu>
        </div>
    );
};

export default StoragePage;