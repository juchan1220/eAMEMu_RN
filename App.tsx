import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainScreen from './src/screens/MainScreen';
import { Card } from './src/types';
import CardEditScreen from './src/screens/CardEditScreen';
import { QueryClient, QueryClientProvider } from 'react-query';

export type RootStackParams = {
  Main: undefined;
  Add: undefined;
  Edit: { card: Card; index: number };
};

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator<RootStackParams>();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name={'Main'}
            component={MainScreen}
            options={{
              title: '홈',
            }}
          />
          <Stack.Screen
            name={'Add'}
            component={CardEditScreen}
            options={{ title: '카드 추가' }}
          />
          <Stack.Screen
            name={'Edit'}
            component={CardEditScreen}
            options={{ title: '카드 편집' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
};

export default App;
