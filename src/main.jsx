import React from 'react';
import ReactDOM from 'react-dom/client';
import MIDECSApp from './MIDECSApp';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MIDECSApp />
  </React.StrictMode>
);

setTimeout(() => {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('hide');
    setTimeout(() => splash.remove(), 500);
  }
}, 600);
