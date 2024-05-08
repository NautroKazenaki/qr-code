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

export function EnhancedTableHeadArchive({ onRequestSort, order, orderBy }) {
  return (
    <TableHead className={ArchivePS.customTableHead}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            style={{ color: "#1976d2", fontWeight: "bold", cursor: 'pointer' }} // добавляем cursor: 'pointer' чтобы указать, что заголовок является интерактивным
            key={headCell.id}
            align={headCell.numeric ? 'center' : 'center'}
            onClick={() => onRequestSort(headCell.id)} // добавляем обработчик события onClick
          >
            {headCell.label}
        </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

