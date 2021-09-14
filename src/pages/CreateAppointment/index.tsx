import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';

import { format } from 'date-fns';

import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import logoImg from '../../assets/default_avatar.jpg';

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
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
} from './styles';

interface RouteParams {
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

interface DayAvailability {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [providers, setProviders] = useState<Provider[]>([]);
  const { goBack } = useNavigation();
  const route = useRoute();
  const routeParams = route.params as RouteParams;
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(0);
  const [providerSelected, setProviderSelected] = useState<string>(
    routeParams.providerId,
  );

  useEffect(() => {
    async function getProviders() {
      try {
        api.get('/providers').then(response => setProviders(response.data));
      } catch (err) {
        console.log(err);
      }
    }

    getProviders();
  }, []);

  useEffect(() => {
    async function getAvailability() {
      api
        .get(`/providers/${providerSelected}/day-availability`, {
          params: {
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth() + 1,
            day: selectedDate.getDate(),
          },
        })
        .then(response => {
          setAvailability(response.data);
          setSelectedHour(0);
        });
    }

    getAvailability();
  }, [selectedDate, providerSelected]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setProviderSelected(providerId);
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker(state => !state);
  }, []);

  const handleDateChanged = useCallback(
    (event: any, date: Date | undefined) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }

      if (date) {
        setSelectedDate(date);
      }
    },
    [],
  );

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate);

      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('appointments', {
        provider_id: providerSelected,
        date,
      });

      navigation.navigate('AppointmentCreated', { date: date.getTime() });
    } catch (err) {
      Alert.alert(
        'Erro ao criar agendamento',
        'Ocorreu um erro ao tentar criar o agendamento, tente novamente!',
      );
    }
  }, [providerSelected, selectedDate, selectedHour, navigation]);

  const morningAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => ({
        hour,
        hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        available,
      }));
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => ({
        hour,
        hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        available,
      }));
  }, [availability]);

  return (
    <Container>
      <Header>
        <BackButton onPress={() => goBack()}>
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
          keyExtractor={provider => provider.id}
          renderItem={({ item: provider }) => (
            <ProviderContainer
              onPress={() => {
                handleSelectProvider(provider.id);
              }}
              selected={provider.id === providerSelected}
            >
              <ProviderAvatar
                source={
                  provider.avatar_url ? { uri: provider.avatar_url } : logoImg
                }
              />
              <ProviderName selected={provider.id === providerSelected}>
                {provider.name}
              </ProviderName>
            </ProviderContainer>
          )}
        />
      </ProvidersListContainer>

      <Calendar>
        <Title>Escolha a data</Title>

        <OpenDatePickerButton onPress={handleToggleDatePicker}>
          <OpenDatePickerButtonText>
            Selecionar outra data
          </OpenDatePickerButtonText>
        </OpenDatePickerButton>

        {showDatePicker && (
          <DateTimePicker
            {...(Platform.OS === 'ios' && { textColor: '#f4ede8' })}
            mode="date"
            display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
            onChange={handleDateChanged}
            value={selectedDate}
          />
        )}
      </Calendar>

      <Schedule>
        <Title>Escolha o horário</Title>

        <Section>
          <SectionTitle>Manhã</SectionTitle>

          <SectionContent>
            {morningAvailability.map(({ hourFormatted, hour, available }) => (
              <Hour
                available={available}
                selected={hour === selectedHour}
                onPress={() => setSelectedHour(hour)}
                key={hourFormatted}
              >
                <HourText selected={hour === selectedHour}>
                  {hourFormatted}
                </HourText>
              </Hour>
            ))}
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>Tarde</SectionTitle>

          <SectionContent>
            {afternoonAvailability.map(({ hourFormatted, hour, available }) => (
              <Hour
                available={available}
                selected={hour === selectedHour}
                onPress={() => setSelectedHour(hour)}
                key={hourFormatted}
              >
                <HourText selected={hour === selectedHour}>
                  {hourFormatted}
                </HourText>
              </Hour>
            ))}
          </SectionContent>
        </Section>
      </Schedule>

      <CreateAppointmentButton onPress={handleCreateAppointment}>
        <CreateAppointmentButtonText>Agendar</CreateAppointmentButtonText>
      </CreateAppointmentButton>
    </Container>
  );
};

export default CreateAppointment;
