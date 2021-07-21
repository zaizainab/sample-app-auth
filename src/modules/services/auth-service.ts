import { setLoginRedis } from './redis-service';

export const login = (param, server) => new Promise((resolve, reject) => {

    const { username, password } = param;

    const errPass = validatePassword(password);
    if (errPass.message == '') { 
        server.jwt.sign({ username }, (error, encoded) => {
            if (error) {
                reject(error);
            } else {
                setLoginRedis({ username, token: encoded }, server).then(res => {
                    resolve(encoded); 
                }).catch(errRedis => {
                    reject(errRedis);
                })
            }
        });
    }
    else {
        reject(errPass);
    }
});

const validatePassword = (password) => {
    let error = {
        message: '',
    };

    if (password == '') {
        error.message += 'Password tidak boleh kosong';
    }

    if (password.length < 5) {
        error.message += 'Panjang Password minimal 5 karakter';
    }

    return error;
}