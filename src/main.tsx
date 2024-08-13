import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { MutationCache, QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { supabase } from './lib/supabase.ts';
import { Survey, surveyKeys } from './lib/types.ts';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const persister = createAsyncStoragePersister({
  storage: window.localStorage,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      staleTime: Infinity,
      retry: 0,
    },
  },
  mutationCache: new MutationCache({}),
});

queryClient.setMutationDefaults(surveyKeys.add(), {
  mutationFn: async ({ id, answer, name }: Survey) => {
    await queryClient.cancelQueries({ queryKey: surveyKeys.all() });
    await supabase.from('survey').insert([{ id, name, answer }]);
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
      onSuccess={() => {
        queryClient.resumePausedMutations();
      }}
    >
      <App />
      <ReactQueryDevtools />
    </PersistQueryClientProvider>
  </React.StrictMode>
);
