import React, { useMemo, useCallback } from 'react';
import { StyleSheet, TextProps, TouchableOpacity, View } from 'react-native';
import { useQuery } from 'react-query';
import { Shadow } from 'react-native-shadow-2';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Clipboard from '@react-native-clipboard/clipboard';
import styled from 'styled-components/native';

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

const Background = styled.View`
  flex: 1;
  border-radius: 8px;
  justify-content: center;
  background-color: ${props => props.theme.colors.primary};
`;

const CardName = styled.Text.attrs<TextProps>({
  numberOfLines: 1,
  ellipsizeMode: 'tail',
})`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.theme.colors.white};
`;

const CardNumber = styled.Text`
  color: ${props => props.theme.colors.gray200};
  font-size: 14px;
`;

const CopyIcon = styled(FontAwesome5).attrs({ name: 'copy' })`
  color: ${props => props.theme.colors.gray200};
  font-size: 10px;
  padding-left: 4px;
`;

const ActivateButtonText = styled.Text`
  text-align: center;
  align-self: center;
  font-size: 24px;
  font-weight: 500;
  color: ${props => props.theme.colors.white};
`;

const BottomButtonText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.white};
`;

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
        <Background>
          <TouchableOpacity
            style={styles.activateButton}
            onPress={onPress}
            disabled={props.disabledMainButton ?? false}
          >
            <View style={styles.topLeftArea}>
              <TouchableOpacity onPress={copyUid}>
                <CardName>{card.name}</CardName>
                <View style={styles.cardNumberContainer}>
                  <CardNumber>{styledUid}</CardNumber>
                  <CopyIcon />
                </View>
              </TouchableOpacity>
            </View>

            <ActivateButtonText>{props.mainText}</ActivateButtonText>

            {props.hideBottomMenu !== true && (
              <View style={styles.bottomMenuContainer}>
                <TouchableOpacity
                  style={styles.bottomMenuButton}
                  onPress={onPressEdit}
                >
                  <BottomButtonText>편집</BottomButtonText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bottomMenuButton}
                  onPress={onPressDelete}
                >
                  <BottomButtonText>삭제</BottomButtonText>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </Background>
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
  activateButton: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  topLeftArea: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default CardView;
