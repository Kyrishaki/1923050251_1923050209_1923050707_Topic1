import { Redirect } from 'expo-router';
import React from 'react';
import { selectIsAuthenticated } from '../src/store/selectors';
import { useSessionStore } from '../src/store/useSessionStore';

export default function Index() {
  const isAuthenticated = useSessionStore(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
