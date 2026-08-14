import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from '../../components/Text';
import moment from 'moment';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { categoryApi, serviceApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useUi } from '../../context/UiContext';
import { pickMultipleImages } from '../../utils/imagePicker';
import { colors } from '../../theme/colors';
import { GOOGLE_MAPS_API_KEY } from '../../config/maps';
import type { Category, ServiceListing } from '../../types/models';

const MAX_PHOTOS = 5;

interface PlacePrediction {
  place_id: string;
  description: string;
}

export default function MyServiceProvider() {
  const { showLoading, hideLoading, showToast } = useUi();

  const [serviceId, setServiceId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const predictionsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const [slots, setSlots] = useState<string[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerTime, setPickerTime] = useState(new Date());

  const [description, setDescription] = useState('');
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<{ uri: string; type: string; name: string }[]>([]);

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [categoryRes, serviceRes]: [any, any] = await Promise.all([categoryApi.getCategory(), serviceApi.getService()]);
        setCategories(categoryRes?.data ?? []);

        const service: ServiceListing | null = serviceRes?.data ?? null;
        if (service) {
          setServiceId(service._id);
          setServiceName(service.service_name ?? '');
          setAddress(service.address ?? '');
          setDescription(service.service_description ?? '');
          setSlots(service.service_slot ?? []);
          setExistingPhotos(service.service_photo ?? []);
          setCategoryId(typeof service.category === 'string' ? service.category : (service.category as any)?._id);
          if (service.service_location?.coordinates) {
            setLocation({ lng: service.service_location.coordinates[0], lat: service.service_location.coordinates[1] });
          }
        } else if (categoryRes?.data?.length) {
          setCategoryId(categoryRes.data[0]._id);
        }
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Unable to load service');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (loc) setLocation({ lat: loc.lat, lng: loc.lng });
    } catch {
      showToast('Unable to find that address');
    }
  }

  function addSlot() {
    const formatted = moment(pickerTime).format('HH:mm');
    if (!slots.includes(formatted)) {
      setSlots(prev => [...prev, formatted].sort());
    }
    setShowTimePicker(false);
  }

  function removeSlot(slot: string) {
    setSlots(prev => prev.filter(s => s !== slot));
  }

  async function handlePickPhotos() {
    const remaining = MAX_PHOTOS - existingPhotos.length - newPhotos.length;
    if (remaining <= 0) return;
    const assets = await pickMultipleImages(remaining);
    const picked = assets
      .filter(a => a.uri)
      .slice(0, remaining)
      .map(a => ({ uri: a.uri as string, type: a.type ?? 'image/jpeg', name: a.fileName ?? 'service.jpg' }));
    setNewPhotos(prev => [...prev, ...picked]);
  }

  function removeExistingPhoto(uri: string) {
    setExistingPhotos(prev => prev.filter(p => p !== uri));
  }

  function removeNewPhoto(uri: string) {
    setNewPhotos(prev => prev.filter(p => p.uri !== uri));
  }

  const nameError = submitted && !serviceName ? 'Service name is required.' : undefined;
  const addressError = submitted && !address ? 'Address is required.' : undefined;
  const categoryError = submitted && !categoryId ? 'Category is required.' : undefined;

  async function handleSave() {
    setSubmitted(true);
    if (!serviceName || !address || !categoryId || !location || slots.length === 0) {
      return;
    }

    showLoading();
    try {
      const formData = new FormData();
      if (serviceId) formData.append('id', serviceId);
      formData.append('service_name', serviceName);
      formData.append('address', address);
      formData.append('category', categoryId);
      formData.append('service_description', description);
      formData.append('service_location', JSON.stringify(location));
      formData.append('service_slot', JSON.stringify(slots));
      formData.append('oldImages', JSON.stringify(existingPhotos));
      newPhotos.forEach(photo => {
        formData.append('service_photo', photo as unknown as Blob);
      });

      if (serviceId) {
        await serviceApi.updateService(formData);
      } else {
        await serviceApi.createService(formData);
      }
      showToast('Service saved successfully');
      setSubmitted(false);
      setNewPhotos([]);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      hideLoading();
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <TextField label="Service Name" value={serviceName} onChangeText={setServiceName} error={nameError} />

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={onChangeAddress} placeholder="Enter address" placeholderTextColor={colors.border} />
        {addressError ? <Text style={styles.error}>{addressError}</Text> : null}
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

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {categories.map(item => (
            <TouchableOpacity
              key={item._id}
              style={[styles.chip, categoryId === item._id && styles.chipActive]}
              onPress={() => setCategoryId(item._id)}>
              <Text style={[styles.chipText, categoryId === item._id && styles.chipTextActive]}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {categoryError ? <Text style={styles.error}>{categoryError}</Text> : null}
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Service Slots</Text>
        <View style={styles.chipRow}>
          {slots.map(slot => (
            <TouchableOpacity key={slot} style={styles.slotChip} onPress={() => removeSlot(slot)}>
              <Text style={styles.slotChipText}>{slot} ×</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addSlotButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.addSlotText}>+ Add Slot</Text>
          </TouchableOpacity>
        </View>
        {showTimePicker && (
          <DateTimePicker
            value={pickerTime}
            mode="time"
            display="spinner"
            onChange={(_, date) => {
              if (date) setPickerTime(date);
            }}
          />
        )}
        {showTimePicker && <PrimaryButton title="Add" onPress={addSlot} style={styles.confirmSlotButton} />}
      </View>

      <TextField label="Description" value={description} onChangeText={setDescription} multiline />

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Photos</Text>
        <View style={styles.chipRow}>
          {existingPhotos.map(uri => (
            <View key={uri} style={styles.photoThumbWrap}>
              <Image source={{ uri }} style={styles.photoThumb} />
              <TouchableOpacity style={styles.removeBadge} onPress={() => removeExistingPhoto(uri)}>
                <Text style={styles.removeBadgeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          {newPhotos.map(photo => (
            <View key={photo.uri} style={styles.photoThumbWrap}>
              <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
              <TouchableOpacity style={styles.removeBadge} onPress={() => removeNewPhoto(photo.uri)}>
                <Text style={styles.removeBadgeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          {existingPhotos.length + newPhotos.length < MAX_PHOTOS ? (
            <TouchableOpacity style={styles.addPhotoButton} onPress={handlePickPhotos}>
              <Text style={styles.addPhotoText}>+</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <PrimaryButton title={serviceId ? 'Update Service' : 'Create Service'} onPress={handleSave} style={styles.button} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 60 },
  fieldWrap: { marginTop: 16 },
  label: { fontSize: 13, color: colors.gray, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.gray,
  },
  error: { fontSize: 13, color: 'red', marginTop: 5 },
  predictionsList: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.backgroundLightAlt, borderRadius: 10, marginTop: 6, overflow: 'hidden' },
  predictionRow: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.backgroundLightAlt },
  predictionText: { fontSize: 14, color: colors.textDark },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.primaryAlt, borderColor: colors.primaryAlt },
  chipText: { fontSize: 13, color: colors.textDark },
  chipTextActive: { color: colors.white },
  slotChip: { borderWidth: 1, borderColor: colors.primaryAlt, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  slotChipText: { fontSize: 13, color: colors.primaryAlt },
  addSlotButton: { borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  addSlotText: { fontSize: 13, color: colors.gray },
  confirmSlotButton: { marginTop: 10 },
  photoThumbWrap: { position: 'relative' },
  photoThumb: { width: 64, height: 64, borderRadius: 8 },
  removeBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textDarker,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBadgeText: { color: colors.white, fontSize: 13, lineHeight: 14 },
  addPhotoButton: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: { fontSize: 24, color: colors.border },
  button: { marginTop: 30 },
});
