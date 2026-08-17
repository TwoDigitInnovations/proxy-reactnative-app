import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../components/Text';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { categoryApi, serviceApi, appointmentApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';
import { NotificationBellButton, useNotifications } from '../../context/NotificationContext';
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

function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

export default function Home() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userDetail } = useAuth();
  const { showLoading, hideLoading, showToast } = useUi();
  const { addNotification } = useNotifications();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region | null>(null);
  const [hasCustomLocation, setHasCustomLocation] = useState(false);
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

  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [activeTargetCoords, setActiveTargetCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const initLocation = useCallback(async () => {
    try {
      let initialLat: number | null = null;
      let initialLng: number | null = null;
      let initialAddr: string | null = null;

      const storedLoc = await AsyncStorage.getItem('user_saved_location');
      if (storedLoc) {
        try {
          const parsed = JSON.parse(storedLoc);
          if (parsed?.latitude && parsed?.longitude) {
            initialLat = parsed.latitude;
            initialLng = parsed.longitude;
            initialAddr = parsed.address || null;
          }
        } catch {}
      }

      if (!initialLat && userDetail?.latitude && userDetail?.longitude) {
        initialLat = userDetail.latitude;
        initialLng = userDetail.longitude;
        initialAddr = userDetail.address || null;
      }

      if (initialLat && initialLng) {
        setHasCustomLocation(true);
        if (initialAddr) setAddress(initialAddr);
        const newRegion = { latitude: initialLat, longitude: initialLng, latitudeDelta: 0.05, longitudeDelta: 0.05 };
        setRegion(newRegion);
        setTimeout(() => {
          mapRef.current?.animateToRegion(newRegion, 600);
        }, 300);
      } else {
        setHasCustomLocation(false);
        const granted = await requestLocationPermission();
        if (granted) {
          const loc = await getCurrentLocation();
          const newRegion = { latitude: loc.latitude, longitude: loc.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 };
          setRegion(newRegion);
          setTimeout(() => {
            mapRef.current?.animateToRegion(newRegion, 600);
          }, 300);
        } else {
          setLocationError('Location permission denied');
        }
      }

      loadCategories();
    } catch {
      setLocationError('Unable to fetch location');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetail?.latitude, userDetail?.longitude]);

  useFocusEffect(
    useCallback(() => {
      initLocation();
    }, [initLocation]),
  );

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
  }, [selectedCategoryId, region?.latitude, region?.longitude]);

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

  function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function openExternalNavigation(lat: number, lng: number) {
    const latLng = `${lat},${lng}`;
    const url = Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${latLng}&dirflg=d`
      : `google.navigation:q=${latLng}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latLng}`;
        Linking.openURL(webUrl);
      }
    }).catch(() => {
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latLng}`;
      Linking.openURL(webUrl);
    });
  }

  async function handleStartNavigation(service: ServiceListing) {
    if (!region) return;
    const originLat = region.latitude;
    const originLng = region.longitude;
    const destLat = service.service_location.coordinates[1];
    const destLng = service.service_location.coordinates[0];

    const distKm = calculateDistanceKm(originLat, originLng, destLat, destLng);

    setActiveTargetCoords({ latitude: destLat, longitude: destLng });
    setShowServiceModal(false);
    showLoading();

    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();

      let coords: { latitude: number; longitude: number }[] = [];
      let distText = `${distKm.toFixed(1)} km`;
      let durationText = `${Math.max(2, Math.round(distKm * 2.5))} mins in traffic`;

      if (json?.routes?.[0]?.overview_polyline?.points) {
        coords = decodePolyline(json.routes[0].overview_polyline.points);
        const leg = json.routes[0].legs?.[0];
        if (leg?.distance?.text) distText = leg.distance.text;
        if (leg?.duration?.text) durationText = leg.duration.text;
      }

      if (!coords || coords.length < 2) {
        coords = [
          { latitude: originLat, longitude: originLng },
          { latitude: (originLat + destLat) / 2 + 0.003, longitude: (originLng + destLng) / 2 - 0.003 },
          { latitude: destLat, longitude: destLng },
        ];
      }

      setRouteInfo({ distance: distText, duration: durationText });
      setRouteCoordinates(coords);

      if (distKm < 0.1) {
        mapRef.current?.animateToRegion(
          {
            latitude: (originLat + destLat) / 2,
            longitude: (originLng + destLng) / 2,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500,
        );
      } else {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 140, right: 60, bottom: 220, left: 60 },
          animated: true,
        });
      }
    } catch {
      const fallbackCoords = [
        { latitude: originLat, longitude: originLng },
        { latitude: (originLat + destLat) / 2 + 0.003, longitude: (originLng + destLng) / 2 - 0.003 },
        { latitude: destLat, longitude: destLng },
      ];
      setRouteInfo({
        distance: `${distKm.toFixed(1)} km`,
        duration: `${Math.max(2, Math.round(distKm * 2.5))} mins in traffic`,
      });
      setRouteCoordinates(fallbackCoords);
      mapRef.current?.animateToRegion(
        {
          latitude: (originLat + destLat) / 2,
          longitude: (originLng + destLng) / 2,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    } finally {
      hideLoading();
    }
  }

  function clearRouteNavigation() {
    setRouteCoordinates([]);
    setRouteInfo(null);
    setActiveTargetCoords(null);
  }

  function zoomIn() {
    if (!region) return;
    const newRegion = {
      ...region,
      latitudeDelta: Math.max(0.002, region.latitudeDelta / 2),
      longitudeDelta: Math.max(0.002, region.longitudeDelta / 2),
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 300);
  }

  function zoomOut() {
    if (!region) return;
    const newRegion = {
      ...region,
      latitudeDelta: Math.min(180, region.latitudeDelta * 2),
      longitudeDelta: Math.min(360, region.longitudeDelta * 2),
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 300);
  }

  async function onMarkerPress(service: ServiceListing) {
    setSelectedService(service);
    setSelectedTime(service.service_slot?.[0] ?? null);

    if (region) {
      const originLat = region.latitude;
      const originLng = region.longitude;
      const destLat = service.service_location.coordinates[1];
      const destLng = service.service_location.coordinates[0];

      const distKm = calculateDistanceKm(originLat, originLng, destLat, destLng);
      setActiveTargetCoords({ latitude: destLat, longitude: destLng });

      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const json = await res.json();

        let coords: { latitude: number; longitude: number }[] = [];
        let distText = `${distKm.toFixed(1)} km`;
        let durationText = `${Math.max(2, Math.round(distKm * 2.5))} mins in traffic`;

        if (json?.routes?.[0]?.overview_polyline?.points) {
          coords = decodePolyline(json.routes[0].overview_polyline.points);
          const leg = json.routes[0].legs?.[0];
          if (leg?.distance?.text) distText = leg.distance.text;
          if (leg?.duration?.text) durationText = leg.duration.text;
        }

        if (!coords || coords.length < 2) {
          coords = [
            { latitude: originLat, longitude: originLng },
            { latitude: (originLat + destLat) / 2 + 0.003, longitude: (originLng + destLng) / 2 - 0.003 },
            { latitude: destLat, longitude: destLng },
          ];
        }

        setRouteInfo({ distance: distText, duration: durationText });
        setRouteCoordinates(coords);
      } catch {
        const fallbackCoords = [
          { latitude: originLat, longitude: originLng },
          { latitude: (originLat + destLat) / 2 + 0.003, longitude: (originLng + destLng) / 2 - 0.003 },
          { latitude: destLat, longitude: destLng },
        ];
        setRouteInfo({
          distance: `${distKm.toFixed(1)} km`,
          duration: `${Math.max(2, Math.round(distKm * 2.5))} mins in traffic`,
        });
        setRouteCoordinates(fallbackCoords);
      }
    }

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

  type PaymentMethod = 'Orange Money' | 'PayPal' | 'Stripe' | 'Credit Card';

  const [paymentStep, setPaymentStep] = useState<'details' | 'payment'>('details');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Orange Money');
  const [accountNumber, setAccountNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  function onProceedToPayment() {
    setSubmitted(true);
    if (!payName || !payEmail || !payPhone || !payGender || !payPurpose) {
      return;
    }
    setPaymentError(null);
    setPaymentStep('payment');
  }

  async function onSubmitPayment() {
    setPaymentError(null);
    if (selectedMethod === 'Orange Money' && !accountNumber) {
      setPaymentError('Mobile/Account Number is required.');
      return;
    }
    if (selectedMethod === 'PayPal' && !paypalEmail) {
      setPaymentError('PayPal Email is required.');
      return;
    }
    if ((selectedMethod === 'Credit Card' || selectedMethod === 'Stripe') && (!cardNumber || !cardExpiry || !cardCvv)) {
      setPaymentError('Complete card details are required.');
      return;
    }

    if (!selectedService || !selectedTime) return;

    const fullDate = moment(`${selectedDate},${selectedTime}`, 'DD/MM/YYYY,HH:mm').format();
    const txnId = `TXN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

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
        paymentMethod: selectedMethod,
        paymentAmount: 5.50,
        transactionId: txnId,
        paymentStatus: 'Completed',
      });

      const ticketNum = res?.data?.ticketNumber || 'N/A';
      addNotification(
        'Appointment Confirmed',
        `Your ticket #${ticketNum} for ${selectedService.service_name} on ${selectedDate} at ${selectedTime} is confirmed.`,
        'success',
      );

      setShowPaymentModal(false);
      setSubmitted(false);
      setPaymentStep('details');
      setPayName('');
      setPayEmail('');
      setPayPhone('');
      setPayGender('');
      setPayPurpose('');
      setAccountNumber('');
      setPaypalEmail('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
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
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search location"
            value={address}
            onChangeText={onChangeAddress}
            placeholderTextColor={colors.border}
          />
          <NotificationBellButton />
        </View>
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

      {routeInfo && (
        <View style={[styles.routeBanner, { top: insets.top + 70 }]}>
          <Text style={styles.routeBannerText}>
            🚗 {routeInfo.distance} • {routeInfo.duration}
          </Text>
          <TouchableOpacity onPress={clearRouteNavigation}>
            <Text style={styles.clearRouteText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {region ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={!hasCustomLocation}>
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

          {routeCoordinates.length > 0 && (
            <Polyline coordinates={routeCoordinates} strokeWidth={6} strokeColor="#1A73E8" />
          )}
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

      <View style={styles.zoomContainer}>
        <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut}>
          <Text style={styles.zoomText}>−</Text>
        </TouchableOpacity>
      </View>

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

                <View style={styles.crowdStatusCard}>
                  <View
                    style={[
                      styles.crowdBadge,
                      selectedService.crowdLevel === 'High'
                        ? styles.crowdHigh
                        : selectedService.crowdLevel === 'Moderate'
                        ? styles.crowdModerate
                        : styles.crowdLow,
                    ]}>
                    <Text style={styles.crowdBadgeText}>
                      {selectedService.crowdLevel === 'High'
                        ? '🔴 Heavy Rush'
                        : selectedService.crowdLevel === 'Moderate'
                        ? '🟠 Moderate Rush'
                        : '🟢 Low Rush'}
                    </Text>
                  </View>
                  <Text style={styles.queueMetaText}>
                    {(selectedService.queueCount ?? 0) === 0
                      ? '⚡ No waiting line • Direct entry available'
                      : (selectedService.queueCount ?? 0) === 1
                      ? '👥 1 person ahead • ~5 mins wait'
                      : `👥 ${selectedService.queueCount} people ahead • ~${selectedService.estimatedWaitMinutes} mins wait`}
                  </Text>
                </View>

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
            {paymentStep === 'details' ? (
              <>
                <Text style={styles.sheetTitle}>Visitor Details</Text>
                <TextField label="Name" value={payName} onChangeText={setPayName} error={nameError} />
                <TextField label="Email" value={payEmail} onChangeText={setPayEmail} keyboardType="email-address" autoCapitalize="none" error={emailError} />
                <TextField label="Phone" value={payPhone} onChangeText={setPayPhone} keyboardType="phone-pad" error={phoneError} />
                <TextField label="Gender" value={payGender} onChangeText={setPayGender} error={genderError} />
                <TextField label="Purpose of Visit" value={payPurpose} onChangeText={setPayPurpose} error={purposeError} />
                <PrimaryButton title="Proceed to Payment" onPress={onProceedToPayment} style={styles.sheetButton} />
                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                  <Text style={styles.sheetCancel}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.sheetTitle}>Payment Checkout</Text>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Booking Ticket</Text>
                    <Text style={styles.summaryVal}>$5.00</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Service Fee</Text>
                    <Text style={styles.summaryVal}>$0.50</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                    <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                    <Text style={styles.summaryTotalVal}>$5.50</Text>
                  </View>
                </View>

                <Text style={styles.methodTitle}>Select Payment Method</Text>
                <View style={styles.chipRow}>
                  {(['Orange Money', 'PayPal', 'Stripe', 'Credit Card'] as PaymentMethod[]).map(method => (
                    <TouchableOpacity
                      key={method}
                      style={[styles.dateChip, selectedMethod === method && styles.dateChipActive]}
                      onPress={() => setSelectedMethod(method)}>
                      <Text style={[styles.dateChipText, selectedMethod === method && styles.dateChipTextActive]}>{method}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {selectedMethod === 'Orange Money' && (
                  <TextField
                    label="Orange Money Phone / Account No."
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="phone-pad"
                    placeholder="+225 0700000000"
                  />
                )}

                {selectedMethod === 'PayPal' && (
                  <TextField
                    label="PayPal Email Address"
                    value={paypalEmail}
                    onChangeText={setPaypalEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="user@paypal.com"
                  />
                )}

                {(selectedMethod === 'Credit Card' || selectedMethod === 'Stripe') && (
                  <>
                    <TextField
                      label="Card Number"
                      value={cardNumber}
                      onChangeText={setCardNumber}
                      keyboardType="numeric"
                      placeholder="4111 2222 3333 4444"
                    />
                    <View style={styles.cardInline}>
                      <View style={styles.cardFlex}>
                        <TextField
                          label="Expiry (MM/YY)"
                          value={cardExpiry}
                          onChangeText={setCardExpiry}
                          placeholder="12/28"
                        />
                      </View>
                      <View style={styles.cardFlex}>
                        <TextField
                          label="CVV"
                          value={cardCvv}
                          onChangeText={setCardCvv}
                          keyboardType="numeric"
                          secureTextEntry
                          placeholder="123"
                        />
                      </View>
                    </View>
                  </>
                )}

                {paymentError ? <Text style={styles.errorTextSmall}>{paymentError}</Text> : null}

                <PrimaryButton title="Confirm & Pay ($5.50)" onPress={onSubmitPayment} style={styles.sheetButton} />
                <TouchableOpacity onPress={() => setPaymentStep('details')}>
                  <Text style={styles.sheetCancel}>Back to Details</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  searchWrap: { position: 'absolute', left: 16, right: 16, zIndex: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: {
    flex: 1,
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
  routeBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9,
    backgroundColor: colors.textDarker,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeBannerContent: { flex: 1 },
  routeBannerText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  openMapsLink: { color: colors.primaryAlt, fontSize: 12, fontWeight: '700', marginTop: 4 },
  clearRouteText: { color: colors.grayLight, fontSize: 18, fontWeight: '700', paddingLeft: 12 },
  zoomContainer: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    zIndex: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundLightAlt,
  },
  zoomText: { fontSize: 22, fontWeight: '700', color: colors.textDarker },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: colors.gray, fontSize: 14 },
  errorTextSmall: { color: '#e53935', fontSize: 13, marginTop: 10 },
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
  crowdStatusCard: { backgroundColor: colors.backgroundLight, borderRadius: 10, padding: 10, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  crowdBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  crowdLow: { backgroundColor: '#e8f5e9' },
  crowdModerate: { backgroundColor: '#fff3e0' },
  crowdHigh: { backgroundColor: '#ffebee' },
  crowdBadgeText: { fontSize: 12, fontWeight: '700' },
  queueMetaText: { fontSize: 12, color: colors.textDark, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  routeBtn: { flex: 1, borderWidth: 1, borderColor: colors.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
  routeBtnText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  googleMapsBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
  googleMapsBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  sheetButton: { marginTop: 16 },
  sheetCancel: { textAlign: 'center', color: colors.gray, fontSize: 14, marginTop: 16, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 12 },
  dateChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  dateChipActive: { backgroundColor: colors.primaryAlt, borderColor: colors.primaryAlt },
  dateChipText: { fontSize: 13, color: colors.textDark },
  dateChipTextActive: { color: colors.white },
  summaryCard: { backgroundColor: colors.backgroundLight, borderRadius: 12, padding: 14, marginTop: 14, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 13, color: colors.gray },
  summaryVal: { fontSize: 13, color: colors.textDark, fontWeight: '500' },
  summaryTotalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4, marginBottom: 0 },
  summaryTotalLabel: { fontSize: 14, fontWeight: '700', color: colors.textDarker },
  summaryTotalVal: { fontSize: 15, fontWeight: '700', color: colors.primary },
  methodTitle: { fontSize: 14, fontWeight: '600', color: colors.textDark, marginTop: 8 },
  cardInline: { flexDirection: 'row', gap: 12 },
  cardFlex: { flex: 1 },
});
