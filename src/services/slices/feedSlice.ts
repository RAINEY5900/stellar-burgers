import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeedsApi, getOrderByNumberApi, getOrdersApi } from '@api';
import { TOrder, TOrdersData } from '@utils-types';

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  profileOrders: TOrder[];
  selectedOrder: TOrder | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  profileOrders: [],
  selectedOrder: null,
  isLoading: false,
  error: null
};

export const fetchFeeds = createAsyncThunk('feed/fetchFeeds', getFeedsApi);

export const fetchProfileOrders = createAsyncThunk(
  'feed/fetchProfileOrders',
  getOrdersApi
);

export const fetchOrderByNumber = createAsyncThunk(
  'feed/fetchOrderByNumber',
  async (number: number) => {
    const res = await getOrderByNumberApi(number);
    return res.orders[0];
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Ошибка загрузки ленты заказов';
      })
      .addCase(fetchProfileOrders.fulfilled, (state, action) => {
        state.profileOrders = action.payload;
      })
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.selectedOrder = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      });
  }
});

export const { clearSelectedOrder } = feedSlice.actions;
export default feedSlice.reducer;

export const selectFeedOrders = (state: { feed: TFeedState }) =>
  state.feed.orders;
export const selectFeedTotal = (state: { feed: TFeedState }) =>
  state.feed.total;
export const selectFeedTotalToday = (state: { feed: TFeedState }) =>
  state.feed.totalToday;
export const selectProfileOrders = (state: { feed: TFeedState }) =>
  state.feed.profileOrders;
export const selectSelectedOrder = (state: { feed: TFeedState }) =>
  state.feed.selectedOrder;
export const selectFeedLoading = (state: { feed: TFeedState }) =>
  state.feed.isLoading;
