import { setRestartRequired } from "./states";
import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";

const restartManager = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    exec("supervisorctl restart sptserver", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error restarting service: ${error.message}`);
        return res.status(500).json({ message: "Failed to restart service" });
      }

      if (stderr) {
        console.error(`Supervisor error: ${stderr}`);
        return res.status(500).json({ message: "Supervisor error" });
      }

      console.log(`Service restarted: ${stdout}`);

      setRestartRequired(false);
      return res.status(200).json({ message: "Restart successful" });
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default restartManager;
