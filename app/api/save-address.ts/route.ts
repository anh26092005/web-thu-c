import type { NextApiRequest, NextApiResponse } from 'next';
import { client } from '@/sanity/lib/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const doc = req.body;
      const saved = await client.create(doc);
      res.status(200).json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi khi lưu địa chỉ' });
    }
  } else {
    res.status(405).end();
  }
}
