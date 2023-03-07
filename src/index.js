import React, {Suspense}  from 'react';
import ReactDOM from 'react-dom/client';
import '../src/index.css'

import App from './Pages/App';
import { FireProvider } from './firebase/fireContext';

//

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<FireProvider>
    <React.StrictMode>
      <Suspense fallback={<p>Cargando...</p>}>
        <App />
      </Suspense>
    </React.StrictMode>
  </FireProvider>
);