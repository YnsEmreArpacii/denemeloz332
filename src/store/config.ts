import { createSlice } from '@reduxjs/toolkit';

const get = (key: keyof Store.AppState['config']) =>
  JSON.parse(localStorage.getItem(`config.${key as string}`) as any);
const set = (key: keyof Store.AppState['config'], value: any) =>
  JSON.parse(localStorage.setItem(`config.${key as string}`, value) as any);

const slice = createSlice({
  name: 'config',
  initialState: {
    memberListToggled: get('memberListToggled') ?? true,
  } as Store.AppState['config'],
  reducers: {
    toggleMemberList: (config) => {
      const value = !config.memberListToggled;
      config.memberListToggled = value;
    },
  }
})
const actions = slice.actions;
export default slice.reducer;

export const toggleMemberList = () => (dispatch, getState: () => Store.AppState) => {
  const config = getState().config;

  dispatch(actions.toggleMemberList());
  set('memberListToggled', !config.memberListToggled);
}