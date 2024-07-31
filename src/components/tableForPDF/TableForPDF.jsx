import React from 'react';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Button } from '@mui/material';
import ArchivePS from '../../Pages/ArchivePage/ArchivePage.module.css';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

function DownloadPDFButton({ filteredData, userLevel }) {
    // Функция для загрузки PDF
    const downloadPDF = () => {
        const documentDefinition = {
            content: [
                {
                    table: {
                        headerRows: 1,
                        widths: ['15%', '20%', '10%', '15%', '15%', '15%', '10%'],
                        body: [
                            ['id', 'Название продукта', 'Кол-во', 'Произведено', 'Дата начала', 'Дата окончания', 'Номер заказа'],
                            ...filteredData
                                .filter(item => item.deliveryStatus === 1)
                                .map((item, index) => [
                                    item.id,
                                    item.secondName,
                                    item.part,
                                    item.manufacturer,
                                    item.startDateOfManufacturer,
                                    item.endDateOfManufacturer,
                                    item.partOfOrder
                                ]),
                        ],
                    },
                },
            ],
        }
        const pdfDoc = pdfMake.createPdf(documentDefinition);
        pdfDoc.download('ArchiveData.pdf'); // Скачивание PDF
    };

    // Функция для печати PDF
    const printPDF = () => {
        const documentDefinition = {
            content: [
                {
                    table: {
                        headerRows: 1,
                        widths: ['15%', '20%', '10%', '15%', '15%', '15%', '10%'],
                        body: [
                            ['id', 'Название продукта', 'Кол-во', 'Произведено', 'Дата начала', 'Дата окончания', 'Номер заказа'],
                            ...filteredData
                                .filter(item => item.deliveryStatus === 1)
                                .map((item, index) => [
                                    item.id,
                                    item.secondName,
                                    item.part,
                                    item.manufacturer,
                                    item.startDateOfManufacturer,
                                    item.endDateOfManufacturer,
                                    item.partOfOrder
                                ]),
                        ],
                    },
                },
            ],
        };

        const pdfDoc = pdfMake.createPdf(documentDefinition);
        pdfDoc.print();
    };

    return (
        <div className={ArchivePS.pdfButtons}>
            <div className={ArchivePS.pdfButton}>
                <Button className={ArchivePS.upperButton} disabled={userLevel > 1} style={{ padding: '5px' }} variant='contained' onClick={downloadPDF}>Скачать PDF</Button>
            </div>
            <div className={ArchivePS.pdfButton}>
                <Button className={ArchivePS.upperButton} disabled={userLevel > 1} style={{ padding: '5px' }} variant='contained' onClick={printPDF}>Печать PDF</Button>
            </div>
        </div>
    );
}

export default DownloadPDFButton;
