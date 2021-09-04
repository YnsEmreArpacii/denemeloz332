import { createSelector, createSlice } from '@reduxjs/toolkit';
import { WS } from '../types/ws';
import { actions as api } from './api';
import { unique } from './utils/filter';

const slice = createSlice({
  name: 'members',
  initialState: [] as Store.AppState['entities']['members'],
  reducers: {
    fetched: (members, { payload }: Store.Action<Entity.GuildMember[]>) => {
      members.push(...payload.filter(unique(members)));
    },
    added: (members, { payload }: Store.Action<WS.Args.GuildMemberAdd>) => {
      members.push(payload.member);
    },
    removed: (members, { payload }: Store.Action<WS.Args.GuildMemberRemove>) => {
      const index = members.findIndex(m => m.guildId === payload.guildId && m.userId === payload.userId);      
      members.splice(index, 1);
    },
    updated: (members, { payload }: Store.Action<WS.Args.GuildMemberUpdate>) => {
      const member = members.find(m => m.id === payload.memberId);
      Object.assign(member, payload.partialMember);
    },
  },
});

export const actions = slice.actions;
export default slice.reducer;

export const joinGuild = (inviteCode: string) => (dispatch) => {
  dispatch(api.wsCallBegan({
    event: 'GUILD_MEMBER_ADD',
    data: { inviteCode } as WS.Params.GuildMemberAdd,
  }));
}

export const leaveGuild = (guildId: string) => (dispatch, getState: () => Store.AppState) => {
  const user = getState().auth.user!;

  dispatch(api.wsCallBegan({
    event: 'GUILD_MEMBER_REMOVE',
    data: { guildId, userId: user.id } as WS.Params.GuildMemberRemove,
  }));
}

export const kickMember = (guildId: string, userId: string) => (dispatch) => {
  dispatch(api.wsCallBegan({
    event: 'GUILD_MEMBER_REMOVE',
    data: { guildId, userId } as WS.Params.GuildMemberRemove,
  }));
}

export const updateMember = (memberId: string, options: Partial<Entity.GuildMember>) => (dispatch) => {
  dispatch(api.wsCallBegan({
    event: 'GUILD_MEMBER_UPDATE',
    data: { memberId, ...options } as WS.Params.GuildMemberUpdate,
  }));
}

export const getMember = (guildId: string, userId: string) =>
createSelector<Store.AppState, Entity.GuildMember[], Entity.GuildMember | undefined>(
  state => state.entities.members,
  members => members.find(m => m.guildId === guildId && m.userId === userId),
);

export const getSelfMember = (guildId: string | undefined) =>
createSelector<Store.AppState, any, Entity.GuildMember | undefined>(
  state => ({ user: state.auth.user, members: state.entities.members }),
  ({ user, members }) => members.find(m => m.guildId === guildId && m.userId === user.id),
);

export const filterByRole = (roleId: string) => 
createSelector<Store.AppState, Entity.GuildMember[], Entity.GuildMember[]>(
  state => state.entities.members,
  members => members.filter(m => m.roleIds.includes(roleId)),
);