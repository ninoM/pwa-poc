import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { supabase } from './lib/supabase.ts';
import { Survey, surveyKeys } from './lib/types.ts';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { v4 as uuidv4 } from 'uuid';

const persister = createAsyncStoragePersister({
  storage: window.localStorage,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      gcTime: Infinity,
    },
  },
});

queryClient.setMutationDefaults(surveyKeys.add(), {
  mutationFn: async ({ answer, name }: Omit<Survey, 'id'>) => {
    await supabase.from('survey').insert([{ name, answer }]);
  },
  onMutate: async ({ answer, name }) => {
    await queryClient.cancelQueries({ queryKey: surveyKeys.all() });

    const survey = { id: uuidv4(), name, answer };

    queryClient.setQueryData<Survey[]>(surveyKeys.all(), (old) => {
      const newSurvey: Survey = { id: uuidv4(), name, answer };
      return old ? [...old, newSurvey] : [newSurvey];
    });

    return { survey };
  },
  onSuccess: (result, _, context) => {
    queryClient.setQueryData<Survey[] | undefined>(
      surveyKeys.all(),
      (old) =>
        old?.map((survey) =>
          survey.id === context.survey.id ? result : survey
        ) as Survey[] | undefined
    );
  },
  onError: (_, ___, context) => {
    queryClient.setQueryData<Survey[] | undefined>(surveyKeys.all(), (old) =>
      old?.filter((survey) => survey.id !== context?.survey.id)
    );
  },
  retry: 3,
});

const _Root = () => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <App />
      <ReactQueryDevtools />
    </PersistQueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <_Root />
  </React.StrictMode>
);
