/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import MainScreen from './src/screens/MainScreen';
// import CardEditScreen from './src/screens/CardEditScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={'Main'}
          component={MainScreen}
          options={{
            title: '홈',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        {/*<Stack.Screen name={'Edit'} component={CardEditScreen} />*/}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

/*
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
*/
