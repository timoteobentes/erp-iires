import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { App as AntApp, ConfigProvider, notification } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { colors } from '@sigetes/config';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import { AuthProvider } from './modules/Auth/context/AuthContext';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.locale('pt-br');

notification.config({ placement: 'bottomRight', duration: 4 });

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider
        locale={ptBR}
        theme={{
          token: {
            colorPrimary: colors.primary[500],
            colorInfo: colors.secondary[500],
            colorSuccess: colors.success[500],
            colorWarning: colors.warning[500],
            colorError: colors.danger[500],
            colorTextBase: colors.dark[500],
            fontFamily: "Inter, sans-serif",
            borderRadius: 8,
          },
        }}
      >
        <AntApp notification={{ placement: 'bottomRight', duration: 4 }}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </AntApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
