import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { App as AntApp, notification } from 'antd';
import { AuthProvider } from './modules/Auth/context/AuthContext';

notification.config({ placement: 'bottomRight', duration: 4 });

function App() {
  return (
    <BrowserRouter>
      <AntApp notification={{ placement: 'bottomRight', duration: 4 }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AntApp>
    </BrowserRouter>
  );
}

export default App;
