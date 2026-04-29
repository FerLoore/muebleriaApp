import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;

export const Layout = {
  window: {
    width,
    height: Dimensions.get('window').height,
  },
  isMobile: width < 768,
  breakpoints: {
    tablet: 768,
  },
  spacing: {
    small: 8,
    medium: 15,
    large: 20,
    xlarge: 40
  },
  borderWidth: 0.5,
  borderRadius: 8
};
