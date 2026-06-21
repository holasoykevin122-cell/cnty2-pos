import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * Red de seguridad: si algo falla al renderizar, en vez de cerrar la app
 * muestra el mensaje del error en pantalla (para poder diagnosticarlo).
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('App error capturado:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.bg }}
          contentContainerStyle={{ padding: 24, paddingTop: 80 }}
        >
          <Text style={{ fontFamily: fonts.bold, fontSize: 20, color: colors.danger, marginBottom: 12 }}>
            Ocurrió un error
          </Text>
          <Text selectable style={{ fontFamily: fonts.semibold, fontSize: 14, color: colors.text, marginBottom: 16 }}>
            {String(this.state.error?.message || this.state.error)}
          </Text>
          <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 16 }} />
          <Text selectable style={{ fontFamily: fonts.regular, fontSize: 11, lineHeight: 16, color: colors.textMuted }}>
            {this.state.error?.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}
