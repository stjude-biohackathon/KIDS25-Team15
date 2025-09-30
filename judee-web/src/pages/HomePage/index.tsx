import { DefaultLayout } from '@components/Layout';
import { Grid } from '@mui/material';
// import { useNavigate } from 'react-router';

// import { API_ENDPOINTS } from '@constants';
// import type { HTMLProps } from 'react';
// import { PAGES } from '@constants';
import ChatBox from '@components/ChatBox';
import { Welcome } from '@components/Welcome';
import { UserBtns } from '@components/Welcome/UserBtns';
import { AppStateProvider, useAppState } from '@components/AppStateProvider/AppStateProvider';


export default function HomePage() {
    return (
        <AppStateProvider>
            <DefaultLayout>
                <Grid container spacing={2}>
                    <Screen />
                </Grid>
            </DefaultLayout>
        </AppStateProvider>
    )
}

const Screen = () => {
    const { appState, setKey } = useAppState();

  return (
    <Grid size={{ xs: 12 }} style={{ overflowX: 'auto' }}>
      {(!appState.screen || appState.screen === "welcome") && (
        <Welcome onNext={() => setKey("screen", "userBtns")} />
      )}
      {appState.screen === "userBtns" && <UserBtns/> }
      {appState.screen === "chat" && <ChatBox />}
    </Grid>
  )
}
