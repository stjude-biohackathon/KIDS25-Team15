import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import logo from '@assets/wall-e.svg';
import { userRoles } from '@assets/userRoles';
import { useAppState } from '@components/AppStateProvider/AppStateProvider';


const AppBar = styled(MuiAppBar)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
}));

function Header() {
    const [appName,] = React.useState('Jude-E');
    const { appState, setKey } = useAppState();

    return (
        <AppBar position="static" sx={{ backgroundColor: '#fff' }}>
            <Container maxWidth="xl">
                <Toolbar>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, width: 64, height: 64 }}>
                        <img src={logo} alt="St. Jude Children's Research Hospital" 
                        style={{ width: '100%', height: '100%' }} 
                        onClick={() => {
                            setKey("screen", "welcome")
                            setKey("userRole", null)
                        }} />
                    </Box>
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            mx: 1,
                            height: '64px',
                        }}
                    >
                        <Box
                            sx={{
                                width: '1px',
                                height: '64%',
                                backgroundColor: '#878A8F',
                            }}
                        />
                    </Box>
                    <Typography
                        noWrap
                        variant='h5'
                        component="span"
                        sx={{
                            mx: 1,
                            display: { xs: 'none', md: 'flex' },
                            fontWeight: '800',
                            color: '#878A8F',
                            textDecoration: 'none',
                        }}
                    >
                        {appName}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    {appState.userRole && (<>{getUserImg(appState.userRole)}</>)}
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Header;

function getUserImg(userRole: string) {
    const user = userRoles[userRole];
    if (!user) return null;

    const imgHeight = 40;
    return (
        <img src={user.img} alt={user.label} style={{
            width: `${imgHeight * user.percentWthIncr}px`,
            height: `${imgHeight}px`
        }} />
    )
}
