import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  TextInputProps,
  ViewStyle,
  TextInputFocusEventData,
  NativeSyntheticEvent,
  TextStyle,
} from 'react-native';
import CardConv from '../modules/CardConv';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../../App';
import { Shadow } from 'react-native-shadow-2';
import CardView from '../components/Card';
import { addCard, updateCard } from '../data/cards';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Card } from '../types';

type TextFieldProps = TextInputProps & {
  title: string;
  containerStyle?: ViewStyle;
};

const generateRandomCardNumber = () => {
  const getRandom4Byte = () => {
    return Math.trunc(Math.random() * 65536)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
  };

  return `02FE${getRandom4Byte()}${getRandom4Byte()}${getRandom4Byte()}`;
};

const FieldTitle = (props: { title: string; style?: TextStyle }) => {
  return (
    <Text style={[styles.textInputTitle, props.style]}>{props.title}</Text>
  );
};

const TextField = (props: TextFieldProps) => {
  const { onFocus, onBlur, title, containerStyle, ...textInputProps } = props;

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const onFocusCallback = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const onBlurCallback = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  return (
    <View style={containerStyle}>
      <FieldTitle
        title={title}
        style={isFocused ? styles.textInputTitleFocused : {}}
      />
      <TextInput
        style={[
          styles.textInput,
          textInputProps.editable === false ? styles.textInputDisabled : {},
        ]}
        onFocus={onFocusCallback}
        onBlur={onBlurCallback}
        {...textInputProps}
      />
      <View
        style={[
          styles.textInputBottomBorder,
          isFocused ? styles.textInputBottomBorderFocused : {},
        ]}
      />
    </View>
  );
};

type CardAddScreenProps = NativeStackScreenProps<RootStackParams, 'Add'>;
type CardEditScreenProps = NativeStackScreenProps<RootStackParams, 'Edit'>;

const CardEditScreen = (props: CardAddScreenProps | CardEditScreenProps) => {
  const initialData = props.route.params?.card ?? undefined;

  const [mode] = useState<'add' | 'edit'>(() => {
    return initialData ? 'edit' : 'add';
  });

  const [cardName, setCardName] = useState<string>(initialData?.name ?? 'eAM');
  const [cardNumber, setCardNumber] = useState<string>(() => {
    return initialData?.sid ?? generateRandomCardNumber();
  });
  const uid = useQuery(['uid', cardNumber], () =>
    CardConv.convertSID(cardNumber),
  );

  const styledUid = useMemo(() => {
    if (!uid.isSuccess) {
      return '카드번호를 불러오는 중...';
    }

    return (
      uid.data.match(/[A-Za-z0-9]{4}/g)?.join(' - ') ??
      '잘못된 카드 번호입니다.'
    );
  }, [uid]);

  const onChangeCardName = useCallback((s: string) => {
    setCardName(s);
  }, []);

  const changeCardNumber = useCallback(() => {
    setCardNumber(generateRandomCardNumber());
  }, []);

  const queryClient = useQueryClient();
  const addMutation = useMutation(
    (card: Card) => {
      return addCard(card);
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries('cards');
        props.navigation.goBack();
      },
    },
  );
  const editMutation = useMutation(
    ({ index, card }: { index: number; card: Card }) => {
      return updateCard(index, card);
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries('cards');
        props.navigation.goBack();
      },
    },
  );

  const save = useCallback(() => {
    const card = {
      sid: cardNumber,
      name: cardName,
    };

    if (mode === 'add') {
      addMutation.mutate(card);
    } else {
      editMutation.mutate({ index: props.route.params!.index, card: card });
    }
  }, [
    addMutation,
    cardName,
    cardNumber,
    editMutation,
    mode,
    props.route.params,
  ]);

  return (
    <KeyboardAvoidingView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardPreviewContainer}>
          <CardView
            card={{
              sid: cardNumber,
              name: cardName,
            }}
            mainText={'카드 미리보기'}
            index={0 /* dummy index */}
            disabledMainButton={true}
            hideBottomMenu={true}
          />
        </View>

        <View style={[styles.fieldItemContainer, { paddingTop: 0 }]}>
          <TextField
            title={'카드 이름'}
            value={cardName}
            onChangeText={onChangeCardName}
          />
        </View>

        <View style={styles.fieldItemContainer}>
          <TextField title={'카드 번호'} value={styledUid} editable={false} />
          <Shadow
            style={styles.buttonShadowStyle}
            containerStyle={styles.cardNumberChangeButton}
            distance={4}
          >
            <TouchableOpacity
              style={[styles.button]}
              onPress={changeCardNumber}
              disabled={!uid.isSuccess}
            >
              <Text style={styles.buttonText}>카드 번호 변경</Text>
            </TouchableOpacity>
          </Shadow>
        </View>

        <Shadow
          style={styles.buttonShadowStyle}
          containerStyle={[
            styles.cardNumberChangeButton,
            styles.saveButtonContainerStyle,
          ]}
          distance={4}
        >
          <TouchableOpacity style={[styles.button]} onPress={save}>
            <Text style={styles.buttonText}>저장</Text>
          </TouchableOpacity>
        </Shadow>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    padding: 16,
  },
  cardPreviewContainer: {
    paddingBottom: 32,
  },
  fieldItemContainer: {
    paddingTop: 24,
  },
  textInput: {
    fontSize: 16,
    paddingTop: 4,
    color: 'black',
  },
  textInputDisabled: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  textInputTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9e9e9e',
  },
  textInputTitleFocused: {
    color: 'skyblue',
  },
  textInputBottomBorder: {
    paddingTop: 2,
    backgroundColor: '#9e9e9e',
    height: 1,
  },
  textInputBottomBorderFocused: {
    backgroundColor: 'skyblue',
    height: 2,
  },
  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: 'skyblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonShadowStyle: {
    width: '100%',
  },
  saveButtonContainerStyle: {
    marginTop: 32,
  },
  cardNumberChangeButton: {
    marginTop: 16,
  },
  cardImageSelectButton: {
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
  },
});

export default CardEditScreen;
