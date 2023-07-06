import { useUser } from "@clerk/nextjs";

export const formatDataForUI = (dataToFormat: string) => {
  let formattedData = dataToFormat.slice(dataToFormat.indexOf(":") + 1);
  if (
    !formattedData.includes("Secondo la documentazione") &&
    !formattedData.includes("The documentation says")
  )
    return formattedData;

  return formattedData.slice(formattedData.indexOf(":") + 1);
};

export const useIndexes = async () => {
  const { user } = useUser();
  const res = await fetch(`http://localhost:4000/sql/${user?.id}`);
  const data = await res.json();

  return data;
};
