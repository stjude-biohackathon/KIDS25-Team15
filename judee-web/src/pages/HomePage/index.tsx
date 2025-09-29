import { DefaultLayout } from '@components/Layout';

import React, { useEffect, useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router';

import { API_ENDPOINTS } from '@constants';
import type { HTMLProps } from 'react';
import { PAGES } from '@constants';
import ChatBox from '@components/ChatBox';


export default function HomePage() {

    return (
        <DefaultLayout>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }} style={{ overflowX: 'auto' }}>
                    <h4>Welcome to Judee!</h4>
                    <ChatBox />
                </Grid>
            </Grid>
        </DefaultLayout >
    )
}
