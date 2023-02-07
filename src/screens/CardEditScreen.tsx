import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextInputFocusEventData,
  NativeSyntheticEvent,
  TouchableOpacityProps,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Shadow } from 'react-native-shadow-2';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import styled from 'styled-components/native';

import CardConv from '../modules/CardConv';
import { RootStackParams } from '../../App';
import CardView from '../components/Card';
import { addCard, updateCard } from '../data/cards';
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

const Container = styled.KeyboardAvoidingView`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const FieldTitle = styled(Text)<{ focused: boolean }>`
  font-size: 14px;
  font-weight: bold;
  color: ${props =>
    props.focused
      ? props.theme.colors.primary
      : props.theme.colors.placeholder};
`;

const FieldBottomBorder = styled.View<{ focused: boolean }>`
  padding-top: 2px;
  background-color: ${props =>
    props.focused
      ? props.theme.colors.primary
      : props.theme.colors.placeholder};
  height: ${props => (props.focused ? 2 : 1)}px;
`;

const StyledTextInput = styled.TextInput`
  font-size: 16px;
  padding-top: 4px;
  color: ${props =>
    props.editable !== false
      ? props.theme.colors.text
      : props.theme.colors.disabled};
`;

const ButtonContainer = styled.TouchableOpacity`
  height: 48px;
  background-color: ${props => props.theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  color: ${props => props.theme.colors.white};
`;

type ButtonProps = {
  text: string;
  containerStyle: ViewStyle;
} & TouchableOpacityProps;

const Button = (props: ButtonProps) => {
  const { text, containerStyle, ...touchableProps } = props;

  return (
    <Shadow
      style={styles.buttonShadowStyle}
      containerStyle={containerStyle}
      distance={4}
    >
      {/* shadow가 정상적으로 적용되지 않는 버그가 있어서 borderRadius 스타일을 분리 */}
      <ButtonContainer {...touchableProps} style={styles.buttonBorderRadius}>
        <ButtonText>{text}</ButtonText>
      </ButtonContainer>
    </Shadow>
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
      <FieldTitle focused={isFocused}>{title}</FieldTitle>
      <StyledTextInput
        onFocus={onFocusCallback}
        onBlur={onBlurCallback}
        {...textInputProps}
      />
      <FieldBottomBorder focused={isFocused} />
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
    <Container>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
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

        <View style={[styles.fieldItemContainer]}>
          <TextField
            title={'카드 이름'}
            value={cardName}
            onChangeText={onChangeCardName}
          />
        </View>

        <View style={styles.fieldItemContainer}>
          <TextField title={'카드 번호'} value={styledUid} editable={false} />
          <Button
            containerStyle={styles.cardNumberChangeButton}
            onPress={changeCardNumber}
            disabled={!uid.isSuccess}
            text={'카드 번호 변경'}
          />
        </View>

        <Button
          onPress={save}
          containerStyle={styles.saveButton}
          text={'저장'}
        />
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    padding: 16,
  },
  fieldItemContainer: {
    paddingTop: 32,
  },
  buttonShadowStyle: {
    width: '100%',
  },
  buttonBorderRadius: {
    borderRadius: 8,
  },
  saveButton: {
    marginTop: 32,
  },
  cardNumberChangeButton: {
    marginTop: 16,
  },
});

export default CardEditScreen;
