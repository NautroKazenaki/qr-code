import React, { useEffect, useState } from 'react';
import PPStyles from './ProvidersPage.module.css';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField } from '@mui/material';
import axios from 'axios';
import { sendDataToHistory } from '../../utils/addHistory';

const Cells = [
    {
        id: 'id',
        numeric: true,
        disablePadding: true,
        label: 'ID',
    },
    {
        id: 'productName',
        numeric: false,
        disablePadding: false,
        label: 'Наименование детали',
    },
    {
        id: 'date',
        numeric: false,
        disablePadding: false,
        type: Date,
        label: 'Дата приёмки',
    },
    {
        id: 'provider',
        numeric: false,
        disablePadding: false,
        label: 'Поставщик (Кол-во браков)',
    },
    {
        id: 'actions',
        numeric: false,
        disablePadding: false,
        label: 'Управление браком',
    },
    {
        id: 'quantity',
        numeric: false,
        disablePadding: false,
        label: 'Количество',
    },
];
/**
 * Отображает заголовок таблицы с сортируемыми столбцами и полем поиска.
 * @param {Object} props - свойства компонента
 * @param {string} props.order - Текущий порядок сортировки.
 * @param {string} props.searchValue - Текущее значение поиска.
 * @param {function} props.handleSearch - Функция для обработки изменений поиска.
 * @param {string} props.orderBy - Свойство для сортировки.
 * @param {function} props.onRequestSort - Функция для обработки сортировки.
 * @returns {JSX.Element} Отрисованный заголовок таблицы.
 */
export function EnhancedTableProvidersHead({ order, searchValue, handleSearch, orderBy, onRequestSort }) {
    // Определяет ячейки таблицы
    const headCells = Cells;

    /**
     * Создает обработчик сортировки для определенного свойства.
     * @param {string} property - Свойство для сортировки.
     * @returns {function} Функция обработчика сортировки.
     */
    const createSortHandler = (property) => (event) => {
        // Вызовите функцию onRequestSort с событием и свойством.
        onRequestSort(event, property);
    };

    return (
        <TableHead className={PPStyles.customTableHead}>
            <TableRow>
                {/* Пробегается по каждой ячейки таблицы */}
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id} // Установливает ключ для id ячейки
                        align={headCell.numeric ? 'center' : 'center'} // Установливает выравнивание на основе числового свойства ячейки.
                        sortDirection={orderBy === headCell.id ? order : false} // Установливает направление сортировки на основе свойств order и orderBy.
                        className={PPStyles.sticky} // Добавляет  класс к ячейке
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id} // Установливает активное состояние на основе свойства orderBy.
                            direction={orderBy === headCell.id ? order : 'asc'} // Установливает направление сортировки на основе свойств order и orderBy.
                            onClick={createSortHandler(headCell.id)} //Добавляет событие onClick для функции createSortHandler.
                        >
                            {headCell.label}
                        </TableSortLabel>
                    </TableCell>
                ))}
                {/* Добавления ячейку поля поиска */}
                <TableCell>
                    <TextField
                        color="success"
                        type='search'
                        label="Поиск по поставщику" //  Заголовок поля поиска
                        variant="standard" // стилизация поиска
                        value={searchValue} // Установливает значение поля поиска на основе свойства searchValue.
                        onChange={handleSearch} // Установливает событие onChange для функции handleSearch.
                        inputProps={{
                            maxLength: 21, // Установливает максимальную длину поля поиска
                        }}
                        className={PPStyles.searchField} // Добавляет класс для поля поиска
                    />
                </TableCell>
            </TableRow>
        </TableHead>
    );
}

const ProvidersPage = ({ userLevel }) => {
    const [dataToView, setDataToView] = useState([]);
    const [providers, setProviders] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('');
    const [searchValue, setSearchValue] = useState('');

    /**
     * Снижает брак у поставщика.
     * 
     * @param {string} provider - Имя поставщика.
     */
    const removeError = async (provider) => {
        try {
            // Ищет поставщика в списке поставщиков
            const foundProvider = providers.find((p) => p.name === provider);

            // Проверяет, есть ли у поставщика счетчик брака
            if (foundProvider?.error_count > 0) {
                // Отправляет PUT-запрос на сервер, чтобы снизить брак.
                await axios.put('http://192.168.0.123:3001/providers', {
                    provider: provider,
                    error: false
                });
                await sendDataToHistory(`Убрал брак у поставщика ${foundProvider.name}`);

                // Получает последние данные с сервера
                fetchData();
            }
        } catch (error) {
            //Логирует сообщение об ошибке, если есть ошибка
            console.error('Error removing error:', error);
        }
    };

    /**
      * увеличивает брак у поставщика.
      *
      * @param {string} provider - Имя поставщика.
      * @returns {Promise<void>} - Промис, который разрешится при добавлении брака.
      */
    const addError = async (provider) => {
        try {
            // Отправляет запрос PUT на сервер, чтобы добавить брак поставщику.
            await axios.put('http://192.168.0.123:3001/providers', { provider: provider, error: true });

            await sendDataToHistory(`Добавил брак у поставщика ${provider}`);

            // Получает последние данные с сервера.
            fetchData();
        } catch (error) {
            // Логирует сообщение об ошибке, если возникает ошибка при добавлении брака.
            console.error('Error adding error:', error);
        }
    };

    /**
     * Получает данные с сервера и обновляет состояние компонента.
     *
     * @returns {Promise<void>} - Промис, который выполняется при получении данных и обновлении состояния.
     */
    const fetchData = async () => {
        try {
            // Получает данные с сервера
            const response = await axios.get('http://192.168.0.123:3001/providers'); // Получает данные поставщиков
            const response2 = await axios.get('http://192.168.0.123:3001/acceptance'); // Получает данные о приемках

            console.log(response)

            // Обновляет состояние компонента полученными данными.
            setDataToView(response2.data); // Устанавливает данные для просмотра вместе с данными о приемках
            setProviders(response.data); // Устанавливает поставщиков 
        } catch (error) {
            //Логирует сообщение об ошибке, если при получении данных возникла ошибка.
            console.error('Error fetching data:', error);
        }
    };

    /**
     * Обрабатывает запрос на сортировку данных по определенному свойству.
     *
     * @param {Event} event - Событие, которое вызвало запрос на сортировку.
     * @param {string} property - Свойство для сортировки данных.
     * @return {void}
     */
    const handleRequestSort = (event, property) => {
        // Проверяет, совпадает ли текущее свойство сортировки с запрошенным свойством и является ли порядок сортировки возрастающим.
        const isAsc = orderBy === property && order === 'asc';

        // Установливает новый порядок сортировки на основе текущего свойства сортировки.
        setOrder(isAsc ? 'desc' : 'asc');

        // Установливает новое свойство для сортировки.
        setOrderBy(property);
    };

    /**
     * Сортирует данные на основе указанного свойства.
     *
     * @return {Array} - Отсортированный массив данных.
     */
    const sortedData = () => {
        /**
         * Сравнивает два элемента на основе указанного свойства.
         *
         * @param {Object} a -Первый объект для сравнения.
         * @param {Object} b - Второй объект для сравнения.
         * @return {number} - Возвращает отрицательное значение, если a следует отсортировать до b,
         *  положительное значение, если a следует отсортировать после b,
         *  или 0, если они равны.
         */
        return [...dataToView].sort((a, b) => {
            // Если свойство orderBy определено
            if (orderBy) {
                //Получает значение текущего свойства для обоих элементов.
                const aValue = a[orderBy] ?? ''; // Использует нулевой оператор объединения для обработки нулевых или неопределенных значений.
                const bValue = b[orderBy] ?? '';

                // Сравнивает значения и возвращает соответствующий порядок сортировки.
                if (aValue < bValue) {
                    return order === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return order === 'asc' ? 1 : -1;
                }
            }
            // Если свойство orderBy не определено, возвращает 0, чтобы указать отсутствие сортировки.
            return 0;
        });
    };

    /**
     * Обрабатывает событие изменения входных данных поиска.
     *
     * @param {Object} e - Объект события, содержащий целевое значение.
     * @return {void}
     */
    const handleSearch = (e) => {
        // Получает значение введенное пользователем и преобразует его в нижний регистр.
        const inputValue = e.target.value.toLowerCase();

        // Обновляет состояние поискового значения новым входным значением.
        setSearchValue(inputValue);
    };

    useEffect(() => {
        setDataToView(sortedData());
    }, [order, orderBy]);

    useEffect(() => {
        const fetchDataAsync = async () => {
            await fetchData();
        };

        fetchDataAsync();
    }, []);

    // Отфильтрованные данные на основе поиска
    const filteredData = dataToView.filter((dataItem) =>
        dataItem.provider?.toLowerCase().includes(searchValue) || dataItem.productName.toLowerCase().includes(searchValue)
    );

    return (
        <div className={PPStyles.tableDiv}>

            <TableContainer className={PPStyles.tableContainer}>
                <Table>
                    <EnhancedTableProvidersHead
                        order={order}
                        searchValue={searchValue}
                        handleSearch={handleSearch}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                    />
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((dataItem) => (
                                <TableRow
                                    key={dataItem.id}
                                    className={providers.find((p) => p.name === dataItem.provider)?.error_count > 3 ? PPStyles.errorRow : PPStyles.normalRow}
                                >
                                    <TableCell align="center">{dataItem.id}</TableCell>
                                    <TableCell align="center">{dataItem.productName}</TableCell>
                                    <TableCell align="center">{dataItem.date}</TableCell>
                                    <TableCell align="center">
                                        {dataItem.provider} (
                                        {providers.find((p) => p.name === dataItem.provider)?.error_count ?? 0}
                                        )
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            className={PPStyles.addErrorButton}
                                            align="center"
                                            variant="contained"
                                            size="small"
                                            onClick={() => addError(dataItem.provider)}
                                        >
                                            + брак
                                        </Button>
                                        <Button
                                            className={PPStyles.removeErrorButton}
                                            align="center"
                                            variant="contained"
                                            size="small"
                                            onClick={() => removeError(dataItem.provider)}
                                        >
                                            - брак
                                        </Button>
                                    </TableCell>
                                    <TableCell align="center">{dataItem.quantity}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Нет данных</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ProvidersPage;
