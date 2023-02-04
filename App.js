/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import MainScreen from './src/screen/MainScreen';
import CardEditScreen from './src/screen/CardEditScreen';

import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import en from './src/locales/en';
import ko from './src/locales/ko';

const MainNavigator = createStackNavigator(
  {
    Home: {
      screen: MainScreen,
      navigationOptions: {headerShown: false},
    },
    CardEditScreen: {
      screen: CardEditScreen,
      navigationOptions: {headerShown: false},
    },
  },
  {
    initialRouteName: 'Home',
  },
);

const AppContainer = createAppContainer(MainNavigator);

const setI18nConfig = () => {
  const fallback = {languageTag: 'en'};
  const {languageTag} =
    RNLocalize.findBestAvailableLanguage(['en', 'ko']) || fallback;

  i18n.translations = {
    en,
    ko,
  };
  i18n.locale = languageTag;
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    setI18nConfig();
  }

  componentDidMount() {
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
  }

  componentWillUnmount() {
    RNLocalize.removeEventListener('change', this.handleLocalizationChange);
  }

  handleLocalizationChange = () => {
    setI18nConfig();
    this.forceUpdate();
  };

  render() {
    return (
      <>
        <AppContainer />
      </>
    );
  }
}
