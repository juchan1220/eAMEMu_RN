import { Card } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getCards: () => Promise<Card[]> = async () => {
  const cardsJson = await AsyncStorage.getItem('cards');

  if (cardsJson === null) {
    return [];
  }

  try {
    return JSON.parse(cardsJson) as Card[];
  } catch (e) {
    return [];
  }
};

const setCards = async (cards: Card[]) => {
  await AsyncStorage.setItem('cards', JSON.stringify(cards));
};

const addCard = async (card: Card) => {
  const cards = await getCards();
  cards.push(card);
  await setCards(cards);
};

const updateCard = async (idx: number, card: Card) => {
  const cards = await getCards();
  cards[idx] = card;
  await setCards(cards);
};

const removeCard = async (idx: number) => {
  const cards = await getCards();
  cards.splice(idx, 1);
  await setCards(cards);
};

export { getCards, addCard, updateCard, removeCard };
