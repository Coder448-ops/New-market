'use client';
import {useMemo,useSyncExternalStore} from 'react';
import {EMPTY,parseState,readSnapshot,subscribe} from './store';
export function useLocal(){const raw=useSyncExternalStore(subscribe,readSnapshot,()=>EMPTY);return useMemo(()=>{try{return {state:parseState(raw),error:null}}catch{return {state:parseState(EMPTY),error:'Mahalliy ma’lumot o‘qilmadi. Uni almashtirishdan oldin brauzer xotirasini tekshiring.'}}},[raw])}
