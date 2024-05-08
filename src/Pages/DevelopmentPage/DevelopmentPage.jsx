import React, { useEffect, useState, } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DPStyles from './Development.module.css';
import QRCode from 'qrcode';

import { TextField, Button } from '@mui/material';

const ItemTypes = {
    CARD: 'card',
};

const Card = ({ id, text, containerId, className }) => {
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.CARD,
        item: { type: ItemTypes.CARD, id, containerId },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div ref={drag} className={`${className} ${DPStyles.draggableItem} ${isDragging ? DPStyles.dragging : ''}`}>
            {text}
        </div>
    );
};

const Container = ({ containerId, moveCard, cards, title }) => {
    const [, drop] = useDrop({
        accept: ItemTypes.CARD,
        drop: (item, monitor) => {
            if (item.containerId !== containerId) {
                moveCard(item.id, item.containerId, containerId);
            }
        },
    });

    return (
        <div ref={drop} className={DPStyles.lower_section}>
            {cards
                .filter((card) => card.containerId === containerId)
                .map((card) => (
                    <Card
                        key={card.id}
                        id={card.id}
                        text={card.text}
                        containerId={containerId}
                        moveCard={moveCard}
                        className={DPStyles.card}
                    />
                ))}
        </div>
    );
};

const DevelopmentPage = () => {
    const rows = '';
    //const [rows, setRows] = useState('');
    const [product, setProduct] = useState([]);
    const [transcript, setTranscript] = useState('');
    const [idElementQRcode, setIdElementQRcode] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const result = await window.api.getProducts();
            setProduct(result);
        };
        fetchData();
    }, [rows]);

    const [qrCode, setQrCode] = useState([]);
    const [cards, setCards] = useState([
        { id: 1, text: 'Card 1', containerId: 1 },
        { id: 2, text: 'Card 2', containerId: 1 },
        { id: 3, text: 'Card 3', containerId: 2 },
        { id: 4, text: 'Card 4', containerId: 2 },
        { id: 5, text: 'Card 5', containerId: 3 },
        { id: 6, text: 'Card 6', containerId: 3 },
        { id: 7, text: 'Card 7', containerId: 1 },
        { id: 8, text: 'Card 8', containerId: 1 },
        { id: 9, text: 'Card 9', containerId: 2 },
        { id: 10, text: 'Card 10', containerId: 2 },
        { id: 11, text: 'Card 11', containerId: 3 },
        { id: 12, text: 'Card 12', containerId: 3 },
    ]);

    const conteiner = [
        '1 этап:',
        '2 этап:',
        '3 этап:',
        '4 этап:',
        '5 этап:',
        '6 этап:',
    ]

    useEffect(() => {
        const storedCards = JSON.parse(localStorage.getItem('cards'));
        if (storedCards) {
            setCards(storedCards);
        }
    }, []);

    const moveCard = (cardId, sourceContainerId, destContainerId) => {
        setCards((prevCards) => {
            const updatedCards = prevCards.map((card) => {
                if (card.id === cardId) {
                    return { ...card, containerId: destContainerId };
                }
                return card;
            });
            const movedCardIndex = updatedCards.findIndex(card => card.id === cardId);
            const movedCard = updatedCards.splice(movedCardIndex, 1)[0];
            updatedCards.unshift(movedCard);
            localStorage.setItem('cards', JSON.stringify(updatedCards));
            if (destContainerId === 6) {
                product.forEach((item) => {
                    if (movedCard.id === item.id) {
                        setQrCode([item.id + '| ' + item.productName + '| ' + item.includedDetails + '| ' + item.createLimit]);
                    }
                });
                generateQR(); // Обновление QR-кода после перемещения карты в контейнер 6
            }
            return updatedCards;
        });
    };

    const handleTranscriptChange = (e) => {
        const value = e.target.value;
        const firstElement = splitStringAndGetFirstElement(value);
        setTranscript(value);
        setIdElementQRcode(firstElement);
    };

    const splitStringAndGetFirstElement = (str) => {
        const parts = str.split(/[|/]/);
        return parts.shift();
    };

    const generateQR = async () => {
        try {
            const qr = await QRCode.toDataURL(qrCode, { errorCorrectionLevel: 'H' });
            setQrCode(qr); // Assuming you have a state variable to store the generated QR code data URL
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        setTranscript('');
        setIdElementQRcode('');
        generateQR();
    }, [qrCode]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
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
                            window.onload = () => {
                                window.print();
                                setTimeout(() => {
                                    window.close(); // Закрываем окно через 1 секунду после печати
                                }, 1000);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={DPStyles.main_background}>
                <div className={DPStyles.cardText}>
                    <div className={DPStyles.containersContainer}>
                        <div className={DPStyles.l_card}>
                            <div className={DPStyles.upper_section}>
                                <h3>{conteiner[0]} </h3>
                            </div>
                            <div className={DPStyles.lower_section}>
                                <Container containerId={1} moveCard={moveCard} cards={cards} title={conteiner[0]} />
                            </div>
                        </div>
                        <div className={DPStyles.l_card}>
                            <div className={DPStyles.upper_section}>
                                <h3>{conteiner[1]} </h3>
                            </div>
                            <div className={DPStyles.lower_section}>
                                <Container containerId={2} moveCard={moveCard} cards={cards} title={conteiner[1]} />
                            </div>
                        </div>
                        <div className={DPStyles.l_card}>
                            <div className={DPStyles.upper_section}>
                                <h3>{conteiner[2]} </h3>
                            </div>
                            <div className={DPStyles.lower_section}>
                                <Container containerId={3} moveCard={moveCard} cards={cards} title={conteiner[2]} />
                            </div>
                        </div>
                        <div className={DPStyles.l_card}>
                            <div className={DPStyles.upper_section}>
                                <h3>{conteiner[3]} </h3>
                            </div>
                            <div className={DPStyles.lower_section}>
                                <Container containerId={4} moveCard={moveCard} cards={cards} title={conteiner[3]} />
                            </div>
                        </div>
                        <div className={DPStyles.l_card}>
                            <div className={DPStyles.upper_section}>
                                <h3>{conteiner[4]} </h3>
                            </div>
                            <div className={DPStyles.lower_section}>
                                <Container containerId={5} moveCard={moveCard} cards={cards} title={conteiner[4]} />
                            </div>
                        </div>
                        <div className={DPStyles.l_card}>
                            <div className={DPStyles.upper_section}>
                                <h3>{conteiner[5]} </h3>
                            </div>
                            <div className={DPStyles.lower_section}>
                                <Container containerId={6} moveCard={moveCard} cards={cards} title={conteiner[5]} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={DPStyles.containersContainer1}>
                    <div className={DPStyles.l_card1}>
                        <TextField
                            id="standard-basic"
                            type="text"
                            value={qrCode}
                            onChange={(e) => setQrCode(e.target.value)}
                            label="Generate"
                            variant="standard"
                        />
                        <div className={DPStyles.button}>
                            <TextField
                                className={DPStyles.marginTop15}
                                id="standard-basic"
                                type="text"
                                value={transcript}
                                onChange={handleTranscriptChange}
                                label="Расшифровка"
                                variant="standard"
                            />
                        </div>
                        <TextField
                            id="standard-basic"
                            type="text"
                            value={idElementQRcode}
                            label="ID"
                            variant="standard"
                        />
                    </div>
                    <div className={DPStyles.l_card1}>
                        {qrCode !== '' && (
                            <div>
                                <h5 className={DPStyles.textCenter}>Нажми на QRcode, чтобы распечатать!</h5>
                                <img id="qrCodeImage" src={qrCode} alt="QR Code" className={DPStyles.QRCodeImage} onClick={handlePrint} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DndProvider>
    )
}

export default DevelopmentPage;