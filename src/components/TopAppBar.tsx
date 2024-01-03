import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Logo from '../assets/logo-text.png';
import {Button, IconButton} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {View} from "../App";

function TopAppBar(props: any) {

    const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
        props.setView(View.Settings);
    };
    const handleHomeClick = (event: React.MouseEvent<HTMLElement>) => {
        props.setView(View.Home);
    };

    return (
        <Box>
            <AppBar position="static" sx={{bgcolor: "#000e1c"}}>
                <Toolbar>
                    <Box
                        component="img"
                        sx={{
                            height: 40,
                        }}
                        alt="OpenCTI"
                        src={Logo}
                    />
                    <Button
                        color="inherit"
                        onClick={handleHomeClick}
                    >
                        Threat Crawler
                    </Button>
                    <Box sx={{flexGrow: 1}}/>
                    <Box sx={{display: 'flex'}}>
                        <IconButton
                            size="large"
                            color="inherit"
                            aria-label="settings"
                            onClick={handleSettingsClick}
                        >
                            <SettingsOutlinedIcon/>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default TopAppBar;
