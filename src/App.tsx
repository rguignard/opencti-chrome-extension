import React from 'react';
import './App.css';
import TopAppBar from './components/TopAppBar'
import HomeView from "./view/HomeView";
import SettingsView from "./view/SettingsView";
import { Box } from '@mui/material';

export enum View{
    Home,
    Settings
}

function App() {

    const [view, setView] = React.useState<View>(View.Home);

    const renderView = () => {
        switch(view) {
            case View.Home:
                return <HomeView />
            case View.Settings:
                return <SettingsView />
            default:
                return <HomeView/>
        }
    }

    return (
        <div className="app">
            <Box>
                <TopAppBar component="nav" setView={setView}/>
                <Box sx={{ m: 2 }}>
                    {renderView()}
                </Box>
            </Box>
        </div>
    );
}

export default App;
