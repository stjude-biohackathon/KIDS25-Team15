import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import logo from '@assets/wall-e.svg';
import { useNavigate } from 'react-router';

import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
// import { useDrawerContext } from '@context/Drawer/index.tsx';

const pages: string[] = [];
const settings = ['Logout'];
const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  boxShadow: '0px 1px 1px rgba(135, 138, 143, 0.25)',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: drawerWidth,
      },
    },
  ],
}));

function Header() {

  const navigate = useNavigate();

  const [appName,] = React.useState('Jude-E');

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuClick = () => {
    // Handle menu item click
    navigate('/')
  }

  // const { drawerData, dispatch } = useDrawerContext()

  // const handleDrawerOpen = () => {
  //   console.log(drawerData)
  //   dispatch({ id: 1, type: 'DRAWER.OPEN' });
  // };

  // const handleDrawerClose = () => {
  //   dispatch({ id: 1, type: 'DRAWER.CLOSE' });
  // };

  return (
      <AppBar position="static" sx={{backgroundColor: '#fff'}}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, width: 64, height: 64 }}>
              <img src={logo} alt="St. Jude Children's Research Hospital" style={{ width: '100%', height: '100%' }} />
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
            {/* <div onClick={handleDrawerOpen} >drawer</div> */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                // onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={handleCloseNavMenu}>
                    <Typography sx={{ textAlign: 'center' }}>{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <SvgIcon>
              <img src={logo} alt="St. Jude Children's Research Hospital" style={{ width: 24, height: 24 }} />
            </SvgIcon>
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 800,
                color: 'inherit',
                textDecoration: 'none',
                fontSize: '24px',
              }}
            >
              {appName}
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
  );
}
export default Header;
