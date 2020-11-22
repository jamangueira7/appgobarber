import React from 'react';
import { View, Button } from 'react-native';

import { UseAuth } from "../../hooks/auth";

const Dashboard: React.FC = () => {
    const { signOut } = UseAuth();

    return (
        <View style={{ flex: 1, justifyContent: 'center'}}>
            <Button title="Sair" onPress={signOut} />
        </View>
    );
};

export default Dashboard;
