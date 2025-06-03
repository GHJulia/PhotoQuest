declare module 'react-masonry-css' {
  import { ComponentType } from 'react';

  interface MasonryProps {
    breakpointCols?: number | { [key: string]: number };
    className?: string;
    columnClassName?: string;
    children?: React.ReactNode;
  }

  const Masonry: ComponentType<MasonryProps>;
  export default Masonry;
} 