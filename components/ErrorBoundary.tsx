import React, {Component, ErrorInfo, ReactNode} from 'react';
import {View, Text, Pressable, Platform} from 'react-native';
import {t} from '@/i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
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
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            gap: 16,
          }}>
          <Text style={{fontSize: 16, textAlign: 'center'}}>
            {t('errorBoundary.sorryThereWasAnError')}
          </Text>
          <Pressable
            onPress={this.retry}
            accessibilityRole="button"
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#888',
            }}>
            <Text style={{fontSize: 16}}>{t('errorBoundary.tryAgain')}</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
