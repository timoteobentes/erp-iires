import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';

function App() {
  return (
    <BrowserRouter>
      {/* Previsão para Futuros Providers Globais (Arquitetura Limpa) */}
      {/* <ThemeProvider> */}
        {/* <AuthProvider> */}
          
          <AppRoutes />
          
        {/* </AuthProvider> */}
      {/* </ThemeProvider> */}
    </BrowserRouter>
  );
}

export default App;
