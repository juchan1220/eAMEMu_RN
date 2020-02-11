/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import MainScreen from './src/screen/MainScreen';
import CardEditScreen from './src/screen/CardEditScreen';

const MainNavigator = createStackNavigator({
  Home: {
    screen: MainScreen,
    navigationOptions: {headerShown: false}
  },
  CardEditScreen: {
    screen: CardEditScreen,
    navigationOptions: {headerShown: false}
  },
  },
    {
      initialRouteName: 'Home',
    }
)


const AppContainer = createAppContainer(MainNavigator);

const App: () => React$Node = () => {
  return (
      <>
        <AppContainer/>
      </>
  );
};

export default App;
