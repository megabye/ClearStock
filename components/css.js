import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const buttonSize = (width / 2) - 30; 

export default StyleSheet.create({
  container_home: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingVertical: 50,
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
    fontFamily: "Helvetica"
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
    fontFamily: "Helvetica"
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  bt: {
    width: buttonSize,
    height: buttonSize,
    backgroundColor: '#007bff',
    margin: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
    btn: {
    width: '95%',
    height: '45',
    backgroundColor: '#007bff',
    margin: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  btText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 3,
    fontFamily: "Lexend"
  },
  fullWidthButton: {
    width: width - 40,
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    fontSize: 12,
    color: '#999',
  },
  fab: {
    color: '#007bff',
    position: 'absolute',
    bottom: 45,
    right: 30,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    marginVertical: 5,
    width: '95%',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
    fontFamily: "Helvetica"
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    fontFamily: 'Arial',

  },
  separator: {
    height: 1.5,
    backgroundColor: '#007bff', 
    marginTop: 5,
    width: '100%',
    borderRadius: 2,
  },
});
