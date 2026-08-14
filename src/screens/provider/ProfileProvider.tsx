import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../../components/Text';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { authApi } from '../../api/endpoints';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';
import { pickImage, pickMultipleImages } from '../../utils/imagePicker';
import { colors } from '../../theme/colors';
import type { UserProfile } from '../../types/models';

const MAX_DOCUMENTS = 5;

export default function ProfileProvider() {
  const { userDetail, updateUserDetail } = useAuth();
  const { showLoading, hideLoading, showToast } = useUi();

  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aboutUs, setAboutUs] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [newPhoto, setNewPhoto] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [existingDocuments, setExistingDocuments] = useState<string[]>([]);
  const [newDocuments, setNewDocuments] = useState<{ uri: string; type: string; name: string }[]>([]);
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
          setAboutUs(profile.about_us ?? '');
          setPhotoUri(profile.profile);
          setExistingDocuments(profile.document ?? []);
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

  async function handlePickDocuments() {
    const remaining = MAX_DOCUMENTS - existingDocuments.length - newDocuments.length;
    if (remaining <= 0) return;
    const assets = await pickMultipleImages(remaining);
    const picked = assets
      .filter(a => a.uri)
      .slice(0, remaining)
      .map(a => ({ uri: a.uri as string, type: a.type ?? 'image/jpeg', name: a.fileName ?? 'document.jpg' }));
    setNewDocuments(prev => [...prev, ...picked]);
  }

  function removeExistingDocument(uri: string) {
    setExistingDocuments(prev => prev.filter(d => d !== uri));
  }

  function removeNewDocument(uri: string) {
    setNewDocuments(prev => prev.filter(d => d.uri !== uri));
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
      formData.append('about_us', aboutUs);
      formData.append('oldImages', JSON.stringify(existingDocuments));
      if (newPhoto) {
        formData.append('profile', newPhoto as unknown as Blob);
      }
      newDocuments.forEach(doc => {
        formData.append('document', doc as unknown as Blob);
      });
      const res: any = await authApi.updateProfile(formData);
      if (res?.data && userDetail) {
        await updateUserDetail({ ...userDetail, ...res.data });
        setExistingDocuments(res.data.document ?? []);
      }
      showToast('Profile updated successfully');
      setIsEdit(false);
      setSubmitted(false);
      setNewPhoto(null);
      setNewDocuments([]);
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
            <Text style={styles.avatarInitial}>{(name || 'P').charAt(0).toUpperCase()}</Text>
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
      <TextField label="About Us" value={aboutUs} onChangeText={setAboutUs} editable={isEdit} multiline />

      <View style={styles.documentsSection}>
        <Text style={styles.documentsLabel}>Documents</Text>
        <View style={styles.documentsRow}>
          {existingDocuments.map(uri => (
            <View key={uri} style={styles.documentThumbWrap}>
              <Image source={{ uri }} style={styles.documentThumb} />
              {isEdit ? (
                <TouchableOpacity style={styles.removeBadge} onPress={() => removeExistingDocument(uri)}>
                  <Text style={styles.removeBadgeText}>×</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
          {newDocuments.map(doc => (
            <View key={doc.uri} style={styles.documentThumbWrap}>
              <Image source={{ uri: doc.uri }} style={styles.documentThumb} />
              {isEdit ? (
                <TouchableOpacity style={styles.removeBadge} onPress={() => removeNewDocument(doc.uri)}>
                  <Text style={styles.removeBadgeText}>×</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
          {isEdit && existingDocuments.length + newDocuments.length < MAX_DOCUMENTS ? (
            <TouchableOpacity style={styles.addDocumentButton} onPress={handlePickDocuments}>
              <Text style={styles.addDocumentText}>+</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

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
  documentsSection: { width: '100%', marginTop: 20 },
  documentsLabel: { fontSize: 13, color: colors.gray, marginBottom: 8 },
  documentsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  documentThumbWrap: { position: 'relative' },
  documentThumb: { width: 64, height: 64, borderRadius: 8 },
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
  addDocumentButton: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDocumentText: { fontSize: 24, color: colors.border },
  button: { width: '100%', marginTop: 24 },
});
