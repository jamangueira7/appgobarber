import React from 'react';
import { View, ActivityIndicator } from 'react-native';

import AuthRotes from './auth.routes';
import AppRotes from './app.routes';

import { UseAuth } from '../hooks/auth';

const Routes: React.FC = () => {
    const { user, loading } = UseAuth();

    if(loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#999" />
            </View>
        );
    }

    return user ? <AppRotes /> : <AuthRotes />;
};

export default Routes;
