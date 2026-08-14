import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../components/Text';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { categoryApi, serviceApi, appointmentApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useUi } from '../../context/UiContext';
import { getCurrentLocation, requestLocationPermission } from '../../utils/location';
import { colors } from '../../theme/colors';
import { GOOGLE_MAPS_API_KEY } from '../../config/maps';
import type { Category, ServiceListing } from '../../types/models';
import type { RootStackParamList } from '../../navigation/types';

const DATE_LIST = Array.from({ length: 4 }, (_, i) => moment().add(i, 'days').format('DD/MM/YYYY'));

interface PlacePrediction {
  place_id: string;
  description: string;
}

export default function Home() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showLoading, hideLoading, showToast } = useUi();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceListing[]>([]);

  const [address, setAddress] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const predictionsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [selectedDate, setSelectedDate] = useState(DATE_LIST[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [payName, setPayName] = useState('');
  const [payEmail, setPayEmail] = useState('');
  const [payPhone, setPayPhone] = useState('');
  const [payGender, setPayGender] = useState('');
  const [payPurpose, setPayPurpose] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const granted = await requestLocationPermission();
        if (!granted) {
          setLocationError('Location permission denied');
          return;
        }
        const loc = await getCurrentLocation();
        setRegion({ latitude: loc.latitude, longitude: loc.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        loadCategories();
      } catch {
        setLocationError('Unable to fetch your location');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCategories() {
    try {
      const res: any = await categoryApi.getCategory();
      const list: Category[] = res?.data ?? [];
      setCategories(list);
      if (list.length > 0) {
        setSelectedCategoryId(list[0]._id);
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to load categories');
    }
  }

  const loadServices = useCallback(
    async (categoryId: string, loc: Region) => {
      try {
        const res: any = await serviceApi.nearMeServicebyCategory({
          category: categoryId,
          location: [loc.longitude, loc.latitude],
        });
        setServices(res?.data ?? []);
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Unable to load services');
      }
    },
    [showToast],
  );

  useEffect(() => {
    if (selectedCategoryId && region) {
      loadServices(selectedCategoryId, region);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, region]);

  function onSelectCategory(id: string) {
    setSelectedCategoryId(id);
  }

  function onChangeAddress(text: string) {
    setAddress(text);
    if (predictionsTimer.current) clearTimeout(predictionsTimer.current);
    if (!text) {
      setPredictions([]);
      return;
    }
    predictionsTimer.current = setTimeout(async () => {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text,
        )}&key=${GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        setPredictions(json?.predictions ?? []);
      } catch {
        setPredictions([]);
      }
    }, 400);
  }

  async function onSelectPrediction(prediction: PlacePrediction) {
    setAddress(prediction.description);
    setPredictions([]);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      const loc = json?.result?.geometry?.location;
      if (loc) {
        const newRegion = { latitude: loc.lat, longitude: loc.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 500);
      }
    } catch {
      showToast('Unable to find that location');
    }
  }

  function onMarkerPress(service: ServiceListing) {
    setSelectedService(service);
    setSelectedTime(service.service_slot?.[0] ?? null);
    setShowServiceModal(true);
  }

  function onBookAppointment() {
    setShowServiceModal(false);
    setShowSlotModal(true);
  }

  function onConfirmSlot() {
    setShowSlotModal(false);
    setShowPaymentModal(true);
  }

  async function onSubmitPayment() {
    setSubmitted(true);
    if (!payName || !payEmail || !payPhone || !payGender || !payPurpose || !selectedService || !selectedTime) {
      return;
    }

    const fullDate = moment(`${selectedDate},${selectedTime}`, 'DD/MM/YYYY,HH:mm').format();

    showLoading();
    try {
      const res: any = await appointmentApi.createAppointment({
        name: payName,
        email: payEmail,
        phone: payPhone,
        gender: payGender,
        purpose_of_visit: payPurpose,
        date: moment(selectedDate, 'DD/MM/YYYY').format(),
        time: moment(selectedTime, 'HH:mm').format('h:mm A'),
        service: selectedService._id,
        full_date: fullDate,
        service_provider: selectedService.user._id,
        service_ref: selectedService._id,
      });
      setShowPaymentModal(false);
      setSubmitted(false);
      setPayName('');
      setPayEmail('');
      setPayPhone('');
      setPayGender('');
      setPayPurpose('');
      navigation.navigate('PaymentSuccess', { appointmentId: res?.data?._id });
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      hideLoading();
    }
  }

  const nameError = submitted && !payName ? 'Name is required.' : undefined;
  const emailError = submitted && !payEmail ? 'Email is required.' : undefined;
  const phoneError = submitted && !payPhone ? 'Phone is required.' : undefined;
  const genderError = submitted && !payGender ? 'Gender is required.' : undefined;
  const purposeError = submitted && !payPurpose ? 'Purpose of visit is required.' : undefined;

  return (
    <View style={styles.flex}>
      <View style={[styles.searchWrap, { top: insets.top + 12 }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search location"
          value={address}
          onChangeText={onChangeAddress}
          placeholderTextColor={colors.border}
        />
        {predictions.length > 0 && (
          <View style={styles.predictionsList}>
            {predictions.map(item => (
              <TouchableOpacity key={item.place_id} style={styles.predictionRow} onPress={() => onSelectPrediction(item)}>
                <Text style={styles.predictionText} numberOfLines={1}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {region ? (
        <MapView ref={mapRef} style={styles.map} initialRegion={region} showsUserLocation>
          {services.map(service => (
            <Marker
              key={service._id}
              coordinate={{
                latitude: service.service_location.coordinates[1],
                longitude: service.service_location.coordinates[0],
              }}
              title={service.service_name}
              onPress={() => onMarkerPress(service)}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          {locationError ? (
            <Text style={styles.errorText}>{locationError}</Text>
          ) : (
            <ActivityIndicator size="large" color={colors.primary} />
          )}
        </View>
      )}

      <View style={styles.categoryBar}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategoryId === item._id && styles.categoryChipActive]}
              onPress={() => onSelectCategory(item._id)}>
              <Text style={[styles.categoryChipText, selectedCategoryId === item._id && styles.categoryChipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Service detail modal */}
      <Modal visible={showServiceModal} animationType="slide" transparent onRequestClose={() => setShowServiceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
            {selectedService && (
              <>
                {selectedService.service_photo?.[0] ? (
                  <Image source={{ uri: selectedService.service_photo[0] }} style={styles.serviceImage} />
                ) : null}
                <Text style={styles.sheetTitle}>{selectedService.service_name}</Text>
                <Text style={styles.sheetSubtitle}>{selectedService.user?.name}</Text>
                {selectedService.service_description ? (
                  <Text style={styles.sheetBody}>{selectedService.service_description}</Text>
                ) : null}
                <PrimaryButton title="Book Appointment" onPress={onBookAppointment} style={styles.sheetButton} />
                <TouchableOpacity onPress={() => setShowServiceModal(false)}>
                  <Text style={styles.sheetCancel}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Time slot modal */}
      <Modal visible={showSlotModal} animationType="slide" transparent onRequestClose={() => setShowSlotModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
            <Text style={styles.sheetTitle}>Select Date & Time</Text>
            <View style={styles.chipRow}>
              {DATE_LIST.map(date => (
                <TouchableOpacity
                  key={date}
                  style={[styles.dateChip, selectedDate === date && styles.dateChipActive]}
                  onPress={() => setSelectedDate(date)}>
                  <Text style={[styles.dateChipText, selectedDate === date && styles.dateChipTextActive]}>
                    {moment(date, 'DD/MM/YYYY').format('DD MMM')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.chipRow}>
              {selectedService?.service_slot?.map(time => (
                <TouchableOpacity
                  key={time}
                  style={[styles.dateChip, selectedTime === time && styles.dateChipActive]}
                  onPress={() => setSelectedTime(time)}>
                  <Text style={[styles.dateChipText, selectedTime === time && styles.dateChipTextActive]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <PrimaryButton title="Continue" onPress={onConfirmSlot} style={styles.sheetButton} disabled={!selectedTime} />
            <TouchableOpacity onPress={() => setShowSlotModal(false)}>
              <Text style={styles.sheetCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment / visitor details modal */}
      <Modal visible={showPaymentModal} animationType="slide" transparent onRequestClose={() => setShowPaymentModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.sheetScroll} contentContainerStyle={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
            <Text style={styles.sheetTitle}>Visitor Details</Text>
            <TextField label="Name" value={payName} onChangeText={setPayName} error={nameError} />
            <TextField label="Email" value={payEmail} onChangeText={setPayEmail} keyboardType="email-address" autoCapitalize="none" error={emailError} />
            <TextField label="Phone" value={payPhone} onChangeText={setPayPhone} keyboardType="phone-pad" error={phoneError} />
            <TextField label="Gender" value={payGender} onChangeText={setPayGender} error={genderError} />
            <TextField label="Purpose of Visit" value={payPurpose} onChangeText={setPayPurpose} error={purposeError} />
            <PrimaryButton title="Confirm Appointment" onPress={onSubmitPayment} style={styles.sheetButton} />
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.sheetCancel}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  searchWrap: { position: 'absolute', left: 16, right: 16, zIndex: 10 },
  searchInput: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textDark,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  predictionsList: { backgroundColor: colors.white, borderRadius: 10, marginTop: 6, overflow: 'hidden' },
  predictionRow: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.backgroundLightAlt },
  predictionText: { fontSize: 14, color: colors.textDark },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.gray, fontSize: 14 },
  categoryBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 12, backgroundColor: colors.white },
  categoryList: { paddingHorizontal: 16, gap: 10 },
  categoryChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 10 },
  categoryChipActive: { backgroundColor: colors.primaryAlt, borderColor: colors.primaryAlt },
  categoryChipText: { fontSize: 13, color: colors.textDark },
  categoryChipTextActive: { color: colors.white },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetScroll: { maxHeight: '85%' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  serviceImage: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.textDarker },
  sheetSubtitle: { fontSize: 14, color: colors.gray, marginTop: 2 },
  sheetBody: { fontSize: 14, color: colors.textDark, marginTop: 12, lineHeight: 20 },
  sheetButton: { marginTop: 24 },
  sheetCancel: { textAlign: 'center', color: colors.gray, fontSize: 14, marginTop: 16, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  dateChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  dateChipActive: { backgroundColor: colors.primaryAlt, borderColor: colors.primaryAlt },
  dateChipText: { fontSize: 13, color: colors.textDark },
  dateChipTextActive: { color: colors.white },
});
