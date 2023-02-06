import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
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

import Hcef from '../modules/Hcef';
import CardView from '../components/Card';
import { Card } from '../types';
import { getCards, removeCard } from '../data/cards';
import { RootStackParams } from '../../App';
import { useNavigation } from '@react-navigation/native';

const ListSeparator = () => <View style={styles.separator} />;

const CardList = (props: { cards: Card[] }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const cards = props.cards;
  const [enabledCardIndex, setEnabledCardIndex] = useState<number | null>(null);

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

      Alert.alert('카드 삭제', `"${card.name}" 카드를 삭제하시겠습니까?`, [
        {
          text: '삭제',
          onPress: () => {
            deleteMutation.mutate(index);
          },
        },
        { text: '취소' },
      ]);
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
                ? '터치해서 비활성화'
                : '터치해서 활성화'
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
        <Text style={styles.placeholderText}>카드를 추가해 주세요.</Text>
      </View>
    );
  }
};

const AddButton = (props: { onPress?: () => unknown }) => {
  return (
    <Shadow
      containerStyle={styles.addButtonContainer}
      distance={4}
      offset={[0, 2]}
    >
      <TouchableOpacity style={styles.addButton} onPress={props.onPress}>
        <FontAwesome5 name={'plus'} style={styles.addButtonIcon} />
      </TouchableOpacity>
    </Shadow>
  );
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
    <View style={styles.container}>
      <StatusBar
        backgroundColor={'transparent'}
        barStyle={'dark-content'}
        translucent
      />
      {cardsQuery.isSuccess ? (
        <>
          <CardList cards={cardsQuery.data} />
          <AddButton onPress={goToAdd} />
        </>
      ) : (
        <View>
          <ActivityIndicator size={'large'} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  cardListContainer: {
    paddingHorizontal: 16,
  },
  separator: {
    height: 16,
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  addButtonContainer: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 64,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonIcon: {
    color: 'skyblue',
    fontSize: 24,
  },
});

export default MainScreen;
