import { getRestartRequired } from "./states";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const restartRequired = getRestartRequired();

  res.status(200).json({ restartRequired });
}
