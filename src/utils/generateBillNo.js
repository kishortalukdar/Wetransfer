import crypto  from 'crypto';

export const  generateRandomBillNumber = ()=>{
    const randomBytes = crypto.randomBytes(Math.ceil(8 / 2));
    const billNumber = randomBytes.toString('hex').slice(0, 8);
    return billNumber;
}