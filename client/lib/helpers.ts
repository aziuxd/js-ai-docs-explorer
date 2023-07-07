export const formatDataForUI = (dataToFormat: string) => {
  let formattedData = dataToFormat.slice(dataToFormat.indexOf(":") + 1);
  if (
    !formattedData.includes("Secondo la documentazione:") &&
    !formattedData.includes("The documentation says:")
  )
    return formattedData;

  return formattedData.slice(formattedData.indexOf(":") + 1);
};
