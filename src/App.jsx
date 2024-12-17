import React, { useState } from 'react';

function FileUpload() {
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [responseMessage, setResponseMessage] = useState('');

    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleFolderChange = (event) => {
        setFolderName(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedFiles) {
            setResponseMessage('Пожалуйста, выберите файлы для загрузки.');
            return;
        }

        const formData = new FormData();
        formData.append('folderName', folderName);

        // Добавляем файлы в форму
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
        }

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setResponseMessage(data.message);
            } else {
                setResponseMessage('Ошибка при загрузке файлов.');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setResponseMessage('Ошибка при соединении с сервером.');
        }
    };

    return (
        <div>
            <h1>Загрузка файлов</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="folderName">Имя папки:</label>
                    <input
                        type="text"
                        id="folderName"
                        value={folderName}
                        onChange={handleFolderChange}
                        placeholder="Введите имя папки"
                    />
                </div>

                <div>
                    <input type="file" multiple onChange={handleFileChange} />
                </div>

                <div>
                    <button type="submit">Загрузить файлы</button>
                </div>
            </form>

            {responseMessage && <p>{responseMessage}</p>}
        </div>
    );
}

export default FileUpload;