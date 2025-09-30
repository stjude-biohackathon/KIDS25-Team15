import { DefaultLayout } from '@components/Layout';

import React, { useEffect, useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router';

import { API_ENDPOINTS } from '@constants';
import type { HTMLProps } from 'react';
import { PAGES } from '@constants';
import ChatBox from '@components/ChatBox';
import { Welcome } from '@components/Welcome';
import { UserBtns } from '@components/Welcome/UserBtns';


export default function HomePage() {
    const [showUserBtn, setShowUserBtn] = useState(false);
    const [showChat, setShowChat] = useState(false);

    return (
        <DefaultLayout>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }} style={{ overflowX: 'auto' }}>
                    {showChat ? <ChatBox /> : showUserBtn ? (
                        <UserBtns onNext={() => setShowChat(true)} />
                    ) : (
                        <Welcome onNext={() => setShowUserBtn(true)} />
                    )}
                </Grid>
            </Grid>
        </DefaultLayout >
    )
}
