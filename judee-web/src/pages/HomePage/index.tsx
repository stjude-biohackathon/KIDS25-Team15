import { DefaultLayout } from '@components/Layout';
import { useState } from 'react';
import { Grid } from '@mui/material';
// import { useNavigate } from 'react-router';

// import { API_ENDPOINTS } from '@constants';
// import type { HTMLProps } from 'react';
// import { PAGES } from '@constants';
import ChatBox from '@components/ChatBox';
import { Welcome } from '@components/Welcome';
import { UserBtns } from '@components/Welcome/UserBtns';
import { AppStateProvider } from '@components/AppStateProvider/AppStateProvider';

export function HomePage() {
    const [showComp, setShowComp] = useState<"userBtns" | "chat" | 'welcome'>('welcome')

    return (
        <AppStateProvider>
            <DefaultLayout>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }} style={{ overflowX: 'auto' }}>
                        {showComp == "welcome" && <Welcome onNext={() => setShowComp("userBtns")} />}
                        {showComp === "userBtns" && <UserBtns onNext={() => setShowComp("chat")} />}
                        {showComp === "chat" && <ChatBox />}
                    </Grid>
                </Grid>
            </DefaultLayout>
        </AppStateProvider>
    )
}
