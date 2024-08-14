import { Box } from "@mantine/core";
import ModTable from "../components/ModTable";
import AddModForm from "../components/AddModForm";

export default function IndexPage() {
  return (
    <Box>
        <AddModForm />
        <ModTable />
    </Box>
  );
}