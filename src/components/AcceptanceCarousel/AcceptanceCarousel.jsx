import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ACStyles from './AcceptanceCarousel.module.css';
import { MenuItem, Select, TextField } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';


function SwipeableTextMobileStepper({ acceptanceData, providersList, usersData}) {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedStartDate, setSelectedStartDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [userNameFilter, setUserNameFilter] = useState("");
    const [selectedProvider, setSelectedProvider] = useState(""); 
    const [isSorted, setIsSorted] = useState(false); 
    const [reversedGroupedData, setReversedGroupedData] = useState([]);
    const [filterCriteria, setFilterCriteria] = useState('acceptanceNumber');


    useEffect(() => {
        const today = new Date();
        
        //const formattedDate = today.toISOString().substr(0, 10);

        //setSelectedStartDate(formattedDate);
        //setSelectedEndDate(formattedDate);

    }, []);

    useEffect(() => {
        setActiveStep(0);
        const groupedData = acceptanceData.reduce((acc, item) => {
            acc[item.acceptanceNumber] = acc[item.acceptanceNumber] || [];
            acc[item.acceptanceNumber].push(item);
            return acc;
        }, {});
        const reversedData = Object.values(groupedData).reverse();
        setReversedGroupedData(reversedData);
        setFilteredData(reversedData); 
    }, [acceptanceData, filterCriteria]);

    // const groupedData = acceptanceData.reduce((acc, item) => {
    //     acc[item[filterCriteria]] = acc[item[filterCriteria]] || [];
    //     acc[item[filterCriteria]].push(item);
    //     return acc;
    // }, {});

    const [filteredData, setFilteredData] = useState([]);

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
        if (selectedProvider) {
            filteredData = filteredData.filter(group => group.some(item => item.provider === selectedProvider));
        }
    
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
        
    
        setFilteredData(filteredData);
        setIsSorted(true);
        setActiveStep(0);
    };
    
    // Функция для сброса фильтрации и возврата всех данных
    const resetFilter = () => {
        setFilteredData(reversedGroupedData);
        setIsSorted(false); // Сбрасываем флаг сортировки
        //setUserNameFilter(""); // Сбрасываем фильтр по имени пользователя
        //setSelectedProvider(""); // Сбрасываем выбранного поставщика
        setSelectedEndDate('');
        setSelectedStartDate('');
    };

    const handleStartDateChange = (e) => {
        const selectedDate = e.target.value;
        const today = new Date().toISOString().substr(0, 10);
        if (selectedDate > today) {          
            setSelectedStartDate(today);
            toast.error("Выбранная дата больше начальной даты!");

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
    
    const handleChangeFilterCriteria = (e) => {
        setFilterCriteria(e.target.value)
    };

    useEffect(() => {
        if((selectedStartDate && selectedEndDate) || userNameFilter || selectedProvider) {
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
                <h3>Последние приёмки</h3>
                
            </div>

            <div className={ACStyles.containerFilter}>
                <div className={ACStyles.filterData}>
                    <TextField
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
                            {usersData.map((user, index) => (
                                <MenuItem key={index} value={user.name}>
                                {user.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </>
                    <>
                        <TextField
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
                    <Button className={ACStyles.button} onClick={resetFilter}>Сбросить фильтр</Button>
                ) : (
                    <>
                        <Button className={ACStyles.button} onClick={sortData}>Применить фильтр</Button>
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
                    {filteredData[activeStep] && (
                        <Typography>Приемка от {filteredData[activeStep][0]?.userName} {filteredData[activeStep][0]?.date}</Typography>
                    )}
                </Paper>
                <div className={ACStyles.acceptanceCarouselContainer}>
                    <ul>
                        {Array.isArray(filteredData[activeStep]) ? (
                            filteredData[activeStep].map((item, itemIndex) => (
                                <li key={itemIndex}>
                                    {item.productName} - {item.quantity}шт ({item.provider})
                                </li>
                            ))
                        ) : (
                            <li>Нет данных для отображения</li>
                        )}
                    </ul>
                </div>
            </div>

            
            <div className={ACStyles.buttonContainer}>
                <Button className={ACStyles.button} disabled={activeStep === 0} onClick={handleBack} > Последующий добавленный товар </Button>
                <Button className={ACStyles.button} disabled={activeStep === filteredData.length - 1} onClick={handleNext} >Предыдущий добавленный товар</Button>
            </div>
        </Box>
    );
}

export default SwipeableTextMobileStepper;
