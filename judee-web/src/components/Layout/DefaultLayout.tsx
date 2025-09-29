import React, { useEffect } from 'react';
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container';

import Header from '@components/Header';
import { FooterSmall } from '@components/Footer';


function DefaultLayout({ children, type }: { children: React.ReactNode, type: any }) {

    return (
        <Grid container>
            <Grid size={{ xs: 12 }}>
                <Header />
            </Grid>

            <Grid size={{ xs: 12 }}  >
                <Container maxWidth="xl" style={{ marginTop: '20px' }}>
                    {children}
                </Container>
            </Grid>
            <Grid
                size={{ xs: 12 }}
                sx={{
                    position: 'fixed',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    mt: "auto",
                    backgroundColor: '#fff',
                    color: (theme) => theme.palette?.lightgrey?.main ?? '#888',
                    zIndex: (theme) => theme.zIndex.appBar,
                }}
            >
                <FooterSmall />
            </Grid>
        </Grid>
    )
}

export default DefaultLayout