import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ScaledSheet, moderateScale} from 'react-native-size-matters';
import {useTheme} from '@/hooks/useTheme';
import {Theme} from '@/utils/themeUtils';
import {useAuthStore} from '@/store/authStore';
import {AuthError} from '@/services/auth/AuthClient';
import {useGoogleSignIn} from '@/hooks/useGoogleSignIn';
import {t} from '@/i18n';

const errorMessage = (e: unknown): string => {
  const code = e instanceof AuthError ? e.code : 'unknown';
  return t(`account.errors.${code}`, {
    defaultValue: t('account.errors.unknown'),
  });
};

export default function AccountScreen() {
  const {theme} = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const status = useAuthStore(s => s.status);
  const user = useAuthStore(s => s.user);

  if (status === 'loading') {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={theme.colors.text} />
      </View>
    );
  }
  return status === 'signedIn' ? (
    <SignedIn
      styles={styles}
      email={user?.email ?? ''}
      name={user?.name ?? null}
    />
  ) : (
    <SignedOut styles={styles} theme={theme} />
  );
}

type Styles = ReturnType<typeof createStyles>;

function SignedIn({
  styles,
  email,
  name,
}: {
  styles: Styles;
  email: string;
  name: string | null;
}) {
  const signOut = useAuthStore(s => s.signOut);
  const deleteAccount = useAuthStore(s => s.deleteAccount);
  const [busy, setBusy] = useState(false);

  const confirmDelete = () => {
    const run = async () => {
      setBusy(true);
      try {
        await deleteAccount();
      } catch (e) {
        Alert.alert(t('account.title'), errorMessage(e));
      } finally {
        setBusy(false);
      }
    };
    // Alert.alert has no buttons on web, so use confirm() there.
    if (Platform.OS === 'web') {
      if (
        window.confirm(
          `${t('account.deleteTitle')}\n\n${t('account.deleteMessage')}`,
        )
      )
        void run();
      return;
    }
    Alert.alert(t('account.deleteTitle'), t('account.deleteMessage'), [
      {text: t('common.cancel'), style: 'cancel'},
      {
        text: t('account.deleteConfirm'),
        style: 'destructive',
        onPress: () => void run(),
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t('account.signedInAs')}</Text>
      {name ? <Text style={styles.name}>{name}</Text> : null}
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.hint}>{t('account.syncInfo')}</Text>
      <Pressable
        style={styles.primary}
        onPress={() => void signOut()}
        disabled={busy}>
        <Text style={styles.primaryText}>{t('account.signOut')}</Text>
      </Pressable>
      <Pressable style={styles.danger} onPress={confirmDelete} disabled={busy}>
        <Text style={styles.dangerText}>{t('account.deleteAccount')}</Text>
      </Pressable>
    </ScrollView>
  );
}

function SignedOut({styles, theme}: {styles: Styles; theme: Theme}) {
  const signInWithEmail = useAuthStore(s => s.signInWithEmail);
  const register = useAuthStore(s => s.register);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const google = useGoogleSignIn(e => setError(errorMessage(e)));

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signIn') await signInWithEmail(email, password);
      else await register(email, password, name || undefined);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>
          {mode === 'signIn'
            ? t('account.signInTitle')
            : t('account.signUpTitle')}
        </Text>
        <Text style={styles.hint}>{t('account.benefit')}</Text>
        <Text style={styles.hint}>{t('account.emailRequired')}</Text>

        {mode === 'signUp' && (
          <TextInput
            style={styles.input}
            placeholder={t('account.name')}
            placeholderTextColor={theme.colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            textContentType="name"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder={t('account.email')}
          placeholderTextColor={theme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder={t('account.password')}
          placeholderTextColor={theme.colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType={mode === 'signIn' ? 'password' : 'newPassword'}
          autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
          onSubmitEditing={() => void submit()}
        />
        {mode === 'signUp' && (
          <Text style={styles.hint}>{t('account.passwordHint')}</Text>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.primary, busy && {opacity: 0.6}]}
          onPress={() => void submit()}
          disabled={busy || !email || !password}>
          {busy ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <Text style={styles.primaryText}>
              {mode === 'signIn' ? t('account.signIn') : t('account.signUp')}
            </Text>
          )}
        </Pressable>

        {google.available && (
          <>
            <Text style={styles.or}>{t('account.or')}</Text>
            <Pressable
              style={styles.secondary}
              onPress={() => void google.start()}
              disabled={!google.ready}>
              <Text style={styles.secondaryText}>
                {t('account.continueWithGoogle')}
              </Text>
            </Pressable>
          </>
        )}

        <Pressable
          onPress={() => {
            setError(null);
            setMode(mode === 'signIn' ? 'signUp' : 'signIn');
          }}>
          <Text style={styles.switch}>
            {mode === 'signIn'
              ? t('account.noAccount')
              : t('account.haveAccount')}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: Theme) =>
  ScaledSheet.create({
    container: {flex: 1, backgroundColor: theme.colors.background},
    center: {alignItems: 'center', justifyContent: 'center'},
    content: {
      padding: moderateScale(24),
      paddingTop: moderateScale(110),
      paddingBottom: moderateScale(160),
      gap: moderateScale(14),
      maxWidth: 480,
      width: '100%',
      alignSelf: 'center',
    },
    heading: {
      fontFamily: 'Manrope-Bold',
      fontSize: moderateScale(24),
      color: theme.colors.text,
    },
    name: {
      fontFamily: 'Manrope-SemiBold',
      fontSize: moderateScale(18),
      color: theme.colors.text,
    },
    email: {
      fontFamily: 'Manrope-Regular',
      fontSize: moderateScale(16),
      color: theme.colors.text,
    },
    hint: {
      fontFamily: 'Manrope-Regular',
      fontSize: moderateScale(13),
      color: theme.colors.textSecondary,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: moderateScale(12),
      paddingHorizontal: moderateScale(14),
      paddingVertical: moderateScale(13),
      fontSize: moderateScale(16),
      fontFamily: 'Manrope-Regular',
      color: theme.colors.text,
      textAlign: 'auto',
    },
    error: {
      color: '#d32f2f',
      fontFamily: 'Manrope-Medium',
      fontSize: moderateScale(14),
    },
    primary: {
      backgroundColor: theme.colors.text,
      borderRadius: moderateScale(12),
      paddingVertical: moderateScale(14),
      alignItems: 'center',
    },
    primaryText: {
      color: theme.colors.background,
      fontFamily: 'Manrope-SemiBold',
      fontSize: moderateScale(16),
    },
    secondary: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: moderateScale(12),
      paddingVertical: moderateScale(14),
      alignItems: 'center',
    },
    secondaryText: {
      color: theme.colors.text,
      fontFamily: 'Manrope-SemiBold',
      fontSize: moderateScale(16),
    },
    danger: {paddingVertical: moderateScale(14), alignItems: 'center'},
    dangerText: {
      color: '#d32f2f',
      fontFamily: 'Manrope-SemiBold',
      fontSize: moderateScale(15),
    },
    or: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontFamily: 'Manrope-Regular',
    },
    switch: {
      textAlign: 'center',
      color: theme.colors.text,
      fontFamily: 'Manrope-SemiBold',
      fontSize: moderateScale(14),
      paddingVertical: moderateScale(10),
    },
  });
