import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel, FormControl, TextField,
} from '@mui/material';
import axios from 'axios';
import HPStyles from './HistoryPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import APStyles from '../../Pages/AcceptancePage/AcceptancePage.module.css';
/**
 * Компонент HistoryPage отображает таблицу истории действий пользователя.
 * Он получает данные с сервера и фильтрует их на основе пользовательского ввода.
 */
const HistoryPage = () => {
  // Переменные состояния для хранения полученных данных, фильтров и загруженных данных
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ username: '', page: '', dateFrom: '', dateTo: '' });
  const [filteredData, setFilteredData] = useState([]);
  const [message, setMessage] = useState("Выберете параметр для поиска и всё увидите");
  const [users, setUsers] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');


  // Получение данных с сервера при изменении фильтров
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let usersResponse = await axios.get('http://192.168.0.123:3001/users');
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchData = async () => {
      try {
        if (filters.username || filters.page || (filters.dateFrom && filters.dateTo)) {
          let fetchedData = await axios.get('http://192.168.0.123:3001/history', { params: filters });
          setData(fetchedData.data.reverse());
          setMessage('');
        } else {
          setData([]);
          setMessage("Выберете параметр для поиска и всё увидите");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUsers();
    fetchData();
  }, [filters]);

  /**
   * Обработка изменения фильтров пользовательского ввода
   * @param {object} event - Объект события изменения входного сигнала
   */
  const handleFilterChange = ({ target: { name, value } }) => {
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleStartDateChange = ({ target: { value } }) => {
    const formattedDate = `${value} 00:00:00`;
    setSelectedStartDate(value);
  const handleStartDateChange = (event) => {
    const value = event.target.value;
    const formattedDate = dayjs(value).format('DD.MM.YYYY') + ' 00:00:00';
    const displayDate = dayjs(value).format('DD.MM.YYYY') + ' 00:00:00';
    setSelectedStartDate(value);
    setFilters(prevFilters => ({ ...prevFilters, dateFrom: formattedDate }));
  };
  };

  const handleEndDateChange = (event) => {
    const value = event.target.value;
    const formattedDate = dayjs(value).format('DD.MM.YYYY') + ' 23:59:59';
    const displayDate = dayjs(value).format('DD.MM.YYYY') + ' 23:59:59';
    setSelectedEndDate(value);
    setFilters(prevFilters => ({ ...prevFilters, dateTo: formattedDate }));
  };

  const resetFilters = () => {
    setFilters({ username: '', page: '', dateFrom: '', dateTo: '' });
    setSelectedStartDate('');
    setSelectedEndDate('');
    setMessage("Выберете параметр для поиска и всё увидите");
    setData([]);
  };

  // Фильтрация данных на основе фильтров, введенных пользователем
  useEffect(() => {
    setFilteredData(data.filter((row) => {
      const rowDate = row.date;
      const dateFrom = filters.dateFrom ? filters.dateFrom : null;
      const dateTo = filters.dateTo ? filters.dateTo : null;

      return (
        row.username.toLowerCase().includes(filters.username.toLowerCase()) &&
        row.page.toLowerCase().includes(filters.page.toLowerCase()) &&
        (!dateFrom || rowDate >= dateFrom) &&
        (!dateTo || rowDate <= dateTo)
      );
    }));
  }, [data, filters]);

  return (
    <TableContainer component={Paper}>
      {/* Отображение фильтров пользовательского ввода */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1%' }}>
        <FormControl style={{ marginRight: '8px', minWidth: 120 }}>
          <InputLabel>Имя</InputLabel>
          <Select
            label="Имя"
            name="username"
            value={filters.username}
            onChange={handleFilterChange}
          >
            <MenuItem value=""><em>Выберете пользователя</em></MenuItem>
            {users.map((user) => (
              <MenuItem key={user} value={user}>{user}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ marginRight: '8px', minWidth: 120 }}>
          <InputLabel>Раздел</InputLabel>
          <Select
            label="Раздел"
            name="page"
            value={filters.page}
            onChange={handleFilterChange}
          >
            <MenuItem value=""><em>Выберете раздел</em></MenuItem>
            <MenuItem value="Панель администратора">Панель администратора</MenuItem>
            <MenuItem value="Приёмка">Приёмка</MenuItem>
            <MenuItem value="Сборка">Сборка</MenuItem>
            <MenuItem value="Разработка">Разработка</MenuItem>
            <MenuItem value="Архив">Архив</MenuItem>
            <MenuItem value="Склад">Склад</MenuItem>
            <MenuItem value="Поставщики">Поставщики</MenuItem>
            <MenuItem value="Закупки">Закупки</MenuItem>
          </Select>
        </FormControl>
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
        <button
          variant="contained"
          color="primary"
          onClick={resetFilters}
          className={APStyles.blackButton}
        >
          Сбросить фильтры
        </button>
      </div>
      {/* Отображение таблицы отфильтрованных данных */}
      {message ? (
        <motion.div
          style={{ textAlign: 'center', marginTop: '20px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {message}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Table className={HPStyles.tableContainer} >
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '10%' }}>Имя</TableCell>
                <TableCell style={{ width: '25%' }}>Раздел</TableCell>
                <TableCell style={{ width: '25%' }}>Дата</TableCell>
                <TableCell style={{ width: '25%' }}>Действие</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {filteredData.map((row, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    component={TableRow}
                  >
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{row.page}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.action}</TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </motion.div>
      )}
    </TableContainer>
  );
};

export default HistoryPage;
