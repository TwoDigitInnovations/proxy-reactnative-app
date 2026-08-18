import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Text } from '../../components/Text';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { authApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';
import { pickImage } from '../../utils/imagePicker';
import { colors } from '../../theme/colors';
import { GOOGLE_MAPS_API_KEY } from '../../config/maps';
import type { Gender, UserProfile } from '../../types/models';

interface PlacePrediction {
  place_id: string;
  description: string;
}

const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Other'];

const DOB_PICKER_ANCHOR = moment().subtract(18, 'years').toDate();

function parseDob(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = moment.utc(value);
  if (!parsed.isValid()) return undefined;
  return new Date(parsed.year(), parsed.month(), parsed.date());
}

export default function Profile() {
  const { userDetail, updateUserDetail } = useAuth();
  const { showLoading, hideLoading, showToast } = useUi();

  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [newPhoto, setNewPhoto] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const predictionsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: any = await authApi.getProfile();
        const profile: UserProfile = res?.data;
        if (mounted && profile) {
          setName(profile.name ?? '');
          setEmail(profile.email ?? '');
          setPhone(profile.phone ?? '');
          setAddress(profile.address ?? '');
          setDob(parseDob(profile.dob));
          setGender(profile.gender);
          setLatitude(profile.latitude);
          setLongitude(profile.longitude);
          setPhotoUri(profile.profile);
        }
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Unable to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePickPhoto() {
    const asset = await pickImage();
    if (!asset?.uri) return;
    setPhotoUri(asset.uri);
    setNewPhoto({ uri: asset.uri, type: asset.type ?? 'image/jpeg', name: asset.fileName ?? 'profile.jpg' });
  }

  function onDobChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowDobPicker(false);
    if (event.type === 'dismissed') return;
    if (selected) setDob(selected);
  }

  function onChangeAddressText(text: string) {
    setAddress(text);
    if (!isEdit) return;
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
        setLatitude(loc.lat);
        setLongitude(loc.lng);
      }
    } catch {
      // Fallback
    }
  }

  const nameError = submitted && !name ? 'Name is required.' : undefined;
  const emailError = submitted && !email ? 'Email is required.' : undefined;

  async function handleSave() {
    setSubmitted(true);
    if (!name || !email) return;

    showLoading();
    try {
      let lat = latitude;
      let lng = longitude;

      if (address && (lat === undefined || lng === undefined)) {
        try {
          const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address,
          )}&key=${GOOGLE_MAPS_API_KEY}`;
          const geoRes = await fetch(geoUrl);
          const geoJson = await geoRes.json();
          const location = geoJson?.results?.[0]?.geometry?.location;
          if (location) {
            lat = location.lat;
            lng = location.lng;
            setLatitude(lat);
            setLongitude(lng);
          }
        } catch {
          // Geocode fallback
        }
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('address', address);
      if (dob) formData.append('dob', moment(dob).format('YYYY-MM-DD'));
      if (gender) formData.append('gender', gender);
      if (lat !== undefined) formData.append('latitude', String(lat));
      if (lng !== undefined) formData.append('longitude', String(lng));

      if (newPhoto) {
        formData.append('profile', newPhoto as unknown as Blob);
      }

      const res: any = await authApi.updateProfile(formData);
      const updatedUser = res?.data || {};

      if (lat !== undefined && lng !== undefined) {
        await AsyncStorage.setItem(
          'user_saved_location',
          JSON.stringify({ address, latitude: lat, longitude: lng }),
        );
      }

      if (userDetail) {
        await updateUserDetail({ ...userDetail, ...updatedUser, address, latitude: lat, longitude: lng });
      }

      showToast('Profile & Location updated successfully');
      setIsEdit(false);
      setSubmitted(false);
      setPredictions([]);
      setShowDobPicker(false);
      setNewPhoto(null);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      hideLoading();
    }
  }

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" color={colors.primary} />;
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={isEdit ? handlePickPhoto : undefined} style={styles.avatarWrap} activeOpacity={isEdit ? 0.7 : 1}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{(name || 'U').charAt(0).toUpperCase()}</Text>
            </View>
          )}
          {isEdit ?
            <Text
              style={styles.editPhotoLabel}
            >
              Change Photo
            </Text>
            : null
          }
        </TouchableOpacity>

        {/* {isEdit ? (
          null
        ) : (
          <Text onPress={() => setIsEdit(true)} style={styles.editPhotoLabel}>Edit Profile</Text>
        )} */}

        <View style={styles.fullWidth}>
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            editable={isEdit}
            error={nameError}
          />

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            editable={isEdit}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />

          <TextField
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            editable={isEdit}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            onPress={isEdit ? () => setShowDobPicker(true) : undefined}
            activeOpacity={isEdit ? 0.7 : 1}>
            <View pointerEvents="none">
              <TextField
                label="Date of Birth"
                value={dob ? moment(dob).format('DD MMM YYYY') : ''}
                editable={false}
                placeholder="Select your date of birth"
              />
            </View>
          </TouchableOpacity>

          {showDobPicker && (
            <DateTimePicker
              value={dob ?? DOB_PICKER_ANCHOR}
              mode="date"
              maximumDate={new Date()}
              display={Platform.OS === 'android' ? 'default' : 'spinner'}
              onChange={onDobChange}
            />
          )}
          {showDobPicker && Platform.OS === 'ios' && (
            <PrimaryButton
              title="Done"
              onPress={() => setShowDobPicker(false)}
              style={styles.doneButton}
            />
          )}

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.map(option => {
                const selected = gender === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.genderChip, selected && styles.genderChipSelected]}
                    onPress={isEdit ? () => setGender(option) : undefined}
                    activeOpacity={isEdit ? 0.7 : 1}>
                    <Text style={[styles.genderChipText, selected && styles.genderChipTextSelected]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.addressWrap}>
            <TextField
              label="Home / City Address"
              value={address}
              onChangeText={onChangeAddressText}
              editable={isEdit}
              placeholder="e.g. Rajajipuram, Lucknow, Uttar Pradesh"
            />
            {predictions.length > 0 && isEdit && (
              <View style={styles.predictionsList}>
                {predictions.map(item => (
                  <TouchableOpacity
                    key={item.place_id}
                    style={styles.predictionRow}
                    onPress={() => onSelectPrediction(item)}>
                    <Text style={styles.predictionText} numberOfLines={1}>
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {isEdit ? (
          <PrimaryButton title="Save Profile & Location" onPress={handleSave} style={styles.button} />
        ) : (
          <PrimaryButton title="Edit Profile" onPress={() => setIsEdit(true)} style={styles.button} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, alignItems: 'center' },
  avatarWrap: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.primary, fontSize: 32, fontWeight: '700' },
  editPhotoLabel: { fontSize: 13, color: colors.primaryAlt, fontWeight: '600', marginTop: 8 },
  fullWidth: { width: '100%' },
  fieldWrap: { marginTop: 16 },
  fieldLabel: { fontSize: 13, color: colors.gray, marginBottom: 6 },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  genderChipSelected: { borderColor: colors.primary, backgroundColor: colors.backgroundLight },
  genderChipText: { fontSize: 15, color: colors.gray },
  genderChipTextSelected: { color: colors.primary, fontWeight: '600' },
  doneButton: { width: '100%', marginTop: 12 },
  addressWrap: { position: 'relative', width: '100%', zIndex: 10 },
  predictionsList: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginTop: -10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.backgroundLightAlt,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  predictionRow: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.backgroundLightAlt },
  predictionText: { fontSize: 14, color: colors.textDark },
  button: { width: '100%', marginTop: 24 },
});
