import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import CreateAppointment from '../pages/CreateAppointment';
import AppointmentsCreated from '../pages/AppointmentCreated';

const App = createStackNavigator();

const AppRotes: React.FC = () => (
    <App.Navigator
        screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#312e38' },
        }}
    >

        <App.Screen name="Dashboard" component={Dashboard} />
        <App.Screen name="CreateAppointment" component={CreateAppointment} />
        <App.Screen name="AppointmentsCreated" component={AppointmentsCreated} />

        <App.Screen name="Profile" component={Profile} />

    </App.Navigator>
);

export default AppRotes;
