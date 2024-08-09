import React from "react";
import { db } from "./db";
import { useLiveQuery } from "dexie-react-hooks";
import { InstallPWAButton } from "./install-button";

function App() {
  const surveys = useLiveQuery(() => db.surveys.toArray()) || [];
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loc, setLoc] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    console.log(">>> value", {
      name: formData.get("name"),
      answer: formData.get("answer"),
      imageAnswer: formData.get("imageAnswer"),
    });
    console.log(">>> types", {
      name: typeof formData.get("name"),
      answer: typeof formData.get("answer"),
      imageAnswer: typeof formData.get("imageAnswer"),
    });

    try {
      setIsLoading(true);
      await db.surveys.add({
        name: formData.get("name") as string,
        answer: formData.get("answer") as string,
        image: formData.get("imageAnswer") as Blob,
        imageUrl: URL.createObjectURL(formData.get("imageAnswer") as Blob),
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
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
      <div>
        <h2 className="text-2xl underline">Location</h2>
        <p>{loc}</p>
      </div>
      <div>
        <h2 className="text-2xl underline">Answers</h2>
        <ul>
          {surveys.length === 0 && <p>No answers yet</p>}
          {surveys.map((survey) => (
            <li key={survey.id}>
              <p>{survey.image.size}</p>
              <p>{survey.image.type}</p>
              <pre className="w-60 overflow-scroll">
                {JSON.stringify({ ...survey }, null, 2)}
              </pre>
              <p>{survey.name}</p>
              <p>{survey.answer}</p>
              <div className="w-full p-4 aspect-square object-contain">
                <img src={survey.imageUrl} alt="Survey" />
              </div>
              <div className="w-full p-4 aspect-square object-contain">
                <img src={URL.createObjectURL(survey.image)} alt="Survey" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
