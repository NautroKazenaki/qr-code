import React from 'react';
import { OutlinedInput, Tooltip, } from '@mui/material';
import ArchivePS from '../../Pages/ArchivePage/ArchivePage.module.css';
import axios from 'axios';
import { sendDataToHistory } from '../../utils/addHistory';

/**
 * Компонент ImageUploader для загрузки и обработки изображений.
 * @param {function} setSearchID - функция установки id поиска после обработки изображения
 * @param {number} userLevel - уровень пользователя
 */
function ImageUploader({ setSearchID, userLevel}) {

    /**
     * Управляет загрузкой и обработкой изображений.
     * @param {Object} event - объект события
     */
    const handleImageUpload = async (event) => {
        //Получить загруженный файл
        const file = event.target.files[0];
        if (!file) return;

        // Создайте объект FileReader для чтения файла.
        const reader = new FileReader();

        // Определите обработчик события загрузки
        reader.onload = async () => {
            // Получите данные изображения из объекта FileReader.
            const imageData = reader.result;

            // Отправьте POST-запрос на сервер с данными изображения.
            const response = await axios.post('http://192.168.0.123:3001/archieve/image', { image: imageData});

            // Добавить данные поиска в историю
            await sendDataToHistory(`Произвел поиск по фотографии`);

            // Получить результат из данных ответа
            const result = response.data.result;

            // Установите id поиска с результатом
            setSearchID(result);
        };

        // Прочитайте файл как URL-адрес данных.
        reader.readAsDataURL(file);
    };

    // Вернуть компонент ImageUploader
    return (
        <Tooltip title="Загрузите фотографию с QR-кодом для поиска">
            <div className={ArchivePS.inputContainer}>
                <OutlinedInput 
                    // Отключить ввод, если уровень пользователя больше 1
                    disabled={userLevel > 1} 
                    type="file" 
                    accept="image/*" 
                    // Вызовите функцию handleImageUpload при изменении входных данных.
                    onChange={handleImageUpload} 
                    className={ArchivePS.inputContainer}
                />
            </div>
        </Tooltip>
    );
}

export default ImageUploader;