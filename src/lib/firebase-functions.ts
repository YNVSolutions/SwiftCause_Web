import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { app } from './firebase';


const functions = getFunctions(app);


if (import.meta.env.DEV) {
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    console.log('Functions emulator connection:', error);
  }
}

export { functions };
