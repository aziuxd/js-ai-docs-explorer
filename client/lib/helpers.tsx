export function insertLinksIntoString(text: string) {
  const linkRegex =
    /(\b(?:https?:\/\/|www\.|@[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/g;

  const parts = text?.split(linkRegex);

  const elements = parts?.map((part, index) => {
    if (part?.match(linkRegex)) {
      let url = part;
      if (!/^https?:\/\//i.test(part)) {
        if (part.includes("@")) {
          url = `${part}`;
        } else if (part?.startsWith("www")) {
          url = `http://${part}`;
        }
      }
      return (
        <a href={part} key={index} target="_blank" rel="noreferrer">
          <b>{part}</b>
        </a>
      );
    }
    return part;
  });

  return (
    <p
      dangerouslySetInnerHTML={{ __html: elements }}
      style={{
        color: "#67e8f9",
      }}
    />
  );
}
