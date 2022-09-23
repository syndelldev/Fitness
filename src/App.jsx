import React, { useState, useEffect } from 'react';
import { Route, Switch, useHistory, Redirect } from "react-router-dom";
import Preloader from "./components/Preloader";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import * as All from './pages'
import "../src/assets/css/custom.css"
import { ToastContainer } from 'react-toastify';
import { useSelector } from "react-redux";
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from './supabaseClient';



export default function App() {
    let { isLogged } = useSelector(state => state);
    const history = useHistory()
    const RouteWithLoader = ({ component: Component, ...rest }) => {
        const [loaded, setLoaded] = useState(false);

        useEffect(() => {
            const timer = setTimeout(() => setLoaded(true), 1000);
            return () => clearTimeout(timer);
        }, []);

        return (
            <Route {...rest} render={props => (<> <Preloader show={loaded ? false : true} /> <Component {...props} /> </>)} />
        );
    };

    const RouteWithSidebar = ({ component: Component, ...rest }) => {
        const [loaded, setLoaded] = useState(false);

        useEffect(() => {
            const timer = setTimeout(() => setLoaded(true), 1000);
            return () => clearTimeout(timer);
        }, []);

        const localStorageIsSettingsVisible = () => {
            return localStorage.getItem('settingsVisible') === 'false' ? false : true
        }

        const [showSettings, setShowSettings] = useState(localStorageIsSettingsVisible);

        const toggleSettings = () => {
            setShowSettings(!showSettings);
            localStorage.setItem('settingsVisible', !showSettings);
        }

        return (<>


            <Route {...rest} render={props => (
                <>
                    <Preloader show={loaded ? false : true} />
                    <Sidebar />
                    <main className="content">
                        <ToastContainer />
                        <Navbar />
                        <Component {...props} />
                        <Footer toggleSettings={toggleSettings} showSettings={showSettings} />
                    </main>
                </>
            )}
            />
        </>);
    };

    const authRoutes = () => {
        return (<>
            <RouteWithLoader exact strict path={'/'} component={All.Login} />
            {/* <Redirect to={'/'} /> */}
        </>)
    }
    const allRoutes = () => {
       return (<>
       <RouteWithSidebar exact strict path={'/'} component={All.Dashboard} />
       <RouteWithSidebar exact strict path={'/userlist'} component={All.UserList} />
       <RouteWithSidebar exact strict path={'/edit-user/:id'} component={All.EditUser} />
       <RouteWithSidebar exact strict path={'/add-user'} component={All.AddUser} />
       <RouteWithSidebar exact strict path={'/view-user/:id'} component={All.ViewUser} />
       <RouteWithSidebar exact strict path={'/trainerlist'} component={All.TrainerList} />
       <RouteWithSidebar exact strict path={'/edit-trainer/:id'} component={All.EditTrainer} />
       <RouteWithSidebar exact strict path={'/add-trainer'} component={All.AddTrainer} />
       <RouteWithSidebar exact strict path={'/disciplinelist'} component={All.DisciplineList} />
       <RouteWithSidebar exact strict path={'/edit-discipline/:id'} component={All.EditDiscipline} />
       <RouteWithSidebar exact strict path={'/add-discipline'} component={All.AddDiscipline} />
       <RouteWithSidebar exact strict path={'/add-discipline-level'} component={All.AddDisciplineLevel} />
       <RouteWithSidebar exact strict path={'/edit-discipline/:id/:level_id'} component={All.EditDisciplineLevel} />
       <RouteWithSidebar exact strict path={'/rolelist'} component={All.RoleList} />
       <RouteWithSidebar exact strict path={'/edit-role/:id'} component={All.EditRole} />
       <RouteWithSidebar exact strict path={'/add-role'} component={All.AddRole} />
       <RouteWithSidebar exact strict path={'/access-rights'} component={All.AccessRights} />
       <RouteWithSidebar exact strict path={'/userlogs'} component={All.UserLogs} />
       <RouteWithSidebar exact strict path={'/add-event'} component={All.AddEvent} />
       <RouteWithSidebar exact strict path={'/edit-event/:id'} component={All.EditEvent} />
       <RouteWithSidebar exact strict path={'/events'} component={All.EventList} />
       
       
       {/* <Redirect to={'/'} /> */}
       </>)
    }
    return (
        <Switch>
            {/* {!isLogged ? authRoutes() : allRoutes()} */}
            {!supabase.auth.session() ? authRoutes() : allRoutes()}
        </Switch>
    )
}
