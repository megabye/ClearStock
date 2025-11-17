import {Image} from 'react-native';
import styles from './css'

const Header = () => {
  return (
    <Image
      style={styles.image}
      source={require("../images/header.jpg")}
      resizeMode="cover"
     />
  );
};

export { Header };