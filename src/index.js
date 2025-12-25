import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import App from './App';
import { messages } from './translations';

const AppWithIntl = () => {
  const [locale, setLocale] = useState('ru');

  return (
    <IntlProvider locale={locale} messages={messages[locale]} defaultLocale="ru">
      <App setLocale={setLocale} />
    </IntlProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWithIntl />
  </React.StrictMode>
);