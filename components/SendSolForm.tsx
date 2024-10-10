// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import * as web3 from '@solana/web3.js'
// import { LAMPORTS_PER_SOL } from '@solana/web3.js';
// import { FC, useState } from 'react'
// import styles from '../styles/Home.module.css'


// export const SendSolForm: FC = () => {
//     const [txSig, setTxSig] = useState('');
//     const { connection } = useConnection();
//     const { publicKey, sendTransaction } = useWallet();
//     const link = () => {
//         return txSig ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet` : ''
//     }

//     const sendSol = event => {
//         event.preventDefault()
//         if (!connection || !publicKey) { return }
//         const transaction = new web3.Transaction()
//         const recipientPubKey = new web3.PublicKey(event.target.recipient.value)

//         const sendSolInstruction = web3.SystemProgram.transfer({
//             fromPubkey: publicKey,
//             toPubkey: recipientPubKey,
//             lamports: LAMPORTS_PER_SOL * event.target.amount.value
//         })

//         transaction.add(sendSolInstruction)
//         sendTransaction(transaction, connection).then(sig => {
//             setTxSig(sig)
//         })
//     }

//     return (
//         <div>
//             {
//                 publicKey ?
//                     <form onSubmit={sendSol} className={styles.form}>
//                         <label htmlFor="amount">Amount (in SOL) to send:</label>
//                         <input id="amount" type="text" className={styles.formField} placeholder="e.g. 0.1" required />
//                         <br />
//                         <label htmlFor="recipient">Send SOL to:</label>
//                         <input id="recipient" type="text" className={styles.formField} placeholder="e.g. 4Zw1fXuYuJhWhu9KLEYMhiPEiqcpKd6akw3WRZCv84HA" required />
//                         <button type="submit" className={styles.formButton}>Send</button>
//                     </form> :
//                     <span>Connect Your Wallet</span>
//             }
//             {
//                 txSig ?
//                     <div>
//                         <p>View your transaction on </p>
//                         <a href={link()}>Solana Explorer</a>
//                     </div> :
//                     null
//             }
//         </div>
//     )
// }

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FC, useState } from 'react';
import styles from '../styles/Home.module.css';

export const SendSolForm: FC = () => {
    const [txSig, setTxSig] = useState('');
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    
    const link = () => {
        return txSig ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet` : '';
    };

    const sendSol = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!connection || !publicKey) { return; }

        const recipientPubKey = new web3.PublicKey(event.currentTarget.recipient.value);
        const amount = Number(event.currentTarget.amount.value) * LAMPORTS_PER_SOL; // Convert SOL to lamports

        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: recipientPubKey,
                lamports: amount,
            })
        );

        try {
            // Fetch the latest blockhash
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey; // Set the fee payer to the sender

            // Send the transaction
            const signature = await sendTransaction(transaction, connection);
            setTxSig(signature); // Set the transaction signature for the explorer link

            // Confirm the transaction
            await connection.confirmTransaction(signature, 'confirmed');
            console.log('Transaction confirmed:', signature);
        } catch (error) {
            console.error('Error sending transaction:', error);
        }
    };

    return (
        <div>
            {publicKey ? (
                <form onSubmit={sendSol} className={styles.form}>
                    <label htmlFor="amount">Amount (in SOL) to send:</label>
                    <input id="amount" type="text" className={styles.formField} placeholder="e.g. 0.1" required />
                    <br />
                    <label htmlFor="recipient">Send SOL to:</label>
                    <input id="recipient" type="text" className={styles.formField} placeholder="e.g. 4Zw1fXuYuJhWhu9KLEYMhiPEiqcpKd6akw3WRZCv84HA" required />
                    <button type="submit" className={styles.formButton}>Send</button>
                </form>
            ) : (
                <span>Connect Your Wallet</span>
            )}
            {txSig ? (
                <div>
                    <p>View your transaction on </p>
                    <a href={link()}>Solana Explorer</a>
                </div>
            ) : null}
        </div>
    );
};
