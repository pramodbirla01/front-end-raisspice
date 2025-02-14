import { useEffect, useState } from 'react';

interface LoaderProps {
  isLoading: boolean;
}

const Loader = ({ isLoading }: LoaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const word1 = 'RICE'.split('');
  const word2 = 'SPICES'.split('');

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setIsVisible(false), 1000);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bgColor overflow-hidden">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-4 animate-scroll-text">
          {/* First Word */}
          <div className="flex">
            {word1.map((letter, index) => (
              <span
                key={`rice-${index}`}
                className="text-7xl font-bold animate-wave-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  color: 'var(--darkRed)',
                }}
              >
                {letter}
              </span>
            ))}
          </div>
          {/* Space */}
          <span className="text-7xl">&nbsp;</span>
          {/* Second Word */}
          <div className="flex">
            {word2.map((letter, index) => (
              <span
                key={`spices-${index}`}
                className="text-7xl font-bold animate-wave-up"
                style={{
                  animationDelay: `${(index + word1.length) * 0.1}s`,
                  color: 'var(--lightRed)',
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-darkRed animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-3 rounded-full bg-darkRed animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 rounded-full bg-darkRed animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};

export default Loader;
