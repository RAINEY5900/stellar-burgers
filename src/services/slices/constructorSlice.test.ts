import reducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  closeOrderModal,
  orderBurger
} from './constructorSlice';
import { TIngredient, TOrder } from '@utils-types';

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));

const mockBun: TIngredient = {
  _id: 'bun-1',
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

const mockFilling: TIngredient = {
  _id: 'filling-1',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react-burger/meat-01.png',
  image_large: 'https://code.s3.yandex.net/react-burger/meat-01-large.png',
  image_mobile: 'https://code.s3.yandex.net/react-burger/meat-01-mobile.png'
};

const mockOrder: TOrder = {
  _id: 'order-1',
  status: 'done',
  name: 'Космический бургер',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  number: 12345,
  ingredients: ['bun-1', 'filling-1', 'bun-1']
};

describe('constructorSlice reducer', () => {
  it('возвращает начальное состояние при неизвестном экшене', () => {
    const state = reducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual({
      bun: null,
      ingredients: [],
      orderRequest: false,
      orderModalData: null,
      error: null
    });
  });

  it('добавляет булку с addIngredient', () => {
    const state = reducer(undefined, addIngredient(mockBun));
    expect(state.bun).toEqual({ ...mockBun, id: 'test-uuid' });
    expect(state.ingredients).toHaveLength(0);
  });

  it('заменяет булку при повторном addIngredient с типом bun', () => {
    const anotherBun: TIngredient = { ...mockBun, _id: 'bun-2', name: 'Другая булка' };
    let state = reducer(undefined, addIngredient(mockBun));
    state = reducer(state, addIngredient(anotherBun));
    expect(state.bun?._id).toBe('bun-2');
  });

  it('добавляет начинку с addIngredient', () => {
    const state = reducer(undefined, addIngredient(mockFilling));
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]).toEqual({ ...mockFilling, id: 'test-uuid' });
    expect(state.bun).toBeNull();
  });

  it('удаляет ингредиент с removeIngredient', () => {
    const initial = {
      bun: null,
      ingredients: [{ ...mockFilling, id: 'uuid-to-remove' }],
      orderRequest: false,
      orderModalData: null,
      error: null
    };
    const state = reducer(initial, removeIngredient('uuid-to-remove'));
    expect(state.ingredients).toHaveLength(0);
  });

  it('перемещает ингредиент с moveIngredient', () => {
    const initial = {
      bun: null,
      ingredients: [
        { ...mockFilling, id: 'uuid-1' },
        { ...mockBun, id: 'uuid-2', type: 'main' as const }
      ],
      orderRequest: false,
      orderModalData: null,
      error: null
    };
    const state = reducer(initial, moveIngredient({ fromIndex: 0, toIndex: 1 }));
    expect(state.ingredients[0].id).toBe('uuid-2');
    expect(state.ingredients[1].id).toBe('uuid-1');
  });

  it('очищает конструктор с clearConstructor', () => {
    const initial = {
      bun: { ...mockBun, id: 'test-uuid' },
      ingredients: [{ ...mockFilling, id: 'test-uuid' }],
      orderRequest: false,
      orderModalData: mockOrder,
      error: null
    };
    const state = reducer(initial, clearConstructor());
    expect(state.bun).toBeNull();
    expect(state.ingredients).toHaveLength(0);
    expect(state.orderModalData).toBeNull();
  });

  it('закрывает модальное окно заказа с closeOrderModal', () => {
    const initial = {
      bun: null,
      ingredients: [],
      orderRequest: true,
      orderModalData: mockOrder,
      error: null
    };
    const state = reducer(initial, closeOrderModal());
    expect(state.orderModalData).toBeNull();
    expect(state.orderRequest).toBe(false);
  });

  it('устанавливает orderRequest при orderBurger.pending', () => {
    const state = reducer(undefined, { type: orderBurger.pending.type });
    expect(state.orderRequest).toBe(true);
    expect(state.error).toBeNull();
  });

  it('сохраняет данные заказа при orderBurger.fulfilled', () => {
    const initial = {
      bun: { ...mockBun, id: 'test-uuid' },
      ingredients: [{ ...mockFilling, id: 'test-uuid' }],
      orderRequest: true,
      orderModalData: null,
      error: null
    };
    const state = reducer(initial, {
      type: orderBurger.fulfilled.type,
      payload: mockOrder
    });
    expect(state.orderRequest).toBe(false);
    expect(state.orderModalData).toEqual(mockOrder);
    expect(state.bun).toBeNull();
    expect(state.ingredients).toHaveLength(0);
  });

  it('устанавливает ошибку при orderBurger.rejected', () => {
    const state = reducer(undefined, {
      type: orderBurger.rejected.type,
      error: { message: 'Ошибка оформления заказа' }
    });
    expect(state.orderRequest).toBe(false);
    expect(state.error).toBe('Ошибка оформления заказа');
  });
});
