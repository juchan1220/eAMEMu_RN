import React, { useMemo, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from 'react-query';
import { Shadow } from 'react-native-shadow-2';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Clipboard from '@react-native-clipboard/clipboard';

import CardConv from '../modules/CardConv';
import { Card } from '../types';

interface CardViewProps {
  card: Card;
  index: number;
  mainText: string;
  disabledMainButton?: boolean;
  hideBottomMenu?: boolean;
  onPress?: (index: number) => unknown;
  onEdit?: (index: number) => unknown;
  onDelete?: (index: number) => unknown;
}

const CardView = (props: CardViewProps) => {
  const { card, index, onPress: onPressFromProps, onEdit, onDelete } = props;

  const onPress = useCallback(() => {
    onPressFromProps?.(index);
  }, [onPressFromProps, index]);

  const uid = useQuery(['uid', card.sid], () => CardConv.convertSID(card.sid));

  const styledUid = useMemo(() => {
    if (uid.isSuccess) {
      return (
        uid.data.match(/[A-Za-z0-9]{4}/g)?.join(' - ') ??
        '올바르지 않은 카드 번호'
      );
    } else {
      return '카드 번호 로딩중...';
    }
  }, [uid]);

  const copyUid = useCallback(() => {
    if (uid.isSuccess) {
      Clipboard.setString(uid.data);
    }
  }, [uid]);

  const onPressDelete = useCallback(() => {
    onDelete?.(index);
  }, [index, onDelete]);

  const onPressEdit = useCallback(() => {
    onEdit?.(index);
  }, [index, onEdit]);

  return (
    <>
      <Shadow
        containerStyle={styles.shadowContainer}
        style={styles.shadowChildContainerStyle}
        distance={4}
        offset={[0, 2]}
      >
        <View style={styles.background}>
          <TouchableOpacity
            style={styles.activateButton}
            onPress={onPress}
            disabled={props.disabledMainButton ?? false}
          >
            <View style={styles.topLeftArea}>
              <TouchableOpacity onPress={copyUid}>
                <Text
                  style={styles.cardNameText}
                  numberOfLines={1}
                  ellipsizeMode={'tail'}
                >
                  {card.name}
                </Text>
                <View style={styles.cardNumberContainer}>
                  <Text style={styles.cardNumberText}>{styledUid}</Text>
                  <FontAwesome5
                    name={'copy'}
                    style={[styles.cardNumberCopyIcon]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.enableText}>{props.mainText}</Text>

            {props.hideBottomMenu !== true && (
              <View style={styles.bottomMenuContainer}>
                <TouchableOpacity
                  style={styles.bottomMenuButton}
                  onPress={onPressEdit}
                >
                  <Text style={styles.bottomMenuButtonText}>편집</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bottomMenuButton}
                  onPress={onPressDelete}
                >
                  <Text style={styles.bottomMenuButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Shadow>
    </>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    flex: 1,
    aspectRatio: 85.6 / 53.98,
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
  activateButton: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  topLeftArea: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardNameText: {
    padding: 0,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardNumberText: {
    alignSelf: 'center',
    color: '#f1f1f1',
    fontSize: 14,
  },
  cardNumberCopyIcon: {
    color: '#f1f1f1',
    fontSize: 10,
    paddingLeft: 4,
  },
  enableText: {
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 24,
    color: '#FAFAFA',
    fontWeight: '500',
  },
  bottomMenuContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 48,
    flexDirection: 'row',
  },
  bottomMenuButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomMenuButtonText: {
    fontSize: 14,
    color: '#FAFAFA',
  },
});

export default CardView;
