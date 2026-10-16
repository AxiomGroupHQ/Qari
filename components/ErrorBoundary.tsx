import React, {Component, ErrorInfo, ReactNode} from 'react';
import {View, Text, Pressable, Platform} from 'react-native';
import {t} from '@/i18n';
import {useTheme} from '@/hooks/useTheme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Theme-aware fallback. useTheme reads a zustand store, so it works even when
// the error happened inside a provider below this boundary.
function ErrorFallback({onRetry}: {onRetry: () => void}) {
  const {theme} = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 16,
        backgroundColor: theme.colors.background,
      }}>
      <Text
        style={{fontSize: 16, textAlign: 'center', color: theme.colors.text}}>
        {t('errorBoundary.sorryThereWasAnError')}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}>
        <Text style={{fontSize: 16, color: theme.colors.text}}>
          {t('errorBoundary.tryAgain')}
        </Text>
      </Pressable>
    </View>
  );
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return {hasError: true};
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private retry = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
      return;
    }
    this.setState({hasError: false});
  };

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.retry} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
