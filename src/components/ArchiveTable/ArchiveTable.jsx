import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ArchivePS from '../../Pages/ArchivePage/ArchivePage.module.css';

const headCells = [
  {
    id: 'id',
    numeric: false,
    disablePadding: true,
    label: 'ID',
  },
  {
    id: 'productName',
    numeric: true,
    disablePadding: false,
    label: 'Название продукта',
  },
  {
    id: 'part',
    numeric: true,
    disablePadding: false,
    label: 'Количество',
  },
  {
    id: 'manufacturer',
    numeric: false,
    disablePadding: true,
    label: 'Произведено',
  },
  {
    id: 'startDate',
    numeric: false,
    disablePadding: true,
    label: 'Дата начала',
  },
  {
    id: 'endDate',
    numeric: false,
    disablePadding: true,
    label: 'Дата окончания',
  },
  {
    id: 'partOfOrder',
    numeric: false,
    disablePadding: true,
    label: 'Номер заказа',
  },
];

/**
 * Отображает заголовок таблицы для страницы «Архив».
 *
 * @param {Object} props - свойства компонента.
 * @param {function} props.onRequestSort - Функция для обработки сортировки.
 * @param {string} props.order - Текущий порядок сортировки.
 * @param {string} props.orderBy - Свойство для сортировки.
 * @returns {JSX.Element} Отрисованный заголовок таблицы.
 */
export function EnhancedTableHeadArchive({ onRequestSort, order, orderBy }) {
  // Отображает заголовок таблицы с помощью пользовательских стилей и интерактивных ячеек.
  return (
    <TableHead className={ArchivePS.customTableHead}>
      <TableRow>
        {/* Отображает каждую ячейку заголовка таблицы */}
        {headCells.map((headCell) => (
          <TableCell
            className={ArchivePS.customTableHeadCell}
            // Добавляем жирный стиль и указатель курсора, чтобы сделать его интерактивным.
            style={{ fontWeight: "bold", cursor: 'pointer' }}
            key={headCell.id}
            align={headCell.numeric ? 'center' : 'center'}
            // Добавляем обработчик событий клика для сортировки.
            onClick={() => onRequestSort(headCell.id)}
          >
            {/* Отображение метки ячейки */}
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

