import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
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


    useEffect(() => {
        if (acceptanceData.length > 0 || acceptanceData?.data?.length > 0) {
            setActiveStep(0);
            const groupedData = acceptanceData?.data?.reduce((acc, item) => {
                acc[item.acceptanceNumber] = acc[item.acceptanceNumber] || [];
                acc[item.acceptanceNumber].push(item);
                return acc;
            }, {});
            const reversedData = Object.values(groupedData).reverse();
            setReversedGroupedData(reversedData);
            setFilteredData(reversedData);
            if ((selectedStartDate && selectedEndDate) || userNameFilter || selectedProvider) {
                sortData();
            }
            console.log(acceptanceData);
        }

    }, [acceptanceData, selectedStartDate, selectedEndDate, userNameFilter, selectedProvider]);

    const handleNext = () => {
        setActiveStep(prevStep => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep(prevStep => prevStep - 1);
    };

    const sortData = () => {
        const endTargetDate = selectedEndDate.split('-').reverse().join('.');
        const startTargetDate = selectedStartDate.split('-').reverse().join('.');
        let filteredData = reversedGroupedData;

        // Применение фильтрации по поставщику
        console.log("Before filtering by provider:", filteredData);
        if (selectedProvider) {
            filteredData = filteredData.map(group => group.filter(item => item.provider === selectedProvider));
        }
        console.log("After filtering by provider:", filteredData);

        // Применение фильтрации по имени пользователя
        if (userNameFilter) {
            filteredData = filteredData.filter(group => group.some(item => item.userName.includes(userNameFilter)));
        }

        // Применение фильтрации по дате
        if (startTargetDate && endTargetDate) {
            const startDateParts = startTargetDate.split('.').map(Number);
            const endDateParts = endTargetDate.split('.').map(Number);

            filteredData = filteredData.filter(group => group.some(item => {
                const itemDateParts = item.date.split(', ')[0].split('.').map(Number);

                // Сравниваем каждый компонент даты (год, месяц, день)
                const startDateObj = new Date(startDateParts[2], startDateParts[1] - 1, startDateParts[0]);
                const endDateObj = new Date(endDateParts[2], endDateParts[1] - 1, endDateParts[0]);
                const itemDateObj = new Date(itemDateParts[2], itemDateParts[1] - 1, itemDateParts[0]);

                return itemDateObj >= startDateObj && itemDateObj <= endDateObj;
            }));
        }
        const filteredDataWithoutEmptyArrays = filteredData.filter(group => group.length > 0);

        setFilteredData(filteredDataWithoutEmptyArrays);
        setIsSorted(true);
        setActiveStep(0);
    };

    // Функция для сброса фильтрации и возврата всех данных
    const resetFilter = () => {
        setFilteredData(reversedGroupedData);
        setIsSorted(false); // Сбрасываем флаг сортировки
        setSelectedEndDate('');
        setSelectedStartDate('');
        setUserNameFilter('');
        setSelectedProvider('');
    };

    const handleStartDateChange = (e) => {
        const selectedDate = e.target.value;
        const today = new Date().toISOString().substr(0, 10);

        if (selectedEndDate && selectedDate > selectedEndDate) {
            setSelectedStartDate(selectedEndDate);
            toast.error("Выбранная дата больше конечной даты!");
        } else if (selectedDate > today) {
            setSelectedStartDate(today);
            toast.error("Выбранная дата больше сегодняшней даты!");
        } else {
            setSelectedStartDate(selectedDate);
        }
    };

    const handleEndDateChange = (e) => {
        const selectedDate = e.target.value;
        const today = new Date().toISOString().substr(0, 10);
        if (selectedDate < selectedStartDate) {
            setSelectedEndDate(selectedStartDate);
            toast.error("Выбранная дата меньше начальной даты!");
        } else if (selectedDate > today) {
            setSelectedEndDate(today);
            toast.error("Выбранная дата больше сегодняшней даты!");

        } else {
            setSelectedEndDate(selectedDate);
        }
    };

    const handleUserNameChange = (e) => {
        setUserNameFilter(e.target.value);

    };

    const handleProviderChange = (e) => {
        setSelectedProvider(e.target.value);
    };

    useEffect(() => {
        if ((selectedStartDate && selectedEndDate) || userNameFilter || selectedProvider) {
            sortData();
        }
    }, [selectedStartDate, selectedEndDate, userNameFilter, selectedProvider]);

    return (
        <Box sx={{
            maxWidth: "none", flexGrow: 1, height: 600,
            border: "1px solid black", display: "flex", flexDirection: "column",
            justifyContent: "space-between", alignItems: "center", textAlign: "center",
            width: "100%", overflow: "hidden",
        }}>
            <div className={ACStyles.acceptanceCarouselTitle}>
                <h3 >Последние приёмки</h3>
            </div>

            <div className={ACStyles.containerFilter}>
                <div className={ACStyles.filterData}>
                    <TextField
                        color="success"
                        id="start-date"
                        label="От"
                        type="date"
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
                            variant="standard"
                            select
                            value={userNameFilter}
                            onChange={handleUserNameChange}
                            className={ACStyles.filterSelect}
                            fullWidth
                        >
                            <MenuItem value="">Все</MenuItem>
                            {usersData.data?.map((user, index) => (
                                <MenuItem key={index} value={user.name}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </>
                    <>
                        <TextField
                            color="success"
                            id="standard-basic"
                            label="Поставщик"
                            variant="standard"
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
                    <Button className={ACStyles.blackButton} onClick={resetFilter}>Сбросить фильтр</Button>
                ) : (
                    <>
                        <Button className={ACStyles.blackButton} onClick={sortData}>Применить фильтр</Button>
                    </>
                )}
            </div>

            <div>
                <Paper
                    square
                    elevation={0}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        alignText: 'center',
                        height: 15,
                        pl: 2,
                        bgcolor: 'background.default',
                    }}
                >
                    {filteredData[activeStep] && filteredData[activeStep].length > 0 ? (
                        <Typography>
                            Приемка от {filteredData[activeStep][0]?.userName}{' '}
                            {filteredData[activeStep][0]?.date}
                        </Typography>
                    ) : (
                        <Typography>Нет данных для отображения</Typography>
                    )}
                </Paper>


                <TableContainer className={ACStyles.carouselTable}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>Имя продукта</TableCell>
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
                <Button
                    style={{ padding: '10px 20px 30px 40px' }}
                    className={` ${activeStep === 0 ? ACStyles.customClass : ACStyles.blackButton}`}
                    disabled={activeStep === 0}
                    onClick={handleBack}
                >
                    Последующий товар
                </Button>

                <Button
                    style={{ padding: '10px 20px 30px 40px' }}
                    className={`${ACStyles.blackButton} ${activeStep === filteredData.length - 1 || filteredData.length === 0 ? ACStyles.customClass : ''}`}
                    disabled={activeStep === filteredData.length - 1 || filteredData.length === 0}
                    onClick={handleNext}
                >
                    Предыдущий товар
                </Button>
            </div>
        </Box>
    );
}

export default SwipeableTextMobileStepper;
