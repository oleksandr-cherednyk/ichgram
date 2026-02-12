import { Link } from 'react-router-dom';

type CaptionTextProps = {
  text: string;
};

export const CaptionText = ({ text }: CaptionTextProps) => {
  const parts = text.split(/(#\w+)/g);

  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <Link
            key={i}
            to={`/tags/${part.slice(1).toLowerCase()}`}
            className="text-[#00376B] hover:underline"
          >
            {part}
          </Link>
        ) : (
          part
        ),
      )}
    </>
  );
};
