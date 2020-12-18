import React, { useCallback } from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import {
    Container,
    Title,
    Description,
    OkButton,
    OkButtonText,
} from './styles';

const AppointmentCreated: React.FC = () => {
    const { reset } = useNavigation();
    const handleSelectHour = useCallback((hour: number) => {
        reset({
            routes: [
                { name: 'Dashboard'}
            ],
            index: 0,
        });
    }, [reset]);

    return (
      <Container>
          <Icon name="check" size={80} color="#04d361" />
          <Title>Agendamento concluído</Title>
          <Description>fadfadfdsf</Description>
          <OkButton onPress={handleSelectHour}>
              <OkButtonText>Ok</OkButtonText>
          </OkButton>
      </Container>
    );
};

export default AppointmentCreated;
