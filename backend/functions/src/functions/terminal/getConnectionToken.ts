import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import { stripe } from '../../config';
import { ConnectionTokenResponse } from '../../types';

export const getConnectionToken = functions.https.onRequest(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const connectionToken = await stripe.terminal.connectionTokens.create();
      const response: ConnectionTokenResponse = {
        secret: connectionToken.secret,
      };
      res.status(200).json(response);
    } catch (err) {
      console.error('Error creating connection token:', err);
      res.status(500).json({ 
        error: 'Unable to create connection token' 
      });
    }
  }
);
