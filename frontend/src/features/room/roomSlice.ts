import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface RoomState {
  roomId: string | null;
  code: string;
}

const initialState: RoomState = {
  roomId: null,
  code: "",
};

const slice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoomId(state, a: PayloadAction<string>) {
      state.roomId = a.payload;
    },
    setCode(state, a: PayloadAction<string>) {
      state.code = a.payload;
    },
  },
});

export const { setRoomId, setCode } = slice.actions;
export default slice.reducer;
