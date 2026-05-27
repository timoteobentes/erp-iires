import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { notification } from 'antd';
import { AuthProvider } from './modules/Auth/context/AuthContext';

notification.config({ placement: 'bottomRight', duration: 4 });

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
