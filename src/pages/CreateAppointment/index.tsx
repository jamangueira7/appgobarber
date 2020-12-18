import React, { useCallback, useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { UseAuth } from '../../hooks/auth';

import api from '../../services/api';

import {
    Container,
    Header,
    BackButton,
    HeaderTitle,
    UserAvatar,
    ProvidersListContainer,
    ProvidersList,
    ProviderContainer,
    ProviderAvatar,
    ProviderName,
    Calendar,
    Title,
    OpenDatePickerButton,
    OpenDatePickerButtonText,
} from './styles';

interface RouteParams {
    providerId: string;
}

export interface Provider {
    id: string;
    name: string;
    avatar_url: string;
}

const CreateAppointment: React.FC = () => {
    const { user } = UseAuth();
    const route = useRoute();
    const routeParams = route.params as RouteParams;
    const [providers, setProviders] = useState<Provider[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedProvider, setSelectedProvider] = useState(routeParams.providerId);
    const { goBack } = useNavigation();

    useEffect(() => {
        api.get('providers').then((response) => {
            setProviders(response.data);
        });
    }, []);

    const navigateBack = useCallback(() => {
        goBack();
    }, [goBack]);

    const handleSelectProvider = useCallback((providerId: string) => {
        setSelectedProvider(providerId);

    }, [setSelectedProvider]);

    const handleToggleDatePicker = useCallback(() => {
        setShowDatePicker((state) => !state);

    }, [setShowDatePicker]);

    const handleDatePicker = useCallback((event: any, date: Date | undefined) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if(date) {
            setSelectedDate(date);
        }
    }, [setShowDatePicker]);

    return (
        <Container>
            <Header>
                <BackButton onPress={navigateBack}>
                    <Icon name="chevron-left" size={24} color="#999591" />
                </BackButton>
                <HeaderTitle>Cabeleireiros</HeaderTitle>

                <UserAvatar source={{ uri: user.avatar_url }} />
            </Header>

            <ProvidersListContainer>
                <ProvidersList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={providers}
                    keyExtractor={(provider) => provider.id}
                    renderItem={({ item: provider }) => (
                        <ProviderContainer
                            onPress={() => handleSelectProvider(provider.id)}
                            selected={provider.id === selectedProvider}
                        >
                            <ProviderAvatar source={{ uri: provider.avatar_url }} />
                            <ProviderName
                                selected={provider.id === selectedProvider}
                            >
                                {provider.name}
                            </ProviderName>
                        </ProviderContainer>
                    )}
                />
            </ProvidersListContainer>

            <Calendar>
                <Title>Escolha a data</Title>
                <OpenDatePickerButton onPress={handleToggleDatePicker}>
                    <OpenDatePickerButtonText>Selecionar outra data</OpenDatePickerButtonText>
                </OpenDatePickerButton>
                {showDatePicker && (
                    <DateTimePicker
                        mode="date"
                        display="calendar"
                        onChange={handleDatePicker}
                        textColor="#f4ede8"
                        value={selectedDate} />
                )}
            </Calendar>

        </Container>
    );
};

export default CreateAppointment;
