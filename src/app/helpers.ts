export const parsePair = (pair: string, separator: '/' | '_') => {
    const [base, quote] = pair.split(separator);
  
    return { base, quote };
  };
  