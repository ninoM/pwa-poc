import Dexie, { EntityTable } from "dexie";

interface Survey {
  id: number;
  name: string;
  answer: string;
  image: Blob;
  imageUrl: string;
}

const db = new Dexie("SurveysDatabase") as Dexie & {
  surveys: EntityTable<Survey, "id">;
};

db.version(3).stores({
  surveys: "++id, name, answer ,image, imageUrl",
});

export type { Survey };
export { db };
