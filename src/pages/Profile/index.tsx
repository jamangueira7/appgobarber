import React, { useCallback, useRef } from 'react';
import {
    Image,
    View,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { Form } from  '@unform/mobile';
import { FormHandles } from  '@unform/core';
import * as Yup from 'yup';
import api from '../../services/api';

import { UseAuth } from '../../hooks/auth';
import getValidationErrors from '../../utils/getValidationErrors';
import Input from '../../components/Input';

import Button from '../../components/Button';

import {
    Container,
    Title,
    UserAvatarButton,
    UserAvatar,
    BackButton,
} from './styles';

interface ProfileFormData {
    name: string;
    email: string;
    password: string;
    old_password: string;
    password_confirmation: string;
}

const Profile: React.FC = () => {
    const { user } = UseAuth();
    const formRef = useRef<FormHandles>(null);
    const navigation = useNavigation();

    const emailInputRef = useRef<TextInput>(null);
    const oldPasswordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const handleSignUp = useCallback(async (data: ProfileFormData) => {

        try {
            formRef.current?.setErrors({});
            const schema = Yup.object().shape({

                name: Yup.string()
                    .required('Nome obrigatório.'),
                email: Yup.string()
                    .required('E-mail obrigatório.')
                    .email('Digite um e-mail válido.'),
                old_password: Yup.string(),
                password: Yup.string().when('old_password', {
                    is: (val) => !!val.length,
                    then: Yup.string().required('Campo obrigatório.'),
                    otherwise: Yup.string(),
                }),
                password_confirmation: Yup.string().when('old_password', {
                    is: (val) => !!val.length,
                    then: Yup.string().required('Campo obrigatório.'),
                    otherwise: Yup.string(),
                }).oneOf(
                    [Yup.ref('password')],
                    'Confirmação incorreta',
                ),

            });

            await schema.validate(data, {
                abortEarly: false,
            });

            const formData = {
                name: data.name,
                email: data.email,
                ...(data.old_password
                    ? {
                        old_password: data.old_password,
                        password: data.password,
                        password_confirmation: data.password_confirmation,
                    }
                    : {}),
            };

            const response = await api.put('/profile', formData);

            Alert.alert('Perfil atualizado com sucesso!');

            navigation.goBack();

        } catch (err) {

            if (err instanceof Yup.ValidationError) {
                const errors = getValidationErrors(err);
                formRef.current?.setErrors(errors);
                return;
            }

            console.log(err)
            Alert.alert(
                'Erro na atualização do perfil',
                'Ocorreu um erro ao fazer cadastro, tente novamente.',
            );
        }
    }, [navigation]);

    const handleGoBack = useCallback(async () => {
        navigation.goBack();
    }, [navigation]);

    return(
        <>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                enabled
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flex: 1 }}
                >
                    <Container>
                        <BackButton onPress={handleGoBack}>
                            <Icon name="chevron-left" size={24} color="#999591" />
                        </BackButton>

                        <UserAvatarButton onPress={() => {}}>
                            <UserAvatar source={{ uri: user.avatar_url }} />
                        </UserAvatarButton>
                        <View>
                            <Title>Meu perfil</Title>
                        </View>
                        <Form ref={formRef} onSubmit={handleSignUp}>
                            <Input
                                autoCapitalize="words"
                                name="name"
                                icon="user"
                                placeholder="Nome"
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    emailInputRef.current?.focus();
                                }}
                            />
                            <Input
                                ref={emailInputRef}
                                autoCorrect={false}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                name="email"
                                icon="mail"
                                placeholder="E-mail"
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    oldPasswordInputRef.current?.focus();
                                }}
                            />
                            <Input
                                ref={oldPasswordInputRef}
                                name="old_password"
                                icon="lock"
                                placeholder="Senha atual"
                                secureTextEntry
                                textContentType="newPassword"
                                containerStyle={{ marginTop: 16 }}
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    passwordInputRef.current?.submitForm();
                                }}
                            />
                            <Input
                                ref={passwordInputRef}
                                name="password"
                                icon="lock"
                                placeholder="Senha"
                                secureTextEntry
                                textContentType="newPassword"
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    confirmPasswordInputRef.current?.submitForm();
                                }}
                            />
                            <Input
                                ref={confirmPasswordInputRef}
                                name="password_confirmation"
                                icon="lock"
                                placeholder="Confirmar senha"
                                secureTextEntry
                                textContentType="newPassword"
                                returnKeyType="send"
                                onSubmitEditing={() => {
                                    formRef.current?.submitForm();
                                }}
                            />
                        </Form>
                        <Button
                            onPress={() => {
                                formRef.current?.submitForm();
                            }}
                        >
                            Confirmar mudanças
                        </Button>
                    </Container>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
};

export default Profile;
