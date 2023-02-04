import React from 'react';
import {
  View,
  Text,
  StatusBar,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  findNodeHandle,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import update from 'react-addons-update';
import Hcef from '../module/Hcef';
import CardConv from '../module/CardConv';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import i18n from 'i18n-js';

const RNFS = require('react-native-fs');

class Card extends React.Component {
  async onPress() {
    this.props.onPress(this.props.card, this.props.index);
  }

  async disable() {
    if (typeof this.props.disableCallback === 'function') {
      this.props.disableCallback(this.props.card, this.props.index);
    }
  }

  render() {
    let cardContent = (
      <View
        style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8}}>
        <View style={{flex: 1}}>
          <TouchableOpacity style={{flex: 1}} onPress={this.onPress.bind(this)}>
            <Text
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                fontSize: 17,
                fontWeight: 'bold',
                color: '#ffffff',
              }}>
              {this.props.card.name}
            </Text>

            <View style={{flex: 1, justifyContent: 'center', paddingTop: 20}}>
              <Text
                style={{
                  paddingTop: 0,
                  textAlign: 'center',
                  alignSelf: 'center',
                  color: '#E0E0E0',
                  fontSize: 14,
                }}>
                {this.props.card.uid.substr(0, 4) +
                  '-' +
                  this.props.card.uid.substr(4, 4) +
                  '-' +
                  this.props.card.uid.substr(8, 4) +
                  '-' +
                  this.props.card.uid.substr(12, 4)}
              </Text>
              <Text
                style={{
                  paddingTop: 8,
                  textAlign: 'center',
                  alignSelf: 'center',
                  fontSize: 24,
                  color: '#FAFAFA',
                  fontWeight: '500',
                  letterSpacing: -0.5,
                }}>
                {this.props.card.enabled
                  ? i18n.t('card_touch_to_disable')
                  : i18n.t('card_touch_to_enable')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{height: 1, backgroundColor: '#FAFAFA'}} />
        <View style={{height: 48, flexDirection: 'row'}}>
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() =>
              this.props.navigation.navigate('CardEditScreen', {
                name: this.props.card.name,
                sid: this.props.card.sid,
                image: this.props.card.image,
                index: this.props.index,
                update: this.props.update,
              })
            }>
            <Text style={{fontSize: 14, color: '#FAFAFA'}}>
              {i18n.t('card_edit')}
            </Text>
          </TouchableOpacity>
          <View style={{width: 1, backgroundColor: '#FAFAFA'}} />
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => this.props.delete(this.props.index)}>
            <Text style={{fontSize: 14, color: '#ffffff'}}>
              {i18n.t('card_delete')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    return (
      <View
        style={[
          {
            borderRadius: 8,
            height: this.props.cardHeight,
            marginTop: 24,
            marginHorizontal: 24,
            justifyContent: 'center',
          },
        ]}>
        {this.props.card.image ? (
          <ImageBackground
            source={{uri: this.props.card.image}}
            style={{
              flex: 1,
              resizeMode: 'contain',
            }}
            blurRadius={2}
            borderRadius={8}>
            {cardContent}
          </ImageBackground>
        ) : (
          <View
            style={{
              flex: 1,
              resizeMode: 'contain',
              backgroundColor: '#03A9F4',
            }}
            blurRadius={2}
            borderRadius={8}>
            {cardContent}
          </View>
        )}
      </View>
    );
  }
}

class MainScreen extends React.Component {
  state = {
    cards: [],
    cardHeight: 1,
    support: false,
  };

  async loadCards() {
    let cardsJson = await AsyncStorage.getItem('cards');
    this.setState({cards: cardsJson ? JSON.parse(cardsJson) : []});
  }

  componentDidMount() {
    this.prevCard = null;
    this.prevIndex = -1;
    this.loadCards();

    if (Hcef.support !== true) {
      Alert.alert(
        i18n.t('alert_not_support_title'),
        i18n.t('alert_not_support_content'),
        [{text: i18n.t('alert_not_support_yes')}],
      );
    } else if (Hcef.enabled !== true) {
      Alert.alert(i18n.t('alert_nfc_title'), i18n.t('alert_nfc_content'), [
        {text: i18n.t('alert_nfc_yes')},
      ]);
    }

    if (Hcef.support && Hcef.enabled) {
      Hcef.disableService(); // 카드를 활성화하지 않았는데도 카드가 에뮬되는 이슈 방지
    }

    let {height, width} = Dimensions.get('window');

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
        cards: update(this.state.cards, {[index]: {enabled: {$set: true}}}),
      });
    }
  }

  async disable(card, index) {
    if (card.enabled) {
      let ret = await Hcef.disableService();
      if (ret) {
        card.enabled = false;
        this.setState({
          cards: update(this.state.cards, {[index]: {enabled: {$set: false}}}),
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
            $push: [{name: name, sid: sid, uid: uid, image: internalPath}],
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
              name: {$set: name},
              sid: {$set: sid},
              uid: {$set: uid},
              image: {$set: internalPath},
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
      {text: i18n.t('alert_delete_no')},
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
      <SafeAreaView style={{flex: 1, paddingTop: StatusBar.currentHeight}}>
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
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
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
          <ScrollView style={{flex: 1}}>{cardWidget}</ScrollView>
        ) : (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 17, color: '#9E9E9E'}}>
              {i18n.t('main_empty_string')}
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

export default MainScreen;
