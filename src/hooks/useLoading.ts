import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const useLoading = () => {
  const heroSectionLoading = useSelector((state: RootState) => state.heroSection.loading);
  const collectionsLoading = useSelector((state: RootState) => state.collections.loading);

  return heroSectionLoading || collectionsLoading;
};
