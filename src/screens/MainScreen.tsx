import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  findNodeHandle,
  Alert,
  StyleSheet,
  Image,
  FlatList,
} from 'react-native';
import update from 'react-addons-update';
import Hcef from '../modules/Hcef';
import CardConv from '../modules/CardConv';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from 'i18n-js';

import CardView from '../components/Card';
import { Card } from '../types';

const RNFS = require('react-native-fs');

/*
class MainScreen extends React.Component {
  state = {
    cards: [],
    cardHeight: 1,
    support: false,
  };

  async loadCards() {
    let cardsJson = await AsyncStorage.getItem('cards');
    this.setState({ cards: cardsJson ? JSON.parse(cardsJson) : [] });
  }

  componentDidMount() {
    this.prevCard = null;
    this.prevIndex = -1;
    this.loadCards();

    if (Hcef.support !== true) {
      Alert.alert(
        i18n.t('alert_not_support_title'),
        i18n.t('alert_not_support_content'),
        [{ text: i18n.t('alert_not_support_yes') }],
      );
    } else if (Hcef.enabled !== true) {
      Alert.alert(i18n.t('alert_nfc_title'), i18n.t('alert_nfc_content'), [
        { text: i18n.t('alert_nfc_yes') },
      ]);
    }

    if (Hcef.support && Hcef.enabled) {
      Hcef.disableService(); // 카드를 활성화하지 않았는데도 카드가 에뮬되는 이슈 방지
    }

    let { height, width } = Dimensions.get('window');

    this.setState({
      cardHeight: ((width - 48) * 53.98) / 85.6,
    });
  }

  async switch(card, index) {
    if (!Hcef.support || !Hcef.enabled) {
      return;
    }

    if (card.enabled === true) {
      this.disable(card, index);
    } else {
      this.enable(card, index);
    }
  }

  async enable(card, index) {
    if (this.prevCard && this.prevCard.enabled) {
      await this.disable(this.prevCard, this.prevIndex);
    }

    let ret = false;
    let ret2 = false;

    ret = await Hcef.setSID(card.sid);
    if (ret) {
      ret2 = await Hcef.enableService();
    }

    if (ret && ret2) {
      this.prevCard = card;
      this.prevCard.enabled = true;
      this.prevIndex = index;
      this.setState({
        cards: update(this.state.cards, {
          [index]: { enabled: { $set: true } },
        }),
      });
    }
  }

  async disable(card, index) {
    if (card.enabled) {
      let ret = await Hcef.disableService();
      if (ret) {
        card.enabled = false;
        this.setState({
          cards: update(this.state.cards, {
            [index]: { enabled: { $set: false } },
          }),
        });
        return true;
      }
    }
    return false;
  }

  async cardListUpdate(name, sid, index, image, navigation) {
    let uid = await CardConv.convertSID(sid);
    let internalPath = '';

    if (image !== '') {
      internalPath = RNFS.DocumentDirectoryPath + '/' + new Date().valueOf();

      if (image.startsWith('file://')) {
        image = image.replace('file://', '');
      }

      await RNFS.copyFile(image, internalPath);

      internalPath = 'file://' + internalPath;
    }

    if (index === null) {
      this.setState(
        {
          cards: update(this.state.cards, {
            $push: [{ name: name, sid: sid, uid: uid, image: internalPath }],
          }),
        },
        async () => {
          await AsyncStorage.setItem('cards', JSON.stringify(this.state.cards));
        },
      );
    } else {
      this.setState(
        {
          cards: update(this.state.cards, {
            [index]: {
              name: { $set: name },
              sid: { $set: sid },
              uid: { $set: uid },
              image: { $set: internalPath },
            },
          }),
        },
        async () => {
          await AsyncStorage.setItem('cards', JSON.stringify(this.state.cards));
        },
      );
    }

    Alert.alert('', i18n.t('alert_save_content'), [
      {
        text: i18n.t('alert_save_yes'),
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
  }

  cardListDelete(index) {
    Alert.alert(i18n.t('alert_delete_title'), i18n.t('alert_delete_content'), [
      { text: i18n.t('alert_delete_no') },
      {
        text: i18n.t('alert_delete_yes'),
        onPress: () => {
          if (this.state.cards[index].image !== '') {
            RNFS.unlink(this.state.cards[index].image);
          }
          this.setState(
            {
              cards: update(this.state.cards, {
                $splice: [[index, 1]],
              }),
            },
            async () => {
              await AsyncStorage.setItem(
                'cards',
                JSON.stringify(this.state.cards),
              );
            },
          );
        },
      },
    ]);
  }

  render() {
    let cardWidget = [];

    this.state.cards.forEach((card, index) => {
      cardWidget.push(
        <Card
          card={card}
          index={index}
          onPress={(card, index) => this.switch(card, index)}
          cardHeight={this.state.cardHeight}
          disableCallback={(card, index) => this.disable(card, index)}
          update={(name, sid, index, image, navigation) =>
            this.cardListUpdate(name, sid, index, image, navigation)
          }
          delete={index => this.cardListDelete(index)}
          navigation={this.props.navigation}
        />,
      );
    });

    return (
      <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
        <StatusBar
          barStyle="dark-content"
          translucent={true}
          backgroundColor={'#ffffff'}
        />
        <View
          style={{
            height: 48,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
          }}>
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: 'bold',
                textAlignVertical: 'center',
              }}>
              {i18n.t('header_home')}
            </Text>

            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() =>
                this.props.navigation.navigate('CardEditScreen', {
                  update: (name, sid, index, image, navigation) =>
                    this.cardListUpdate(name, sid, index, image, navigation),
                })
              }>
              <Icon name="add" size={26} color={'rgba(0,0,0,0.7)'} />
            </TouchableOpacity>
          </View>
        </View>

        {this.state.cards && this.state.cards.length > 0 ? (
          <ScrollView style={{ flex: 1 }}>{cardWidget}</ScrollView>
        ) : (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 17, color: '#9E9E9E' }}>
              {i18n.t('main_empty_string')}
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }
}
*/

const ListSeparator = () => <View style={styles.separator} />;

const MainScreen = () => {
  const [cards, setCards] = useState<Card[]>([
    {
      sid: '02FE000000000000',
      name: 'e-amusement pass',
    },
  ]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />

      {cards.length > 0 ? (
        <FlatList
          style={styles.list}
          data={cards}
          renderItem={card => <CardView card={card.item} />}
          ItemSeparatorComponent={ListSeparator}
          ListHeaderComponent={View}
          ListHeaderComponentStyle={styles.separator}
          ListFooterComponent={View}
          ListFooterComponentStyle={styles.separator}
        />
      ) : (
        <View />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  list: {
    // paddingHorizontal: 16,
  },
  separator: {
    height: 16,
  },
});

export default MainScreen;
