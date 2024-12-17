import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import FileUpload from "./App";


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <div>
        <h1>Добро пожаловать в приложение для загрузки файлов</h1>
        <FileUpload/>
    </div>
);

