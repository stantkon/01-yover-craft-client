import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [currentFolder, setCurrentFolder] = useState('');


    //Восстановление состояния из localStorage браузера при загрузке приложения
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (storedUsername && storedIsLoggedIn) {
            setUsername(storedUsername);
            setIsLoggedIn(true);
        }
    }, []);

    // Регистрация нового пользователя
    const handleRegister = async () => {
        try {
            const response = await axios.post('http://26.105.9.189:5000/register', { username, password });
            setMessage(response?.data?.message || 'Успех');
            setIsRegistering(false);
        } catch (error) {
            console.error(error);
            setMessage(error?.response?.data?.message || 'Ошибка при регистрации');
        }
    };

    // Вход пользователя
    const handleLogin = async () => {
        try {
            const response = await axios.post('http://26.105.9.189:5000/login', { username, password });
            setMessage(response?.data?.message || 'Успех');
            setIsLoggedIn(true);

            // Сохраняем данные авторизации в localStorage
            localStorage.setItem('username', username);
            localStorage.setItem('isLoggedIn', 'true');

            loadFoldersAndFiles();  // Загрузка файлов и папок
        } catch (error) {
            console.error(error);
            setMessage(error?.response?.data?.message || 'Ошибка при входе');
        }
    };

    // Выход пользователя
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');

        // Удаление данных из localStorage
        localStorage.removeItem('username');
        localStorage.removeItem('isLoggedIn');
    };

    // Загрузка папок и файлов
    const loadFoldersAndFiles = async () => {
        try {
            const response = await axios.get('http://26.105.9.189:5000/files', {
                params: { username, currentFolder }
            });
            setFolders(response?.data?.folders || []);
            setFiles(response?.data?.files || []);
        } catch (error) {
            console.error(error);
            setMessage('Ошибка при загрузке папок и файлов');
        }
    };

    // Создание папки
    const handleCreateFolder = async () => {
        const folderName = prompt('Введите имя новой папки');
        if (!folderName) {
            return;
        }
        try {
            const response = await axios.post('http://26.105.9.189:5000/createFolder', {
                username,
                folderName,
                parentFolder: currentFolder
            });
            setMessage(response?.data?.message || 'Папка успешно создана');
            loadFoldersAndFiles(); // Обновление списка
        } catch (error) {
            console.error(error);
            setMessage(error?.response?.data?.message || 'Ошибка при создании папки');
        }
    };

    // Загрузка файлов
    const handleFileUpload = async (event) => {
        const formData = new FormData();
        for (let i = 0; i < event.target.files.length; i++) {
            formData.append('files', event.target.files[i]);
        }
        try {
            const response = await axios.post('http://26.105.9.189:5000/upload', formData, {
                params: { username, currentFolder }
            });
            setMessage(response?.data?.message || 'Файлы успешно загружены');
            loadFoldersAndFiles(); // Обновление списка
        } catch (error) {
            console.error(error);
            setMessage('Ошибка при загрузке файлов');
        }
    };

    // Переход в папку
    const handleEnterFolder = (folderName) => {
        setCurrentFolder(folderName); // Устанавливаем новое значение папки
    };

// Переход назад
    const handleBack = () => {
        setCurrentFolder(''); // Сбрасываем текущую папку на главный уровень
    };

    // Автоматическая загрузка файлов и папок при изменении currentFolder
    useEffect(() => {
        if (isLoggedIn) {
            loadFoldersAndFiles();
        }
    }, [currentFolder, isLoggedIn]); // Зависимости: currentFolder и isLoggedIn

    // Обновление списка файлов и папок
    const handleRefresh = () => {
        loadFoldersAndFiles(); // Повторная загрузка
    };

    // Функция удаления
    const handleDelete = async (item, type) => {
        try {
            const endpoint = type === 'folder' ? 'folder' : 'file';
            const response = await axios.delete(`http://26.105.9.189:5000/${endpoint}`, {
                data: { username, name: item, parentFolder: currentFolder }
            });
            setMessage(response?.data?.message || `${type === 'folder' ? 'Папка' : 'Файл'} успешно удален`);
            loadFoldersAndFiles();
        } catch (error) {
            console.error(error);
            setMessage(error?.response?.data?.message || `Ошибка при удалении ${type === 'folder' ? 'папки' : 'файла'}`);
        }
    };

    //Функция скачивания
    const handleDownloadFile = async (fileName) => {
        try {
            const response = await axios.get('http://26.105.9.189:5000/download', {
                params: {
                    username,
                    fileName,
                    currentFolder
                },
                responseType: 'blob', // Это необходимо для правильной обработки файла
            });

            // Создаем ссылку для скачивания
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); // Указываем имя файла
            document.body.appendChild(link);
            link.click();

            // Удаляем ссылку после скачивания
            link.parentNode.removeChild(link);

            setMessage('Файл успешно скачан');
        } catch (error) {
            console.error(error);
            setMessage('Ошибка при скачивании файла');
        }
    };

    return (
        <div className="container">
            <h1>Файловая система</h1>

            {/* Регистрация / Вход */}
            {!isLoggedIn && !isRegistering && (
                <div>
                    <h2>Вход</h2>
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin} className="login-button">Войти</button>
                    <button onClick={() => setIsRegistering(true)}>Зарегистрироваться</button>
                </div>
            )}

            {/* Регистрация */}
            {isRegistering && (
                <div>
                    <h2>Регистрация</h2>
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleRegister}>Зарегистрироваться</button>
                    <button onClick={() => setIsRegistering(false)} className="back-button">Назад</button> {/* Кнопка "Назад" */}
                </div>
            )}

            {/* Главная страница после входа */}
            {isLoggedIn && (
                <div>
                    <button className="logout-button" onClick={handleLogout}>Выйти</button>
                    <h2>Добро пожаловать, {username}</h2>

                    {/* Путь */}
                    <div className="folder-back-button">
                        <span>{currentFolder ? `Текущая папка: ${currentFolder}` : 'Главная папка'}</span>

                        {currentFolder && (
                            <button onClick={handleBack}>Перейти назад</button>
                        )}
                    </div>

                    {/* Список папок и файлов */}
                    <div className="files-container">
                        {[
                            ...folders.map((folder) => (
                                <div className="file-item" key={folder}>
                                    <span>{folder}</span>
                                    <div>
                                        <button onClick={() => handleEnterFolder(folder)}>Перейти в папку</button>
                                        <button onClick={() => handleDelete(folder, 'folder')} id="delete-button">Удалить</button>
                                    </div>
                                </div>
                            )),
                            ...files.map((file) => (
                                <div className="file-item" key={file}>
                                    <span>{file}</span>
                                    <div>
                                        <button onClick={() => handleDownloadFile(file)} >Скачать файл</button>
                                        <button onClick={() => handleDelete(file, 'file')} id="delete-button">Удалить</button>
                                    </div>
                                </div>
                            ))
                        ]}
                    </div>


                    {/* Загрузка файлов */}
                    <div className="upload-container">
                        <input type="file" multiple onChange={handleFileUpload} />
                    </div>
                    {/* Кнопка обновить список */}
                    <button className="refresh-button" onClick={handleRefresh}>Обновить список</button>

                    {/* Создание новой папки */}
                    <button onClick={handleCreateFolder}>Создать новую папку</button>
                </div>
            )}

            <p>{message}</p>
        </div>
    );
};

export default App;
