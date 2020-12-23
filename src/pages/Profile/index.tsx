import React, { useCallback, useRef } from 'react';
import {
    View,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Form } from  '@unform/mobile';
import { FormHandles } from  '@unform/core';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';

import { UseAuth } from '../../hooks/auth';
import api from '../../services/api';
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
    old_password: string;
    password: string;
    password_confirmation: string;
}

const Profile: React.FC = () => {
    const formRef = useRef<FormHandles>(null);
    const emailInputRef = useRef<TextInput>(null);
    const oldPasswordInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const passwordConfirmationInputRef = useRef<TextInput>(null);

    const navigation = useNavigation();
    const { user, updateUser } = UseAuth();

    const handleSaveProfile = useCallback(async (data: ProfileFormData) => {

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

            await updateUser(response.data);

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
                'Ocorreu um erro ao atualizar seu perfil, tente novamente.',
            );
        }
    }, [navigation, updateUser]);


    const handleGoBack = useCallback(() => {
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

                        <UserAvatarButton>
                            <UserAvatar source={{ uri: user.avatar_url }} />
                        </UserAvatarButton>

                        <View>
                            <Title>Meu perfil</Title>
                        </View>

                        <Form
                            ref={formRef}
                            initialData={{
                                name: user.name,
                                email: user.email,
                            }}
                            onSubmit={handleSaveProfile}
                        >
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
                                    passwordConfirmationInputRef.current?.submitForm();
                                }}
                            />
                            <Input
                                ref={passwordConfirmationInputRef}
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
                        <Button onPress={() => {
                            formRef.current?.submitForm();
                        }}>
                            Confirmar mudanças
                        </Button>
                    </Container>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
};

export default Profile;
