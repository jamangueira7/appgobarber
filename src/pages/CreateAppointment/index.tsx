import React,
{
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { UseAuth } from '../../hooks/auth';

import api from '../../services/api';

import {
    Container,
    Header,
    BackButton,
    HeaderTitle,
    UserAvatar,
    Content,
    ProvidersListContainer,
    ProvidersList,
    ProviderContainer,
    ProviderAvatar,
    ProviderName,
    Calendar,
    Title,
    OpenDatePickerButton,
    OpenDatePickerButtonText,
    Schedule,
    SectionTitle,
    Section,
    SectionContent,
    Hour,
    HourText,
} from './styles';

interface RouteParams {
    providerId: string;
}

export interface Provider {
    id: string;
    name: string;
    avatar_url: string;
}

export interface AvailabilityItem {
    hour: number;
    available: boolean;
}

const CreateAppointment: React.FC = () => {
    const { user } = UseAuth();
    const route = useRoute();
    const routeParams = route.params as RouteParams;
    const [providers, setProviders] = useState<Provider[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedHour, setSelectedHour] = useState(0);
    const [selectedProvider, setSelectedProvider] = useState(routeParams.providerId);
    const { goBack } = useNavigation();

    useEffect(() => {
        api.get('providers').then((response) => {
            setProviders(response.data);
        });
    }, []);

    useEffect(() => {
        api.get(`providers/${selectedProvider}/day-availability`, {
            params: {
                year: selectedDate.getFullYear(),
                month: selectedDate.getMonth() + 1,
                day: selectedDate.getDate(),
            }
        }).then((response) => {
            setAvailability(response.data);
        });
    }, [selectedDate, selectedProvider]);

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

    const morningAvailability = useMemo(() => {
        return availability
            .filter(({ hour }) =>  hour < 12 )
            .map(({ hour, available }) => {
                return {
                    hour,
                    hourFormatted: format(new Date().setHours(hour), 'HH:00'),
                    available,
                };
            }) ;
    }, [availability]);

    const afternoonAvailability = useMemo(() => {
        return availability
            .filter(({ hour }) =>  hour >= 12 )
            .map(({ hour, available }) => {
                return {
                    hour,
                    hourFormatted: format(new Date().setHours(hour), 'HH:00'),
                    available,
                };
            }) ;
    }, [availability]);


    const handleSelectHour = useCallback((hour: number) => {
        setSelectedHour(hour);
    }, []);

    return (
        <Container>
            <Header>
                <BackButton onPress={navigateBack}>
                    <Icon name="chevron-left" size={24} color="#999591" />
                </BackButton>
                <HeaderTitle>Cabeleireiros</HeaderTitle>

                <UserAvatar source={{ uri: user.avatar_url }} />
            </Header>

            <Content>
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

                <Schedule>
                    <Title>Escolha o horário</Title>
                    <Section>
                        <SectionTitle>Manha</SectionTitle>
                        <SectionContent>
                            {morningAvailability.map(({ hourFormatted, hour, available}) => (
                                <Hour
                                    enabled={available}
                                    selected={selectedHour === hour}
                                    available={available}
                                    key={hourFormatted}
                                    onPress={() => handleSelectHour(hour)}
                                >
                                    <HourText selected={selectedHour === hour}>{hourFormatted}</HourText>
                                </Hour>
                            ))}
                        </SectionContent>
                    </Section>
                    <Section>
                        <SectionTitle>Tarde</SectionTitle>
                        <SectionContent>
                            {afternoonAvailability.map(({ hourFormatted, hour, available}) => (
                                <Hour
                                    enabled={available}
                                    selected={selectedHour === hour}
                                    available={available}
                                    key={hourFormatted}
                                    onPress={() => handleSelectHour(hour)}
                                >
                                    <HourText selected={selectedHour === hour}>{hourFormatted}</HourText>
                                </Hour>
                            ))}
                        </SectionContent>
                    </Section>
                </Schedule>
            </Content>
        </Container>
    );
};

export default CreateAppointment;
