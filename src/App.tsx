import React from 'react';
import { InstallPWAButton } from './install-button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './lib/supabase';
import { Survey, surveyKeys } from './lib/types';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const queryClient = useQueryClient();

  const { data: surveys } = useQuery<Survey[] | undefined>({
    queryKey: surveyKeys.all(),
    queryFn: async () => {
      return supabase
        .from('survey')
        .select()
        .then(({ data }) => {
          return data as Survey[];
        });
    },
  });

  const { mutate: createSurvey, isPaused } = useMutation({
    mutationKey: surveyKeys.add(),
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
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: surveyKeys.all(),
      });
    },
    onError: (_, ___, context) => {
      queryClient.setQueryData<Survey[] | undefined>(surveyKeys.all(), (old) =>
        old?.filter((survey) => survey.id !== context?.survey.id)
      );
    },
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loc, setLoc] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    console.log('>>> value', {
      name: formData.get('name'),
      answer: formData.get('answer'),
      imageAnswer: formData.get('imageAnswer'),
    });
    console.log('>>> types', {
      name: typeof formData.get('name'),
      answer: typeof formData.get('answer'),
      imageAnswer: typeof formData.get('imageAnswer'),
    });

    try {
      setIsLoading(true);

      createSurvey({
        answer: formData.get('answer') as string,
        name: formData.get('name') as string,
      });
    } catch (e) {
      console.error(e);
      // @ts-expect-error meh
      setError(e?.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoc(`${position.coords.latitude}, ${position.coords.longitude}`);
      },
      (positionError) => {
        setLoc(positionError.message);
      }
    );
  }, []);

  return (
    <div className="flex items-center flex-col gap-2">
      <h1 className="text-xl">Retail Tasker Client</h1>
      {error && <p className="text-red-500">{error}</p>}
      <InstallPWAButton />
      {isPaused && (
        <p className="text-red-500">
          You are offline! Data will be sent when online
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 border border-stone-300 rounded-md p-3"
      >
        <label className="flex flex-col">
          <span>Name</span>
          <input name="name" type="text" className="ring ring-blue-100" />
        </label>
        <label className="flex flex-col">
          <span>Answer</span>
          <input name="answer" type="text" className="ring ring-blue-100" />
        </label>
        <label className="flex flex-col">
          Image
          <input name="imageAnswer" type="file" />
        </label>
        <button
          disabled={isLoading}
          className="border border-stone-700 w-full rounded text-xl bg-blue-600 text-stone-100 py-4"
          type="submit"
        >
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      </form>
      <div>
        <h2 className="text-2xl underline">Location</h2>
        <p>{loc}</p>
      </div>
      <div>
        <h2 className="text-2xl underline">Answers</h2>
        <ul>
          {surveys?.length === 0 && <p>No answers yet</p>}
          {surveys?.map((survey) => (
            <li key={survey.id}>
              {/* <p>{survey.image.size}</p>
              <p>{survey.image.type}</p>
              <pre className="w-60 overflow-scroll">
                {JSON.stringify({ ...survey }, null, 2)}
              </pre> */}
              <p>{survey.name}</p>
              <p>{survey.answer}</p>
              {/* <div className="w-full p-4 aspect-square object-contain">
                <img src={survey.imageUrl} alt="Survey" />
              </div>
              <div className="w-full p-4 aspect-square object-contain">
                <img src={URL.createObjectURL(survey.image)} alt="Survey" />
              </div> */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
