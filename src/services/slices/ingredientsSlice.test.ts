import reducer, { fetchIngredients } from './ingredientsSlice';
import { TIngredient } from '@utils-types';

const mockIngredient: TIngredient = {
  _id: 'ingredient-1',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react-burger/bun-02.png',
  image_large: 'https://code.s3.yandex.net/react-burger/bun-02-large.png',
  image_mobile: 'https://code.s3.yandex.net/react-burger/bun-02-mobile.png'
};

describe('ingredientsSlice reducer', () => {
  it('возвращает начальное состояние при неизвестном экшене', () => {
    const state = reducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual({
      ingredients: [],
      isLoading: false,
      error: null
    });
  });

  it('устанавливает isLoading при fetchIngredients.pending', () => {
    const state = reducer(undefined, { type: fetchIngredients.pending.type });
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.ingredients).toEqual([]);
  });

  it('сохраняет ингредиенты при fetchIngredients.fulfilled', () => {
    const state = reducer(undefined, {
      type: fetchIngredients.fulfilled.type,
      payload: [mockIngredient]
    });
    expect(state.isLoading).toBe(false);
    expect(state.ingredients).toEqual([mockIngredient]);
    expect(state.error).toBeNull();
  });

  it('устанавливает ошибку при fetchIngredients.rejected', () => {
    const state = reducer(undefined, {
      type: fetchIngredients.rejected.type,
      error: { message: 'Network Error' }
    });
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Network Error');
    expect(state.ingredients).toEqual([]);
  });

  it('сбрасывает ошибку при повторном fetchIngredients.pending', () => {
    const stateWithError = reducer(undefined, {
      type: fetchIngredients.rejected.type,
      error: { message: 'Some error' }
    });
    const state = reducer(stateWithError, {
      type: fetchIngredients.pending.type
    });
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(true);
  });
});
