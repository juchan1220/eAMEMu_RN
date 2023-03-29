import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Shadow } from 'react-native-shadow-2';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';

import Hcef from '../modules/Hcef';
import CardView from '../components/Card';
import { Card } from '../types';
import { getCards, removeCard } from '../data/cards';
import { RootStackParams } from '../../App';
import { useTranslation } from 'react-i18next';

const Container = styled(View)`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
  justify-content: center;
  align-items: center;
`;

const PlaceholderText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.placeholder};
`;

const AddButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.card};
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
`;

const AddButtonIcon = styled(FontAwesome5).attrs({ name: 'plus' })`
  color: ${props => props.theme.colors.primary};
  font-size: 24px;
`;

const ListSeparator = styled.View`
  height: 16px;
`;

const CardList = (props: { cards: Card[] }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const cards = props.cards;
  const [enabledCardIndex, setEnabledCardIndex] = useState<number | null>(null);

  const { t } = useTranslation();

  const toggleHcef = useCallback(
    async (index: number) => {
      const card = cards[index];
      if (enabledCardIndex === index) {
        // disable
        await Hcef.disableService();
        setEnabledCardIndex(null);
      } else {
        await Hcef.enableService(card.sid);
        setEnabledCardIndex(index);
      }
    },
    [cards, enabledCardIndex],
  );

  const queryClient = useQueryClient();
  const deleteMutation = useMutation((index: number) => removeCard(index), {
    onSuccess: () => {
      queryClient.invalidateQueries('cards');
    },
  });

  const onDelete = useCallback(
    (index: number) => {
      const card = cards[index];

      Alert.alert(
        t('alert.title.card_remove'),
        t('alert.body.card_remove', { cardName: card.name }),
        [
          {
            text: t('alert.button.confirm'),
            onPress: () => {
              deleteMutation.mutate(index);
            },
          },
          { text: t('alert.button.cancel') },
        ],
      );
    },
    [cards, deleteMutation],
  );

  const onEdit = useCallback(
    (index: number) => {
      const card = cards[index];
      navigation.navigate('Edit', {
        index,
        card,
      });
    },
    [cards, navigation],
  );

  if (cards.length > 0) {
    return (
      <FlatList
        style={styles.cardList}
        data={cards}
        contentContainerStyle={styles.cardListContainer}
        renderItem={card => (
          <CardView
            card={card.item}
            index={card.index}
            onPress={toggleHcef}
            onEdit={onEdit}
            onDelete={onDelete}
            mainText={
              card.index === enabledCardIndex
                ? t('card.touch_to_activate')
                : t('card.touch_to_deactivate')
            }
          />
        )}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={ListSeparator}
        ListFooterComponent={ListSeparator}
      />
    );
  } else {
    return (
      <View style={styles.placeholderContainer}>
        <PlaceholderText>{t('main.please_add_a_card')}</PlaceholderText>
      </View>
    );
  }
};

type MainScreenProps = NativeStackScreenProps<RootStackParams, 'Main'>;

const MainScreen = (props: MainScreenProps) => {
  const { navigation } = props;

  // check native hcef module
  useEffect(() => {
    if (!Hcef.support) {
      Alert.alert(
        '오류',
        '이 기기는 HCE-F를 지원하지 않습니다. 다른 기기로 다시 시도해 주세요.',
        [
          {
            text: '확인',
          },
        ],
      );

      return;
    }

    if (!Hcef.enabled) {
      Alert.alert(
        '오류',
        'HCE-F 초기 설정에 실패했습니다.\n앱을 종료한 뒤, NFC를 활성화하고 다시 실행해 주세요.',
        [
          {
            text: '확인',
          },
        ],
      );

      return;
    }
  }, []);

  // load card list from async storage
  const cardsQuery = useQuery<Card[]>('cards', getCards);

  const goToAdd = useCallback(() => {
    navigation.navigate('Add');
  }, [navigation]);

  return (
    <Container>
      {cardsQuery.isSuccess ? (
        <>
          <CardList cards={cardsQuery.data} />

          <Shadow
            containerStyle={styles.addButtonContainer}
            distance={4}
            offset={[0, 2]}
          >
            {/* shadow가 정상적으로 적용되지 않는 버그가 있어서 borderRadius 스타일을 분리 */}
            <AddButton onPress={goToAdd} style={styles.addButtonRadius}>
              <AddButtonIcon />
            </AddButton>
          </Shadow>
        </>
      ) : (
        <View>
          <ActivityIndicator size={'large'} />
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  cardList: {
    alignSelf: 'stretch',
  },
  cardListContainer: {
    paddingHorizontal: 16,
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  addButtonContainer: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
  addButtonRadius: {
    borderRadius: 64,
  },
});

export default MainScreen;
