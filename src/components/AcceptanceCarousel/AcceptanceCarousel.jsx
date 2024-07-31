import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ACStyles from './AcceptanceCarousel.module.css';
import { MenuItem, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

function SwipeableTextMobileStepper({ acceptanceData, providersList, usersData }) {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedStartDate, setSelectedStartDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [userNameFilter, setUserNameFilter] = useState("");
    const [selectedProvider, setSelectedProvider] = useState("");
    const [isSorted, setIsSorted] = useState(false);
    const [reversedGroupedData, setReversedGroupedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const customScrollbar = {
        '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgb(0,0,0);',
            borderRadius: '4px',
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '4px'
        },
      }


    useEffect(() => {
        if (acceptanceData.length > 0 || acceptanceData?.data?.length > 0) {
            setActiveStep(0);
            const parseDate = dateString => {
                const [datePart, timePart] = dateString.split(', ');
                const [day, month, year] = datePart.split('.');
                const [hours, minutes, seconds] = timePart.split(':');
                return new Date(year, month - 1, day, hours, minutes, seconds);
            };
            
            // Объединяем все вложенные массивы в один массив
            const flatData = acceptanceData.data.flat();
            
            // Добавляем объекты Date к каждому элементу и сортируем массив по времени
            flatData.forEach(item => {
                item.dateObject = parseDate(item.date);
            });
            flatData.sort((a, b) => a.dateObject - b.dateObject);
            
            // Группируем объекты по одинаковым датам и времени
            const groupedData = flatData.reduce((acc, item) => {
                const key = item.date;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(item);
                return acc;
            }, {});
            
            // Преобразуем сгруппированные данные в массив массивов
            const result = Object.values(groupedData);
            const reversedData = Object.values(result).reverse();
            setReversedGroupedData(reversedData);
            setFilteredData(reversedData);
            if ((selectedStartDate && selectedEndDate) || userNameFilter || selectedProvider) {
                sortData();
            }
        }

    }, [acceptanceData, selectedStartDate, selectedEndDate, userNameFilter, selectedProvider,]);

    /**
     * Обрабатывает событие, когда пользователь нажимает кнопку «Следующая».
     * Увеличивает номер на 1.
     *
     * @return {void} Эта функция ничего не возвращает.
     */
    const handleNext = () => {
        setActiveStep(prevStep => prevStep + 1);
    };

    /**
     * Обрабатывает событие, когда пользователь нажимает кнопку "Предыдущая".
     * Уменьшает номер на 1.
     *
     * @return {void} Эта функция ничего не возвращает.
     */
    const handleBack = () => {
        setActiveStep(prevStep => prevStep - 1);
    };

    /**
     * Сортирует данные о приемках на основе выбранных фильтров.
     * Сбрасывает счетчик на 0.
     * Устанавливает сортировочный флаг на True.
     * Фильтрует данные на основе выбранного поставщика, имени пользователя и диапазона дат.
     * Удаляет любые пустые массивы из фильтрованных данных.
     * Обновляет отфильтрованное состояние данных.
     *
     * @return {void}
     */
    const sortData = () => {
        // Форматирует выбранные строки даты в соответствии с форматом данных
        const endTargetDate = selectedEndDate.split('-').reverse().join('.');
        const startTargetDate = selectedStartDate.split('-').reverse().join('.');

        // Фильтрует данные на основе выбранного поставщика
        let filteredData = reversedGroupedData;
        if (selectedProvider) {
            filteredData = filteredData.map(group => group.filter(item => item.provider === selectedProvider));
        }

        // Фильтрует данные на основе фильтра имени пользователя
        if (userNameFilter) {
            filteredData = filteredData.filter(group => group.some(item => item.userName.includes(userNameFilter)));
        }

        // Фильтрует данные на основе диапазона дат
        if (startTargetDate && endTargetDate) {
            const startDateParts = startTargetDate.split('.').map(Number);
            const endDateParts = endTargetDate.split('.').map(Number);

            filteredData = filteredData.filter(group => group.some(item => {
                const itemDateParts = item.date.split(', ')[0].split('.').map(Number);

                // Сравниет каждую дату (год, месяц, день)
                const startDateObj = new Date(startDateParts[2], startDateParts[1] - 1, startDateParts[0]);
                const endDateObj = new Date(endDateParts[2], endDateParts[1] - 1, endDateParts[0]);
                const itemDateObj = new Date(itemDateParts[2], itemDateParts[1] - 1, itemDateParts[0]);

                return itemDateObj >= startDateObj && itemDateObj <= endDateObj;
            }));
        }

        // Удаляет любые пустые массивы из фильтрованных данных
        const filteredDataWithoutEmptyArrays = filteredData.filter(group => group.length > 0);

        // Обновляет состояние отфильтрованных данных
        setFilteredData(filteredDataWithoutEmptyArrays);
        setIsSorted(true);
        setActiveStep(0);
    };

    // Функция для сброса фильтрации и возврата всех данных
    const resetFilter = () => {
        setFilteredData(reversedGroupedData);
        setIsSorted(false); // Сбрасывает флаг сортировки
        setSelectedEndDate('');
        setSelectedStartDate('');
        setUserNameFilter('');
        setSelectedProvider('');
    };

    /**
 * Обрабатывает изменение начальной даты.
 *
 * @param {Object} e - Событие изменения.
 * @param {Object} e.target - Целевой элемент события.
 * @param {string} e.target.value - Новое значение даты.
 * @return {void}
 */
const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().substr(0, 10);

    // Проверяем, что начальная дата не больше конечной даты
    if (selectedEndDate && selectedDate > selectedEndDate) {
        setSelectedStartDate(selectedEndDate);
        toast.error("Выбранная дата больше конечной даты!");
    // Проверяем, что начальная дата не больше сегодняшней даты
    } else if (selectedDate > today) {
        setSelectedStartDate(today);
        toast.error("Выбранная дата больше сегодняшней даты!");
    } else {
        // Устанавливаем выбранную дату
        setSelectedStartDate(selectedDate);
    }
};

    /**
     * Обрабатывает изменение конечной даты.
     *
     * @param {Object} e - Событие изменения.
     * @param {Object} e.target - Целевой элемент события.
     * @param {string} e.target.value - Новое значение даты.
     * @return {void}
     */
    const handleEndDateChange = (e) => {
        const selectedDate = e.target.value;
        const today = new Date().toISOString().substr(0, 10);

        // Проверяем, что конечная дата не меньше начальной даты
        if (selectedDate < selectedStartDate) {
            setSelectedEndDate(selectedStartDate);
            toast.error("Выбранная дата меньше начальной даты!");
        // Проверяем, что конечная дата не больше сегодняшней даты
        } else if (selectedDate > today) {
            setSelectedEndDate(today);
            toast.error("Выбранная дата больше сегодняшней даты!");

        } else {
            // Устанавливаем выбранную дату
            setSelectedEndDate(selectedDate);
        }
    };

    /**
     * Обрабатывает событие изменения имени пользователя.
     *
     * @param {Object} e - Объект события.
     * @param {string} e.target.value - Новое значение имени пользователя.
     * @return {void}
     */
    const handleUserNameChange = (e) => {
        /**
         * Устанавливает состояние фильтра имени пользователя в новое значение имени пользователя.
         *
         * @param {string} newValue - Новое значение имени пользователя.
         */
        setUserNameFilter(e.target.value);

    };

    /**
     * Обрабатывает событие изменения поставщика.
     *
     * @param {Object} e - Объект события.
     * @param {string} e.target.value - Новое значение поставщика.
     * @return {void}
     */
    const handleProviderChange = (e) => {
        /**
         * Устанавливает состояние выбранного поставщика в новое значение поставщика.
         *
         * @param {string} newValue - Новое значение поставщика.
         */
        setSelectedProvider(e.target.value);
    };

    //хук, который отслиживает изменения в выбранных параметрах и вызывает функцию сортировки
    useEffect(() => {
        if ((selectedStartDate && selectedEndDate) || userNameFilter || selectedProvider) {
            sortData();
        }
    }, [selectedStartDate, selectedEndDate, userNameFilter, selectedProvider]);

    return (
        <Box sx={{
            maxWidth: "none", flexGrow: 1, height: 600,
            display: "flex", flexDirection: "column",
            justifyContent: "space-between", alignItems: "center", textAlign: "center",
            width: "100%", overflow: "hidden",
        }}>
            <div className={ACStyles.acceptanceCarouselTitle}>
                <h1>Последние приёмки</h1>
            </div>

            <div className={ACStyles.containerFilter}>
                <div className={ACStyles.filterData}>
                    <TextField
                        color="success"
                        id="start-date"
                        label="От"
                        type="date"
                        variant='filled'
                        sx={{
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: 'rgb(0, 108, 42)',
                            },
                            '& .MuiFilledInput-underline:after': {
                                borderBottomColor: 'rgb(0, 108, 42)',
                            },
                            '& .MuiFilledInput-root': {
                                backgroundColor: 'white',
                                width: '150px',
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
                        value={selectedStartDate}
                        onChange={handleStartDateChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <TextField
                        color="success"
                        id="end-date"
                        label="До"
                        type="date"
                        variant='filled'
                        sx={{
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: 'rgb(0, 108, 42)',
                            },
                            '& .MuiFilledInput-underline:after': {
                                borderBottomColor: 'rgb(0, 108, 42)',
                            },
                            '& .MuiFilledInput-root': {
                                backgroundColor: 'white',
                                width: '150px',
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
                        value={selectedEndDate}
                        onChange={handleEndDateChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                </div>
                <div className={ACStyles.filter}>
                    <>
                        <TextField
                            color="success"
                            id="standard-basic"
                            label="Имя пользователя"
                            variant='filled'
                        sx={{
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: 'rgb(0, 108, 42)',
                            },
                            '& .MuiFilledInput-underline:after': {
                                borderBottomColor: 'rgb(0, 108, 42)',
                            },
                            '& .MuiFilledInput-root': {
                                backgroundColor: 'white',
                                width: '150px',
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
                            select
                            value={userNameFilter}
                            onChange={handleUserNameChange}
                            className={ACStyles.filterSelect}
                            fullWidth
                        >
                            <MenuItem value="">Все</MenuItem>
                            {usersData.data?.map((user, index) => (
                                <MenuItem key={index} value={user}>
                                    {user}
                                </MenuItem>
                            ))}
                        </TextField>
                    </>
                    <>
                        <TextField
                            color="success"
                            id="standard-basic"
                            label="Поставщик"
                            variant='filled'
                        sx={{
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: 'rgb(0, 108, 42)',
                            },
                            '& .MuiFilledInput-underline:after': {
                                borderBottomColor: 'rgb(0, 108, 42)',
                            },
                            '& .MuiFilledInput-root': {
                                backgroundColor: 'white',
                                width: '150px',
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
                            select
                            value={selectedProvider}
                            onChange={handleProviderChange}
                            className={ACStyles.filterSelect}
                            fullWidth
                        >
                            <MenuItem value="">Все</MenuItem>
                            {providersList.map((provider, index) => (
                                <MenuItem key={index} value={provider}>{provider}</MenuItem>
                            ))}
                        </TextField>
                    </>

                </div>
                {isSorted ? (
                    <div className={ACStyles.blackButtonContainer}>
                        <button className={ACStyles.blackButton} onClick={resetFilter}>Сбросить фильтр</button>
                    </div>
                ) : (
                    <div className={ACStyles.blackButtonContainer}>
                        <button className={ACStyles.blackButton} onClick={sortData}>Применить фильтр</button>
                    </div>
                )}
            </div>

            <div className={ACStyles.lastAcceptanceTableContainer}>
                <Paper
                    square
                    elevation={0}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        alignText: 'center',
                        height: '10%',
                        pl: 2,
                        bgcolor: 'rgb(217,217,217)',
                        padding: "3%",
                        justifyContent: 'center'
                    }}
                >
                    {filteredData[activeStep] && filteredData[activeStep].length > 0 ? (
                        <Typography>
                            <b>
                                Приемка от: {filteredData[activeStep][0]?.userName}{' '}
                                {filteredData[activeStep][0]?.date}
                            </b>
                        </Typography>
                    ) : (
                        <Typography>Нет данных для отображения</Typography>
                    )}
                </Paper>


                <TableContainer className={ACStyles.carouselTable} sx={{ ...customScrollbar }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>Название детали</TableCell>
                                <TableCell align="center" style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>Количество</TableCell>
                                <TableCell align="center" style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>Поставщик</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData[activeStep]?.map((item, itemIndex) => (
                                <TableRow key={itemIndex}>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell align="center">{item.quantity} шт</TableCell>
                                    <TableCell align="center">{item.provider}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

            </div>
            <div className={ACStyles.buttonContainer}>
                <button
                    className={` ${activeStep === 0 ? ACStyles.customClass : ACStyles.blackButton}`}
                    disabled={activeStep === 0}
                    onClick={handleBack}
                >
                    Последующая приемка
                </button>

                <button
                    className={`${ACStyles.blackButton} ${activeStep === filteredData.length - 1 || filteredData.length === 0 ? ACStyles.customClass : ''}`}
                    disabled={activeStep === filteredData.length - 1 || filteredData.length === 0}
                    onClick={handleNext}
                >
                    Предыдущая приемка
                </button>
            </div>
        </Box>
    );
}

export default SwipeableTextMobileStepper;
