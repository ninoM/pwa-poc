import { useQuery } from '@tanstack/react-query';
import { Survey, surveyKeys } from '../../types';
import { supabase } from '../../supabase';
import { useIsOnline } from '../../hooks/useIsOnline';

export const useSurveys = () => {
  const isOnline = useIsOnline();

  return useQuery<Survey[] | undefined>({
    queryKey: surveyKeys.all(),
    queryFn: async () => {
      return supabase
        .from('survey')
        .select()
        .then(({ data }) => {
          return data as Survey[];
        });
    },
    staleTime: isOnline ? 0 : Infinity,
  });
};
