import React from 'react';
import './App.css';
import TopAppBar from './components/TopAppBar'
import HomeView from "./view/HomeView";
import SettingsView from "./view/SettingsView";
import { Box } from '@mui/material';
import WorkbenchPublishView from "./view/WorkbenchPublishView";

export enum View {
    Home,
    Settings,
    WorkbenchPublish = 2
}

function App() {

    const [view, setView] = React.useState<View>(View.Home);
    const [observables, setObservables] = React.useState<any[]>([]);
    const [content, setContent] = React.useState<any>();

    const renderView = () => {
        switch(view) {
            case View.Home:
                return <HomeView setView={setView} setContent={setContent} setObservables={setObservables}/>
            case View.Settings:
                return <SettingsView setView={setView}/>
            case View.WorkbenchPublish:
                return <WorkbenchPublishView setView={setView} content={content} observables={observables}/>
            default:
                return <HomeView setView={setView}/>
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
