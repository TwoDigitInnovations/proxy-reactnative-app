import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../../components/Text';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { authApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';
import { pickImage } from '../../utils/imagePicker';
import { colors } from '../../theme/colors';
import type { UserProfile } from '../../types/models';

export default function Profile() {
  const { userDetail, updateUserDetail } = useAuth();
  const { showLoading, hideLoading, showToast } = useUi();

  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [newPhoto, setNewPhoto] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

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

  const nameError = submitted && !name ? 'Name is required.' : undefined;
  const emailError = submitted && !email ? 'Email is required.' : undefined;

  async function handleSave() {
    setSubmitted(true);
    if (!name || !email) return;

    showLoading();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      if (newPhoto) {
        formData.append('profile', newPhoto as unknown as Blob);
      }
      const res: any = await authApi.updateProfile(formData);
      if (res?.data && userDetail) {
        await updateUserDetail({ ...userDetail, ...res.data });
      }
      showToast('Profile updated successfully');
      setIsEdit(false);
      setSubmitted(false);
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
    <ScrollView contentContainerStyle={styles.scroll}>
      <TouchableOpacity onPress={isEdit ? handlePickPhoto : undefined} style={styles.avatarWrap} activeOpacity={isEdit ? 0.7 : 1}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{(name || 'U').charAt(0).toUpperCase()}</Text>
          </View>
        )}
        {isEdit ? <Text style={styles.editPhotoLabel}>Change Photo</Text> : null}
      </TouchableOpacity>

      <TextField label="Name" value={name} onChangeText={setName} editable={isEdit} error={nameError} />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        editable={isEdit}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
      />
      <TextField label="Phone" value={phone} onChangeText={setPhone} editable={isEdit} keyboardType="phone-pad" />

      {isEdit ? (
        <PrimaryButton title="Save" onPress={handleSave} style={styles.button} />
      ) : (
        <PrimaryButton title="Edit Profile" onPress={() => setIsEdit(true)} style={styles.button} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, alignItems: 'center' },
  avatarWrap: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.primary, fontSize: 32, fontWeight: '700' },
  editPhotoLabel: { fontSize: 13, color: colors.primaryAlt, fontWeight: '600', marginTop: 8 },
  button: { width: '100%', marginTop: 24 },
});
