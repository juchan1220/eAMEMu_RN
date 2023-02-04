import React, { useMemo } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../types';
import { Shadow } from 'react-native-shadow-2';

interface CardViewProps {
  card: Card;
  isEnabled?: boolean;
  onPress?: (card: Card) => unknown;
  onEdit?: (card: Card) => unknown;
  onDelete?: (card: Card) => unknown;
}

const CardView = (props: CardViewProps) => {
  return (
    <Shadow
      containerStyle={styles.shadowContainer}
      style={styles.shadowChildContainerStyle}
      distance={4}
      offset={[0, 2]}>
      <View style={styles.background}>
        <Text>Card 1</Text>
      </View>
    </Shadow>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    flex: 1,
    aspectRatio: 85.6 / 53.98,
    marginHorizontal: 16,
  },
  shadowChildContainerStyle: {
    flex: 1,
    alignSelf: 'stretch',
  },
  background: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    resizeMode: 'contain',
    backgroundColor: 'skyblue',
  },
  cardNameText: {
    position: 'absolute',
    top: 20,
    left: 20,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardNumberText: {
    paddingTop: 0,
    textAlign: 'center',
    alignSelf: 'center',
    color: '#E0E0E0',
    fontSize: 14,
  },
  enableText: {
    paddingTop: 8,
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 24,
    color: '#FAFAFA',
    fontWeight: '500',
  },
  submenuText: {
    fontSize: 14,
    color: '#FAFAFA',
  },
});

export default CardView;

/*
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
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: 8,
        }}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={this.onPress.bind(this)}>
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

            <View style={{ flex: 1, justifyContent: 'center', paddingTop: 20 }}>
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
        <View style={{ height: 1, backgroundColor: '#FAFAFA' }} />
        <View style={{ height: 48, flexDirection: 'row' }}>
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
            <Text style={{ fontSize: 14, color: '#FAFAFA' }}>
              {i18n.t('card_edit')}
            </Text>
          </TouchableOpacity>
          <View style={{ width: 1, backgroundColor: '#FAFAFA' }} />
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => this.props.delete(this.props.index)}>
            <Text style={{ fontSize: 14, color: '#ffffff' }}>
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
            source={{ uri: this.props.card.image }}
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
*/
